-- Editable catalogue.
--
-- The commercial fields the shop owner actually changes — pack sizes, prices and
-- stock — live here. Descriptive editorial copy (gallery, benefits, nutrition,
-- comparison table) stays in code for now and can move in a later pass.

create table public.products (
    id text primary key,
    name text not null,
    short text not null,
    image text not null,
    badge text,
    sort_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.products is
    'Sellable products. Commercial fields only; editorial copy still lives in code.';

create table public.product_packs (
    id uuid primary key default gen_random_uuid(),
    product_id text not null references public.products (id) on delete cascade,
    label text not null,
    grams integer not null check (grams > 0),
    price numeric(10, 2) not null check (price >= 0),
    note text,
    stock integer not null default 0 check (stock >= 0),
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (product_id, label)
);

comment on table public.product_packs is
    'One row per pack size. price is in PKR; stock drives the quantity stepper and sold-out state.';

create index product_packs_product_id_idx on public.product_packs (product_id);

alter table public.products enable row level security;
alter table public.product_packs enable row level security;

-- Anyone may read the live catalogue. Staff additionally see inactive products,
-- which is what makes a "hide this from the shop" toggle usable.
create policy "read products"
    on public.products
    for select
    to anon, authenticated
    using (is_active or public.has_role((select auth.uid()), 'admin'));

create policy "read product_packs"
    on public.product_packs
    for select
    to anon, authenticated
    using (
        exists (
            select 1
            from public.products pr
            where pr.id = product_packs.product_id
              and (pr.is_active or public.has_role((select auth.uid()), 'admin'))
        )
    );

-- Only staff may change the catalogue. This is the real security boundary: the
-- dashboard only decides what a person sees, RLS decides what they can do.
create policy "admins write products"
    on public.products
    for all
    to authenticated
    using (public.has_role((select auth.uid()), 'admin'))
    with check (public.has_role((select auth.uid()), 'admin'));

create policy "admins write product_packs"
    on public.product_packs
    for all
    to authenticated
    using (public.has_role((select auth.uid()), 'admin'))
    with check (public.has_role((select auth.uid()), 'admin'));

create trigger products_touch_updated_at
    before update on public.products
    for each row execute function public.touch_updated_at();

create trigger product_packs_touch_updated_at
    before update on public.product_packs
    for each row execute function public.touch_updated_at();

-- Seed the one product the shop sells today, matching the values that were
-- hard-coded in lib/products.ts so nothing shifts on the first render.
insert into public.products (id, name, short, image, badge, sort_order) values (
    'bilona-organic-ghee',
    'Bilona Organic Ghee',
    'Slow-churned from cultured curd, grass-fed desi cows',
    'https://images.unsplash.com/photo-1707425197254-266fec098cae?q=80&fm=jpg&fit=crop&w=900',
    'Bestseller',
    0
);

-- Stock figures are placeholders for the demo and are meant to be edited from
-- /admin/products. The 1 kg figure carries over the old stockLeft value of 18.
insert into public.product_packs (product_id, label, grams, price, note, stock, sort_order) values
    ('bilona-organic-ghee', '500 g', 500, 1750, 'Glass jar · ~22 servings', 24, 0),
    ('bilona-organic-ghee', '1 kg', 1000, 3250, 'Glass jar · ~45 servings', 18, 1),
    ('bilona-organic-ghee', '2 kg', 2000, 6150, 'Steel tin · ~90 servings', 9, 2),
    ('bilona-organic-ghee', '5 kg', 5000, 14500, 'Bulk tin · best value', 4, 3);
