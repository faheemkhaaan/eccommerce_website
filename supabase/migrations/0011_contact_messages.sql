-- Messages customers send to the shop.
--
-- Before this the storefront had no way to reach staff at all: the footer showed
-- a phone number and the copy promised WhatsApp support, but nothing was wired
-- up, and there was no inbox on the other side. This is that inbox.
--
-- Two rules shape the file:
--
--   1. Anyone may write, signed in or not. Order tracking is a public lookup, so
--      a guest holding a wrong parcel must be able to complain without first
--      creating an account. At least one reply channel is therefore required —
--      an email or a phone — enforced by a CHECK rather than by the form.
--   2. Only staff read the queue. There is no select policy for customers: a
--      message is between its sender and the shop.
--
-- The sender's account is stamped by a trigger from the session rather than
-- taken from the request, so a message cannot be filed under someone else's
-- account, and the status cannot be pre-set to `handled`.

create type public.contact_status as enum (
    'new',       -- arrived, nobody has looked at it yet
    'handled'    -- answered or otherwise dealt with
);

comment on type public.contact_status is
    'Where a customer message sits in the staff inbox. Only `new` needs attention.';

create table public.contact_messages (
    id uuid primary key default gen_random_uuid(),

    -- Null for a guest. Stamped from the session by the trigger below.
    user_id uuid references auth.users (id) on delete set null,

    -- The order the customer is asking about, exactly as they gave it. Plain text
    -- on purpose: a typo must not fail the insert with a foreign-key error, and
    -- the value is context for staff rather than something the app joins on.
    order_ref text check (char_length(btrim(order_ref)) <= 40),

    name text not null check (char_length(btrim(name)) between 1 and 80),
    email text check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' and char_length(email) <= 160),
    phone text check (char_length(phone) <= 20),

    topic text not null default 'other'
        check (topic in ('order', 'product', 'return', 'other')),

    body text not null check (char_length(btrim(body)) between 10 and 2000),

    status public.contact_status not null default 'new',
    created_at timestamptz not null default now(),
    handled_at timestamptz,

    -- Somewhere to reply. Without this a message is a dead end, and the shop
    -- would have to go hunting for the customer by name.
    constraint contact_messages_reachable
        check (email is not null or phone is not null)
);

comment on table public.contact_messages is
    'Customer messages to the shop. Readable only by admins; anyone may insert.';
comment on column public.contact_messages.order_ref is
    'Order ID as typed by the customer. Deliberately not a foreign key, so a typo still reaches staff.';
comment on column public.contact_messages.user_id is
    'Account that sent it, stamped from the session. Null for a guest.';

create index contact_messages_queue_idx
    on public.contact_messages (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Stamping
-- ---------------------------------------------------------------------------

/**
 * Files a new message under the session that sent it, and pins it to `new`.
 *
 * Definer, so the assignment cannot be blocked by RLS, and so `auth.uid()` is
 * read from the session rather than trusted from the request body. A signed-in
 * customer cannot post anonymously, and nobody can arrive pre-handled.
 */
create or replace function public.stamp_contact_sender()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    new.user_id := auth.uid();
    new.status := 'new';
    new.handled_at := null;

    new.name := btrim(new.name);
    new.body := btrim(new.body);
    new.email := nullif(btrim(coalesce(new.email, '')), '');
    new.phone := nullif(btrim(coalesce(new.phone, '')), '');
    new.order_ref := nullif(btrim(coalesce(new.order_ref, '')), '');

    return new;
end;
$$;

comment on function public.stamp_contact_sender() is
    'Files a contact message under the sending session and forces status `new`.';

create trigger contact_messages_stamp_sender
    before insert on public.contact_messages
    for each row execute function public.stamp_contact_sender();

-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------

alter table public.contact_messages enable row level security;

-- Anyone may write — including a signed-out guest with a delivery problem. The
-- trigger has already pinned user_id to the session and status to `new` by the
-- time this runs, so these clauses only ever confirm what it wrote.
create policy "anyone may write to the shop"
    on public.contact_messages
    for insert
    to anon, authenticated
    with check (
        status = 'new'
        and handled_at is null
        and user_id is not distinct from (select auth.uid())
    );

-- The inbox is staff-only. Customers do not read the queue back — a message is
-- between its sender and the shop.
create policy "admins read the inbox"
    on public.contact_messages
    for select
    to authenticated
    using (public.has_role((select auth.uid()), 'admin'));

create policy "admins handle messages"
    on public.contact_messages
    for update
    to authenticated
    using (public.has_role((select auth.uid()), 'admin'))
    with check (public.has_role((select auth.uid()), 'admin'));

create policy "admins delete messages"
    on public.contact_messages
    for delete
    to authenticated
    using (public.has_role((select auth.uid()), 'admin'));
