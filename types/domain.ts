// Core domain types. Single source of truth for the entire app.

export type SlotId =
  | "tablecloth"
  | "runner"
  | "charger"
  | "dinner_plate"
  | "salad_plate"
  | "napkin"
  | "flatware"
  | "glasses"
  | "centerpiece"
  | "candles";

export type Style =
  | "modern"
  | "rustic"
  | "classic"
  | "minimal"
  | "festive"
  | "boho"
  | "coastal"
  | "scandi";

export type Occasion =
  | "thanksgiving"
  | "christmas"
  | "birthday"
  | "dinner_party"
  | "easter"
  | "everyday"
  | "halloween"
  | "mothers_day"
  | "hanukkah"
  | "bbq_cookout"
  | "rehearsal";

export type BudgetTier =
  | "under_100"
  | "100_250"
  | "250_500"
  | "500_plus";

export interface Product {
  id: string;
  name: string;
  category: SlotId;          // identical to slot id
  style: Style;
  price_cents: number;
  per_guest: boolean;        // multiply by guest count
  image_url: string;
  retailer_url?: string;
}

export interface Scenario {
  id: string;
  slug: string;
  title: string;
  occasion: Occasion;
  style: Style;
  description: string;
  hero_image_url: string;
  default_guest_count: number;
  budget_tier: BudgetTier;
  // For Phase 1 we denormalize the slot map onto the scenario:
  items: Record<SlotId, string>; // slot -> product_id
}

export type Setup = Record<SlotId, Product>;

export interface PriceBreakdownLine {
  slot: SlotId;
  qty: number;
  subtotal_cents: number;
}

export interface ShoppingLine {
  product: Product;
  slot: SlotId;
  quantity: number;
  subtotal_cents: number;
}
