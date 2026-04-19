// Minimal DB types — generate with `supabase gen types typescript` once
// your project is linked. These shapes mirror supabase/migrations/0001_init.sql.

export interface DBProduct {
  id: string;
  slug: string | null;
  name: string;
  category: string;
  style: string;
  price_cents: number;
  per_guest: boolean;
  image_url: string;
  retailer_url: string | null;
}

export interface DBScenario {
  id: string;
  slug: string;
  title: string;
  occasion: string;
  style: string;
  description: string;
  hero_image_url: string;
  default_guest_count: number;
  budget_tier: string;
}

export interface DBScenarioItem {
  id: string;
  scenario_id: string;
  slot: string;
  product_id: string;
}

export interface DBCustomSetup {
  id: string;
  user_id: string;
  base_scenario_id: string | null;
  name: string;
  guest_count: number;
  created_at: string;
}
