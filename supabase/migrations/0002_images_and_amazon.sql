-- ============================================================
-- Set the Table — phase 4: AI hero images + Amazon monetization
-- ============================================================

-- ---------- scenarios.generated_hero_url ----------
-- Overrides hero_image_url when present (an AI-generated hero saved in storage).

alter table scenarios
  add column if not exists generated_hero_url text,
  add column if not exists generated_at timestamptz;

-- ---------- products: Amazon / monetization fields ----------

alter table products
  add column if not exists is_my_product boolean not null default false,
  add column if not exists asin text,
  add column if not exists retailer_name text;

create index if not exists idx_products_my on products(is_my_product) where is_my_product = true;

-- ---------- Storage bucket for AI-generated heroes ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'scenario-heroes',
  'scenario-heroes',
  true,
  5242880,                                                -- 5 MB max
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read (bucket public=true also enables this, but explicit is safer)
drop policy if exists "public read scenario-heroes" on storage.objects;
create policy "public read scenario-heroes"
  on storage.objects for select
  using (bucket_id = 'scenario-heroes');

-- Only service_role can write (no insert/update/delete policies = denied for anon/authenticated)
