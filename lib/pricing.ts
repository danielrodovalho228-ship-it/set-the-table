import { SLOTS } from "@/lib/slots";
import type { PriceBreakdownLine, Setup } from "@/types/domain";

/**
 * computeTotal — pure pricing function.
 * Per-guest items multiply by guestCount; fixed items count once.
 */
export function computeTotal(setup: Setup, guestCount: number) {
  const guests = Math.max(1, Math.floor(guestCount || 1));
  let total_cents = 0;
  const breakdown: PriceBreakdownLine[] = [];

  for (const slot of SLOTS) {
    const product = setup[slot.id];
    if (!product) continue;
    const qty = slot.per_guest ? guests : 1;
    const subtotal = product.price_cents * qty;
    total_cents += subtotal;
    breakdown.push({ slot: slot.id, qty, subtotal_cents: subtotal });
  }

  return { total_cents, breakdown };
}
