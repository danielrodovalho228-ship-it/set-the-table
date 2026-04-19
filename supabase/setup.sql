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
-- ============================================================
-- Seed data for Set the Table
-- Mirrors data/mock.ts; uses stable slug-based IDs.
-- ============================================================

-- Products
insert into products (slug, name, category, style, price_cents, per_guest, image_url) values
  ('tc-linen-ivory',  'Washed Linen Tablecloth, Ivory', 'tablecloth', 'classic', 8900,  false, 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=70'),
  ('tc-linen-sage',   'Washed Linen Tablecloth, Sage',  'tablecloth', 'rustic',  8900,  false, 'https://images.unsplash.com/photo-1615715035708-c3b8e9f5e8aa?auto=format&fit=crop&w=800&q=70'),
  ('tc-cotton-white', 'Hemmed Cotton Cloth, White',     'tablecloth', 'minimal', 3900,  false, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),
  ('tc-jacquard-ruby','Holiday Jacquard, Ruby',         'tablecloth', 'festive', 11900, false, 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=70'),

  ('rn-burlap',  'Natural Burlap Runner',    'runner', 'rustic',  2400, false, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=70'),
  ('rn-velvet',  'Velvet Runner, Forest',    'runner', 'festive', 5400, false, 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=70'),
  ('rn-linen',   'Slub Linen Runner, Oat',   'runner', 'classic', 3900, false, 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=70'),
  ('rn-minimal', 'Unbleached Cotton Runner', 'runner', 'minimal', 1900, false, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),

  ('ch-gold',   'Gold Beaded Charger',  'charger', 'festive', 1400, true, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=70'),
  ('ch-wood',   'Acacia Wood Charger',  'charger', 'rustic',  1800, true, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=70'),
  ('ch-rattan', 'Woven Rattan Charger', 'charger', 'modern',  1600, true, 'https://images.unsplash.com/photo-1615715035708-c3b8e9f5e8aa?auto=format&fit=crop&w=800&q=70'),
  ('ch-matte',  'Matte Black Charger',  'charger', 'minimal', 1200, true, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),

  ('dp-stone', 'Stoneware Dinner Plate, Cream', 'dinner_plate', 'classic', 2200, true, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=70'),
  ('dp-matte', 'Matte Porcelain Plate, White',  'dinner_plate', 'minimal', 1800, true, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),
  ('dp-rim',   'Gold Rim Porcelain Plate',      'dinner_plate', 'festive', 2800, true, 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=70'),
  ('dp-terra', 'Terracotta Hand-Thrown Plate',  'dinner_plate', 'rustic',  2400, true, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=70'),

  ('sp-stone', 'Stoneware Salad Plate, Cream', 'salad_plate', 'classic', 1600, true, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=70'),
  ('sp-matte', 'Matte Porcelain Salad, White', 'salad_plate', 'minimal', 1400, true, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),
  ('sp-rim',   'Gold Rim Salad Plate',         'salad_plate', 'festive', 1900, true, 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=70'),
  ('sp-terra', 'Terracotta Salad Plate',       'salad_plate', 'rustic',  1700, true, 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?auto=format&fit=crop&w=800&q=70'),

  ('np-linen-oat',  'Linen Napkin, Oat',        'napkin', 'classic', 900,  true, 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=70'),
  ('np-linen-sage', 'Linen Napkin, Sage',       'napkin', 'rustic',  900,  true, 'https://images.unsplash.com/photo-1615715035708-c3b8e9f5e8aa?auto=format&fit=crop&w=800&q=70'),
  ('np-cotton-wht', 'Cotton Napkin, White',     'napkin', 'minimal', 500,  true, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),
  ('np-jacquard',   'Holiday Jacquard Napkin',  'napkin', 'festive', 1200, true, 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=70'),

  ('fw-matte-gold', 'Matte Gold 5-Piece Flatware',  'flatware', 'festive', 3400, true, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=70'),
  ('fw-brushed',    'Brushed Steel Flatware',       'flatware', 'modern',  2200, true, 'https://images.unsplash.com/photo-1615715035708-c3b8e9f5e8aa?auto=format&fit=crop&w=800&q=70'),
  ('fw-classic',    'Classic Silverplate Flatware', 'flatware', 'classic', 2800, true, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),
  ('fw-wood',       'Wood-Handle Flatware',         'flatware', 'rustic',  3100, true, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=70'),

  ('gl-crystal', 'Crystal Wine + Water Set', 'glasses', 'classic', 2600, true, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=70'),
  ('gl-ribbed',  'Ribbed Glass Set',         'glasses', 'modern',  2000, true, 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=70'),
  ('gl-amber',   'Amber Tinted Glass Set',   'glasses', 'festive', 2400, true, 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=70'),
  ('gl-simple',  'Simple Tumbler Set',       'glasses', 'minimal', 1400, true, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),

  ('cp-eucalyptus', 'Fresh Eucalyptus Garland',     'centerpiece', 'rustic',  4500, false, 'https://images.unsplash.com/photo-1615715035708-c3b8e9f5e8aa?auto=format&fit=crop&w=800&q=70'),
  ('cp-pumpkins',   'Heirloom Pumpkin Arrangement', 'centerpiece', 'festive', 6800, false, 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?auto=format&fit=crop&w=800&q=70'),
  ('cp-roses',      'Blush Rose Low Bouquet',       'centerpiece', 'classic', 7400, false, 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=70'),
  ('cp-branches',   'Bare Branch + Bud Vase Trio',  'centerpiece', 'minimal', 3900, false, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),

  ('cd-tapers-ivory', 'Ivory Taper Candles, Set of 6', 'candles', 'classic', 1800, false, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=70'),
  ('cd-tapers-sage',  'Sage Tapers, Set of 6',         'candles', 'rustic',  1800, false, 'https://images.unsplash.com/photo-1615715035708-c3b8e9f5e8aa?auto=format&fit=crop&w=800&q=70'),
  ('cd-pillars',      'Unscented Pillar Trio',         'candles', 'minimal', 2400, false, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),
  ('cd-beeswax',      'Beeswax Tapers, Set of 4',      'candles', 'festive', 2200, false, 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=70'),

  -- ---------- Expansion: 20 new products ----------
  ('tc-linen-black',     'Washed Linen Tablecloth, Black',   'tablecloth', 'festive', 8900,  false, 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=70'),
  ('tc-stripes-coastal', 'Blue & White Stripe Tablecloth',   'tablecloth', 'coastal', 5400,  false, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=70'),

  ('rn-macrame',      'Hand-Knotted Macramé Runner', 'runner', 'boho',    4900, false, 'https://images.unsplash.com/photo-1615715035708-c3b8e9f5e8aa?auto=format&fit=crop&w=800&q=70'),
  ('rn-silver-satin', 'Silver Satin Runner',         'runner', 'festive', 4800, false, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=70'),

  ('ch-bamboo',          'Woven Bamboo Charger',    'charger', 'coastal', 1500, true, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=70'),
  ('ch-hammered-silver', 'Hammered Silver Charger', 'charger', 'festive', 2200, true, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=70'),

  ('dp-scandi-speckle', 'Speckled Stoneware Plate, Grey', 'dinner_plate', 'scandi', 2000, true, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),
  ('dp-earthenware',    'Glazed Earthenware Plate',       'dinner_plate', 'boho',   2600, true, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=70'),

  ('sp-scandi-speckle', 'Speckled Salad Plate, Grey', 'salad_plate', 'scandi',  1500, true, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),
  ('sp-blue-rim',       'Blue Rim Porcelain Salad',   'salad_plate', 'coastal', 1700, true, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=70'),

  ('np-chambray-blue', 'Chambray Napkin, Blue', 'napkin', 'coastal', 800,  true, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=70'),
  ('np-blush-linen',   'Blush Linen Napkin',    'napkin', 'classic', 1000, true, 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=70'),

  ('fw-hammered-silver', 'Hammered Silver Flatware', 'flatware', 'festive', 3600, true, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=70'),
  ('fw-matte-black',     'Matte Black Flatware',     'flatware', 'modern',  3000, true, 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=800&q=70'),

  ('gl-blue-rim', 'Blue Rim Glassware Set', 'glasses', 'coastal', 2200, true, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=70'),
  ('gl-smoke',    'Smoked Glass Set',       'glasses', 'scandi',  2400, true, 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=70'),

  ('cp-peonies',     'Blush Peony Low Bouquet',            'centerpiece', 'classic', 8200, false, 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=70'),
  ('cp-wildflowers', 'Wildflower + Herb Arrangement',      'centerpiece', 'coastal', 4800, false, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=70'),
  ('cp-menorah',     'Brass Menorah + Votive Arrangement', 'centerpiece', 'festive', 9400, false, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=70'),

  ('cd-silver-tapers', 'Silver Taper Candles, Set of 6', 'candles', 'festive', 2000, false, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=70')
on conflict (slug) do nothing;

-- Scenarios
insert into scenarios (slug, title, occasion, style, description, hero_image_url, default_guest_count, budget_tier) values
  ('classic-thanksgiving',    'A Classic Thanksgiving',    'thanksgiving', 'classic', 'Warm neutrals, gold-rimmed plates, and a low garland of eucalyptus. A timeless setting that invites the family to linger.',                 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?auto=format&fit=crop&w=1200&q=70', 8,  '250_500'),
  ('festive-christmas-dinner','Festive Christmas Dinner',  'christmas',    'festive', 'Deep reds, matte gold, and beeswax taper candles. Built for the big meal and the long conversation that follows.',                           'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=1200&q=70', 10, '500_plus'),
  ('modern-birthday-dinner',  'Modern Birthday Dinner',    'birthday',     'modern',  'Brushed steel flatware, ribbed glasses, rattan chargers. Crisp, considered, and celebratory without being fussy.',                           'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=70', 6,  '100_250'),
  ('minimal-dinner-party',    'Minimal Dinner Party',      'dinner_party', 'minimal', 'A pared-back setting for close friends. White porcelain, simple tumblers, and three pillar candles doing all the work.',                     'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=70', 4,  'under_100'),
  ('rustic-harvest-supper',   'Rustic Harvest Supper',     'dinner_party', 'rustic',  'Sage linens, terracotta plates, wood-handle flatware, and eucalyptus. A table that feels like a slow evening in the country.',              'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=70', 8,  '250_500'),
  ('easter-brunch',           'Easter Brunch',             'easter',       'classic', 'Soft blush roses, ivory tapers, gold-rim plates. A brunch table that holds up from mimosas to coffee.',                                      'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=1200&q=70', 6,  '100_250'),

  -- ---------- Expansion: 5 new occasions ----------
  ('halloween-gathering',     'Halloween Gathering',       'halloween',    'festive', 'Black linen, amber glassware, and a heirloom pumpkin trio. Moody, tactile, and just the right side of spooky.',                       'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=70', 8,  '250_500'),
  ('mothers-day-brunch',      'Mother''s Day Brunch',      'mothers_day',  'classic', 'Blush linens, peonies, and gold flatware. A table built for slow Sundays and second cups of coffee.',                                   'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=70', 6,  '100_250'),
  ('hanukkah-dinner',         'Hanukkah Dinner',           'hanukkah',     'festive', 'Silver satin, hammered flatware, and a brass menorah surrounded by votives. Ceremonial and warm.',                                    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=70', 8,  '250_500'),
  ('summer-bbq-cookout',      'Summer BBQ Cookout',        'bbq_cookout',  'coastal', 'Blue-and-white stripes, bamboo chargers, and a wildflower jar. Casual outdoor entertaining that still feels set.',                    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=70', 10, '100_250'),
  ('wedding-rehearsal-dinner','Wedding Rehearsal Dinner',  'rehearsal',    'classic', 'Ivory linens, gold-rim plates, and a long table of blush peonies. Refined, romantic, and ready for toasts.',                           'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=1200&q=70', 12, '500_plus')
on conflict (slug) do nothing;

-- Scenario items (slot -> product, resolved by slug)
-- Uses a CTE to map slugs to IDs.
with
  s as (select slug, id from scenarios),
  p as (select slug, id from products),
  mapping(scenario_slug, slot, product_slug) as (values
    ('classic-thanksgiving','tablecloth','tc-linen-ivory'),
    ('classic-thanksgiving','runner','rn-linen'),
    ('classic-thanksgiving','charger','ch-gold'),
    ('classic-thanksgiving','dinner_plate','dp-rim'),
    ('classic-thanksgiving','salad_plate','sp-rim'),
    ('classic-thanksgiving','napkin','np-linen-oat'),
    ('classic-thanksgiving','flatware','fw-classic'),
    ('classic-thanksgiving','glasses','gl-crystal'),
    ('classic-thanksgiving','centerpiece','cp-eucalyptus'),
    ('classic-thanksgiving','candles','cd-tapers-ivory'),

    ('festive-christmas-dinner','tablecloth','tc-jacquard-ruby'),
    ('festive-christmas-dinner','runner','rn-velvet'),
    ('festive-christmas-dinner','charger','ch-gold'),
    ('festive-christmas-dinner','dinner_plate','dp-rim'),
    ('festive-christmas-dinner','salad_plate','sp-rim'),
    ('festive-christmas-dinner','napkin','np-jacquard'),
    ('festive-christmas-dinner','flatware','fw-matte-gold'),
    ('festive-christmas-dinner','glasses','gl-amber'),
    ('festive-christmas-dinner','centerpiece','cp-pumpkins'),
    ('festive-christmas-dinner','candles','cd-beeswax'),

    ('modern-birthday-dinner','tablecloth','tc-cotton-white'),
    ('modern-birthday-dinner','runner','rn-minimal'),
    ('modern-birthday-dinner','charger','ch-rattan'),
    ('modern-birthday-dinner','dinner_plate','dp-matte'),
    ('modern-birthday-dinner','salad_plate','sp-matte'),
    ('modern-birthday-dinner','napkin','np-cotton-wht'),
    ('modern-birthday-dinner','flatware','fw-brushed'),
    ('modern-birthday-dinner','glasses','gl-ribbed'),
    ('modern-birthday-dinner','centerpiece','cp-roses'),
    ('modern-birthday-dinner','candles','cd-pillars'),

    ('minimal-dinner-party','tablecloth','tc-cotton-white'),
    ('minimal-dinner-party','runner','rn-minimal'),
    ('minimal-dinner-party','charger','ch-matte'),
    ('minimal-dinner-party','dinner_plate','dp-matte'),
    ('minimal-dinner-party','salad_plate','sp-matte'),
    ('minimal-dinner-party','napkin','np-cotton-wht'),
    ('minimal-dinner-party','flatware','fw-brushed'),
    ('minimal-dinner-party','glasses','gl-simple'),
    ('minimal-dinner-party','centerpiece','cp-branches'),
    ('minimal-dinner-party','candles','cd-pillars'),

    ('rustic-harvest-supper','tablecloth','tc-linen-sage'),
    ('rustic-harvest-supper','runner','rn-burlap'),
    ('rustic-harvest-supper','charger','ch-wood'),
    ('rustic-harvest-supper','dinner_plate','dp-terra'),
    ('rustic-harvest-supper','salad_plate','sp-terra'),
    ('rustic-harvest-supper','napkin','np-linen-sage'),
    ('rustic-harvest-supper','flatware','fw-wood'),
    ('rustic-harvest-supper','glasses','gl-ribbed'),
    ('rustic-harvest-supper','centerpiece','cp-eucalyptus'),
    ('rustic-harvest-supper','candles','cd-tapers-sage'),

    ('easter-brunch','tablecloth','tc-linen-ivory'),
    ('easter-brunch','runner','rn-linen'),
    ('easter-brunch','charger','ch-gold'),
    ('easter-brunch','dinner_plate','dp-stone'),
    ('easter-brunch','salad_plate','sp-stone'),
    ('easter-brunch','napkin','np-linen-oat'),
    ('easter-brunch','flatware','fw-matte-gold'),
    ('easter-brunch','glasses','gl-crystal'),
    ('easter-brunch','centerpiece','cp-roses'),
    ('easter-brunch','candles','cd-tapers-ivory'),

    ('halloween-gathering','tablecloth','tc-linen-black'),
    ('halloween-gathering','runner','rn-velvet'),
    ('halloween-gathering','charger','ch-matte'),
    ('halloween-gathering','dinner_plate','dp-rim'),
    ('halloween-gathering','salad_plate','sp-rim'),
    ('halloween-gathering','napkin','np-jacquard'),
    ('halloween-gathering','flatware','fw-matte-black'),
    ('halloween-gathering','glasses','gl-amber'),
    ('halloween-gathering','centerpiece','cp-pumpkins'),
    ('halloween-gathering','candles','cd-beeswax'),

    ('mothers-day-brunch','tablecloth','tc-linen-ivory'),
    ('mothers-day-brunch','runner','rn-linen'),
    ('mothers-day-brunch','charger','ch-gold'),
    ('mothers-day-brunch','dinner_plate','dp-stone'),
    ('mothers-day-brunch','salad_plate','sp-stone'),
    ('mothers-day-brunch','napkin','np-blush-linen'),
    ('mothers-day-brunch','flatware','fw-matte-gold'),
    ('mothers-day-brunch','glasses','gl-crystal'),
    ('mothers-day-brunch','centerpiece','cp-peonies'),
    ('mothers-day-brunch','candles','cd-tapers-ivory'),

    ('hanukkah-dinner','tablecloth','tc-linen-ivory'),
    ('hanukkah-dinner','runner','rn-silver-satin'),
    ('hanukkah-dinner','charger','ch-hammered-silver'),
    ('hanukkah-dinner','dinner_plate','dp-matte'),
    ('hanukkah-dinner','salad_plate','sp-matte'),
    ('hanukkah-dinner','napkin','np-cotton-wht'),
    ('hanukkah-dinner','flatware','fw-hammered-silver'),
    ('hanukkah-dinner','glasses','gl-crystal'),
    ('hanukkah-dinner','centerpiece','cp-menorah'),
    ('hanukkah-dinner','candles','cd-silver-tapers'),

    ('summer-bbq-cookout','tablecloth','tc-stripes-coastal'),
    ('summer-bbq-cookout','runner','rn-burlap'),
    ('summer-bbq-cookout','charger','ch-bamboo'),
    ('summer-bbq-cookout','dinner_plate','dp-stone'),
    ('summer-bbq-cookout','salad_plate','sp-blue-rim'),
    ('summer-bbq-cookout','napkin','np-chambray-blue'),
    ('summer-bbq-cookout','flatware','fw-wood'),
    ('summer-bbq-cookout','glasses','gl-blue-rim'),
    ('summer-bbq-cookout','centerpiece','cp-wildflowers'),
    ('summer-bbq-cookout','candles','cd-pillars'),

    ('wedding-rehearsal-dinner','tablecloth','tc-linen-ivory'),
    ('wedding-rehearsal-dinner','runner','rn-linen'),
    ('wedding-rehearsal-dinner','charger','ch-gold'),
    ('wedding-rehearsal-dinner','dinner_plate','dp-rim'),
    ('wedding-rehearsal-dinner','salad_plate','sp-rim'),
    ('wedding-rehearsal-dinner','napkin','np-blush-linen'),
    ('wedding-rehearsal-dinner','flatware','fw-matte-gold'),
    ('wedding-rehearsal-dinner','glasses','gl-crystal'),
    ('wedding-rehearsal-dinner','centerpiece','cp-peonies'),
    ('wedding-rehearsal-dinner','candles','cd-tapers-ivory')
  )
insert into scenario_items (scenario_id, slot, product_id)
select s.id, m.slot, p.id
from mapping m
join s on s.slug = m.scenario_slug
join p on p.slug = m.product_slug
on conflict (scenario_id, slot) do update set product_id = excluded.product_id;
