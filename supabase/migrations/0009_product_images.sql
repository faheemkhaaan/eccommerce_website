-- Product photography.
--
-- Uploads replace the old "paste an image URL" field. Files live in the
-- `product-images` storage bucket; `product_images` records which of them belong
-- to a product and in what order. `products.image` stays as the denormalised
-- cover URL, so every storefront surface keeps reading a single column.
--
-- Safe to re-run: the bucket is upserted and each policy is dropped first.

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

-- Public on purpose: these are product photos, served straight from the CDN to
-- anon shoppers. "Public" only means reads; the policies below still gate writes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'product-images',
    'product-images',
    true,
    5242880, -- 5 MB, mirrored by MAX_IMAGE_BYTES in lib/product-images.ts
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
    set public = excluded.public,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product images are public" on storage.objects;
create policy "product images are public"
    on storage.objects
    for select
    to anon, authenticated
    using (bucket_id = 'product-images');

drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'product-images' and public.has_role((select auth.uid()), 'admin'));

drop policy if exists "admins replace product images" on storage.objects;
create policy "admins replace product images"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'product-images' and public.has_role((select auth.uid()), 'admin'))
    with check (bucket_id = 'product-images' and public.has_role((select auth.uid()), 'admin'));

drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'product-images' and public.has_role((select auth.uid()), 'admin'));

-- ---------------------------------------------------------------------------
-- Gallery rows
-- ---------------------------------------------------------------------------

create table if not exists public.product_images (
    id uuid primary key default gen_random_uuid(),
    product_id text not null references public.products (id) on delete cascade,
    -- The object key inside the bucket, e.g. "bilona-organic-ghee/<uuid>.jpg".
    path text not null,
    alt text,
    -- Lowest sort_order is the cover; products.image is kept pointing at it.
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    unique (product_id, path)
);

comment on table public.product_images is
    'Product gallery. path is an object key in the product-images bucket; the lowest sort_order is the cover.';

create index if not exists product_images_product_id_idx
    on public.product_images (product_id, sort_order);

alter table public.product_images enable row level security;

-- Same visibility rule as product_packs: shoppers see the photos of a live
-- product, staff additionally see the ones on a hidden product.
drop policy if exists "read product_images" on public.product_images;
create policy "read product_images"
    on public.product_images
    for select
    to anon, authenticated
    using (
        exists (
            select 1
            from public.products pr
            where pr.id = product_images.product_id
              and (pr.is_active or public.has_role((select auth.uid()), 'admin'))
        )
    );

drop policy if exists "admins write product_images" on public.product_images;
create policy "admins write product_images"
    on public.product_images
    for all
    to authenticated
    using (public.has_role((select auth.uid()), 'admin'))
    with check (public.has_role((select auth.uid()), 'admin'));
