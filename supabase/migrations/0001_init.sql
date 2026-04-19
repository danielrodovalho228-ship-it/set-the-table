-- ============================================================
-- Set the Table — initial schema
-- Tables: products, scenarios, scenario_items, favorites,
--         custom_setups, custom_setup_items
-- RLS: public read on catalog; per-user read/write on personal data.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- catalog ----------

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  category text not null,
  style text not null,
  price_cents integer not null check (price_cents >= 0),
  per_guest boolean not null default false,
  image_url text not null,
  retailer_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category);

create table if not exists scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  occasion text not null,
  style text not null,
  description text not null,
  hero_image_url text not null,
  default_guest_count integer not null default 6 check (default_guest_count > 0),
  budget_tier text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_scenarios_occasion on scenarios(occasion);

create table if not exists scenario_items (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references scenarios(id) on delete cascade,
  slot text not null,
  product_id uuid not null references products(id),
  unique (scenario_id, slot)
);

-- ---------- user data ----------

create table if not exists favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id uuid not null references scenarios(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, scenario_id)
);

create table if not exists custom_setups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  base_scenario_id uuid references scenarios(id) on delete set null,
  name text not null,
  guest_count integer not null default 6 check (guest_count > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_custom_setups_user on custom_setups(user_id);

create table if not exists custom_setup_items (
  setup_id uuid not null references custom_setups(id) on delete cascade,
  slot text not null,
  product_id uuid not null references products(id),
  primary key (setup_id, slot)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table products           enable row level security;
alter table scenarios          enable row level security;
alter table scenario_items     enable row level security;
alter table favorites          enable row level security;
alter table custom_setups      enable row level security;
alter table custom_setup_items enable row level security;

-- Public read on catalog
drop policy if exists "public read products"        on products;
drop policy if exists "public read scenarios"       on scenarios;
drop policy if exists "public read scenario_items"  on scenario_items;

create policy "public read products"       on products       for select using (true);
create policy "public read scenarios"      on scenarios      for select using (true);
create policy "public read scenario_items" on scenario_items for select using (true);

-- Favorites: owner-only
drop policy if exists "favorites select own"  on favorites;
drop policy if exists "favorites insert own"  on favorites;
drop policy if exists "favorites delete own"  on favorites;
create policy "favorites select own" on favorites for select using (auth.uid() = user_id);
create policy "favorites insert own" on favorites for insert with check (auth.uid() = user_id);
create policy "favorites delete own" on favorites for delete using (auth.uid() = user_id);

-- Custom setups: owner-only
drop policy if exists "setups select own" on custom_setups;
drop policy if exists "setups insert own" on custom_setups;
drop policy if exists "setups update own" on custom_setups;
drop policy if exists "setups delete own" on custom_setups;
create policy "setups select own" on custom_setups for select using (auth.uid() = user_id);
create policy "setups insert own" on custom_setups for insert with check (auth.uid() = user_id);
create policy "setups update own" on custom_setups for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "setups delete own" on custom_setups for delete using (auth.uid() = user_id);

-- Custom setup items: reachable through parent setup ownership
drop policy if exists "setup_items select own" on custom_setup_items;
drop policy if exists "setup_items write own"  on custom_setup_items;
create policy "setup_items select own" on custom_setup_items for select
  using (exists (select 1 from custom_setups s where s.id = setup_id and s.user_id = auth.uid()));
create policy "setup_items write own" on custom_setup_items for all
  using (exists (select 1 from custom_setups s where s.id = setup_id and s.user_id = auth.uid()))
  with check (exists (select 1 from custom_setups s where s.id = setup_id and s.user_id = auth.uid()));
