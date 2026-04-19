import { SLOTS } from "@/lib/slots";
import type { Product, Setup, ShoppingLine, SlotId } from "@/types/domain";

/**
 * Logical sections for the shopping list. We group the 10 slots into 4
 * meaningful buckets so the user gets a list that reads like a list, not
 * a table dump.
 */
export const SHOPPING_SECTIONS = [
  { id: "linens", label: "Linens",                 slots: ["tablecloth", "runner", "napkin"] },
  { id: "plates", label: "Place settings",         slots: ["charger", "dinner_plate", "salad_plate"] },
  { id: "table",  label: "Flatware & glassware",   slots: ["flatware", "glasses"] },
  { id: "decor",  label: "Decor",                  slots: ["centerpiece", "candles"] }
] as const;

export type ShoppingSection = (typeof SHOPPING_SECTIONS)[number];

export interface GroupedShopping {
  section: ShoppingSection;
  lines: ShoppingLine[];
  subtotal_cents: number;
}

export function buildShoppingList(setup: Setup, guestCount: number) {
  const guests = Math.max(1, Math.floor(guestCount || 1));
  const slotMap = new Map(SLOTS.map((s) => [s.id, s] as const));

  const groups: GroupedShopping[] = SHOPPING_SECTIONS.map((section) => {
    const lines: ShoppingLine[] = [];
    let subtotal = 0;
    for (const slotId of section.slots) {
      const slot = slotMap.get(slotId as SlotId);
      const product = setup[slotId as SlotId];
      if (!slot || !product) continue;
      const quantity = slot.per_guest ? guests : 1;
      const subtotal_cents = product.price_cents * quantity;
      subtotal += subtotal_cents;
      lines.push({ product, slot: slot.id, quantity, subtotal_cents });
    }
    return { section, lines, subtotal_cents: subtotal };
  });

  const total_cents = groups.reduce((acc, g) => acc + g.subtotal_cents, 0);
  return { groups, total_cents, guests };
}

/**
 * Resolves a setup from URL searchParams of the form
 * `?guests=8&tablecloth=<productId>&runner=<productId>...`
 *
 * Falls back to a provided default for any missing or invalid slot.
 */
export function setupFromSearchParams(
  params: Record<string, string | string[] | undefined>,
  productLookup: (idOrSlug: string) => Product | undefined,
  fallback: Setup
) {
  const setup: Setup = { ...fallback };
  for (const slot of SLOTS) {
    const raw = params[slot.id];
    const id = Array.isArray(raw) ? raw[0] : raw;
    if (!id) continue;
    const product = productLookup(id);
    if (product && product.category === slot.id) {
      setup[slot.id] = product;
    }
  }
  const guestsRaw = params.guests;
  const guests = Math.max(
    1,
    Math.min(50, parseInt(Array.isArray(guestsRaw) ? guestsRaw[0] ?? "" : guestsRaw ?? "", 10) || 1)
  );
  return { setup, guests };
}
