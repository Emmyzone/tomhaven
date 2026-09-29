-- =====================================================================
-- TomHaven database setup
-- Run this whole file once in Supabase: SQL Editor > New query > Run.
-- It is safe to run again; it will not duplicate data.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. Admins
-- Only users listed here are treated as administrators.
-- Users are added by you in the SQL Editor (see README section 9),
-- never from the website, so nobody can make themselves an admin.
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "Users can read their own admin row" on public.admins;
create policy "Users can read their own admin row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 2. Products
-- "category" lets you add laptops or repairs later without a new table.
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'phone',
  name text not null,
  brand text,
  model text,
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'NGN',
  storage text,
  ram text,
  condition text,
  colour text,
  battery_health text,
  sim_type text,
  network_status text,
  description text,
  image_url text,
  image_path text,
  status text not null default 'available' check (status in ('available', 'sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_status_idx
  on public.products (category, status);
create index if not exists products_created_at_idx
  on public.products (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products"
  on public.products for select
  using (true);

drop policy if exists "Admins can add products" on public.products;
create policy "Admins can add products"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can edit products" on public.products;
create policy "Admins can edit products"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 3. Business settings (one row, edited from Admin > Settings)
-- ---------------------------------------------------------------------
create table if not exists public.business_settings (
  id int primary key default 1 check (id = 1),
  business_name text not null default 'TomHaven',
  seller_name text not null default 'Akintomide',
  whatsapp_number text not null default '09015129819',
  delivery_text text not null default 'Delivery available anywhere in Nigeria',
  about_text text not null default 'TomHaven is a mobile phone business offering a selection of smartphones with delivery available across Nigeria. Browse available devices and contact Akintomide directly on WhatsApp to confirm availability and place your order.',
  updated_at timestamptz not null default now()
);

insert into public.business_settings (id) values (1)
on conflict (id) do nothing;

drop trigger if exists business_settings_set_updated_at on public.business_settings;
create trigger business_settings_set_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();

alter table public.business_settings enable row level security;

drop policy if exists "Anyone can view business settings" on public.business_settings;
create policy "Anyone can view business settings"
  on public.business_settings for select
  using (true);

drop policy if exists "Admins can edit business settings" on public.business_settings;
create policy "Admins can edit business settings"
  on public.business_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 4. Permissions for the public API
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant select on public.products, public.business_settings to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant update on public.business_settings to authenticated;
grant select on public.admins to authenticated;

-- ---------------------------------------------------------------------
-- 5. Storage bucket for product photos
-- Public bucket: anyone can VIEW photos, only admins can add or remove.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Admins can view product images" on storage.objects;
create policy "Admins can view product images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can replace product images" on storage.objects;
create policy "Admins can replace product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ---------------------------------------------------------------------
-- 6. First product
-- Only the details you supplied. Condition and description are left
-- empty on purpose: add them from Admin > Products > Edit.
-- ---------------------------------------------------------------------
insert into public.products (category, name, brand, model, price, currency, storage, sim_type, status)
select 'phone', 'iPhone 14 Pro', 'Apple', 'iPhone 14 Pro', 735000, 'NGN', '128GB', 'Physical SIM + eSIM', 'available'
where not exists (
  select 1 from public.products where name = 'iPhone 14 Pro' and price = 735000
);
