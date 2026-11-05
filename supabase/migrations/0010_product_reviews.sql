-- Verified-purchase product reviews.
--
-- Two rules shape this whole file:
--
--   1. Only someone who actually received the product may review it. The proof is
--      an order of theirs in the `delivered` state that contains that product, so
--      `reviewable_order()` — not the client — decides which order a review hangs
--      off. Nobody can review a jar they never bought.
--   2. Nothing reaches the storefront until staff publish it. A new review is
--      `pending`; the RLS insert policy refuses any other status, so a customer
--      cannot approve their own words, however they call the API.
--
-- The author's display name is derived from their delivery name by a trigger
-- rather than taken from the request, so a reviewer cannot sign someone else's
-- name to a review.

create type public.review_status as enum (
    'pending',    -- submitted, waiting for staff
    'published'   -- live on the product page and counted in the rating
);

comment on type public.review_status is
    'Moderation state. Only `published` reviews are public and scored.';

create table public.product_reviews (
    id uuid primary key default gen_random_uuid(),
    product_id text not null references public.products (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,

    -- The delivered order that earns the right to this review. Set by the client
    -- but validated against reviewable_order() in the insert policy, so it cannot
    -- be pointed at somebody else's parcel.
    order_id text references public.orders (id) on delete set null,

    -- Filled in by the trigger below, never by the request.
    author_name text not null default 'Verified buyer',

    rating smallint not null check (rating between 1 and 5),
    title text check (char_length(title) <= 80),
    body text not null check (char_length(btrim(body)) between 10 and 1500),

    status public.review_status not null default 'pending',
    created_at timestamptz not null default now(),
    published_at timestamptz,

    -- One review per customer per product. Editing is deliberately not supported:
    -- re-reviewing means staff removing the old row first.
    unique (user_id, product_id)
);

comment on table public.product_reviews is
    'Customer reviews of a product, each tied to a delivered order. Only published rows are public.';
comment on column public.product_reviews.order_id is
    'The delivered purchase that qualified this review. Validated by the insert policy, not trusted from the request.';
comment on column public.product_reviews.author_name is
    'First name from the delivery address, written by a trigger so the request cannot fake it.';

create index product_reviews_product_idx
    on public.product_reviews (product_id, status, created_at desc);
create index product_reviews_queue_idx
    on public.product_reviews (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Who may review what
-- ---------------------------------------------------------------------------

/**
 * The order that earns the caller the right to review a product: their most
 * recent delivered order containing it, or null if they never received one.
 * Definer so the answer does not depend on the caller's row visibility, and
 * scoped to auth.uid() so it cannot be used to inspect other people's orders.
 */
create or replace function public.reviewable_order(p_product_id text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
    select o.id
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.user_id = auth.uid()
      and o.status = 'delivered'
      and oi.product_id = p_product_id
    order by o.delivered_at desc nulls last, o.placed_at desc
    limit 1;
$$;

comment on function public.reviewable_order(text) is
    'Delivered order id that lets the caller review this product, or null. Drives both the form and the insert policy.';

/** True when the caller may still post a review for this product. */
create or replace function public.can_review_product(p_product_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select public.reviewable_order(p_product_id) is not null
       and not exists (
           select 1
           from public.product_reviews r
           where r.user_id = auth.uid()
             and r.product_id = p_product_id
       );
$$;

comment on function public.can_review_product(text) is
    'True when the caller bought and received this product and has not reviewed it yet.';

revoke execute on function public.reviewable_order(text) from public;
revoke execute on function public.can_review_product(text) from public;
grant execute on function public.reviewable_order(text) to authenticated;
grant execute on function public.can_review_product(text) to authenticated;

-- Takes the author's name from the delivery address and forces the row back to
-- pending, so neither can be set by whoever is posting the review.
create or replace function public.stamp_review_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_name text;
begin
    select o.customer_name into v_name
    from public.orders o
    where o.id = new.order_id;

    new.author_name := coalesce(
        nullif(split_part(btrim(coalesce(v_name, '')), ' ', 1), ''),
        'Verified buyer'
    );
    new.status := 'pending';
    new.published_at := null;

    return new;
end;
$$;

create trigger product_reviews_stamp_author
    before insert on public.product_reviews
    for each row execute function public.stamp_review_author();

-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------

alter table public.product_reviews enable row level security;

-- Published reviews are public — the storefront reads them with the anon key so
-- it can prerender them. A signed-in author may read their own pending review
-- back, and staff see the whole queue.
create policy "read published reviews"
    on public.product_reviews
    for select
    to anon, authenticated
    using (
        status = 'published'
        or user_id = (select auth.uid())
        or public.has_role((select auth.uid()), 'admin')
    );

-- The only way a customer writes a row: their own name on it, pending, scored
-- against the order the database itself considers reviewable.
create policy "verified buyers post reviews"
    on public.product_reviews
    for insert
    to authenticated
    with check (
        user_id = (select auth.uid())
        and status = 'pending'
        and order_id = public.reviewable_order(product_id)
    );

-- Staff moderate. There is no client update policy: publishing is staff-only.
create policy "admins moderate reviews"
    on public.product_reviews
    for update
    to authenticated
    using (public.has_role((select auth.uid()), 'admin'))
    with check (public.has_role((select auth.uid()), 'admin'));

-- Deleting is how staff reject a review — and how they let a customer try again,
-- since the unique (user_id, product_id) constraint would otherwise lock them out.
create policy "admins remove reviews"
    on public.product_reviews
    for delete
    to authenticated
    using (public.has_role((select auth.uid()), 'admin'));
