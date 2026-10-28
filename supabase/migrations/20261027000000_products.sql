-- Inventario público y bucket de imágenes.
-- Escritura solo si el JWT tiene app_metadata.role = "admin".
-- Después de crear el usuario en Authentication:
--   update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
--   where email = 'correo-del-admin';

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  description text not null default '',
  price_gtq numeric(12, 2) not null,
  stock integer not null default 0,
  category text not null,
  image_url text,
  is_available boolean not null default true,
  constraint products_title_not_blank check (char_length(btrim(title)) > 0),
  constraint products_category_not_blank check (char_length(btrim(category)) > 0),
  constraint products_price_nonnegative check (price_gtq >= 0),
  constraint products_stock_nonnegative check (stock >= 0)
);

create index products_available_created_at_idx
  on public.products (created_at desc)
  where is_available;

alter table public.products enable row level security;

revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

create policy "Public reads available products"
  on public.products
  for select
  to anon, authenticated
  using (is_available or public.is_admin());

create policy "Admins insert products"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins update products"
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete products"
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public reads product images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Admins insert product images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins update product images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins delete product images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
