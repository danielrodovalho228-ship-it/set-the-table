import { SLOTS } from "@/lib/slots";
import { formatCurrency } from "@/lib/utils";
import type { Setup } from "@/types/domain";

export function ItemList({
  setup,
  guestCount
}: {
  setup: Setup;
  guestCount: number;
}) {
  return (
    <ul className="divide-y divide-stone-200 border border-stone-200 rounded-lg overflow-hidden bg-paper">
      {SLOTS.map((slot) => {
        const product = setup[slot.id];
        if (!product) return null;
        const qty = slot.per_guest ? guestCount : 1;
        const subtotal = product.price_cents * qty;
        return (
          <li key={slot.id} className="flex items-center gap-4 px-4 py-3">
            <div
              className="w-14 h-14 rounded bg-stone-100 bg-center bg-cover shrink-0"
              style={{ backgroundImage: `url(${product.image_url})` }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-ink truncate">{product.name}</p>
                <p className="text-sm text-stone-600 shrink-0">
                  {formatCurrency(subtotal)}
                </p>
              </div>
              <p className="text-[12px] text-stone-500">
                {slot.label} · {slot.per_guest ? `${qty} × ${formatCurrency(product.price_cents)}` : "fixed"}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
