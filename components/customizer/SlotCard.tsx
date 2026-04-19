"use client";

import { formatCurrency } from "@/lib/utils";
import type { SlotDef } from "@/lib/slots";
import type { Product } from "@/types/domain";

export function SlotCard({
  slot,
  product,
  guests,
  onClick
}: {
  slot: SlotDef;
  product: Product;
  guests: number;
  onClick: () => void;
}) {
  const qty = slot.per_guest ? guests : 1;
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-lg border border-stone-200 bg-paper p-3 flex gap-3 items-center hover:border-accent transition focus:outline-none focus-visible:shadow-ring"
    >
      <div
        className="w-16 h-16 rounded bg-stone-100 bg-center bg-cover shrink-0"
        style={{ backgroundImage: `url(${product.image_url})` }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-stone-500">
          {slot.label}
        </p>
        <p className="text-sm font-medium text-ink truncate">{product.name}</p>
        <p className="text-[12px] text-stone-500">
          {slot.per_guest
            ? `${qty} × ${formatCurrency(product.price_cents)}`
            : formatCurrency(product.price_cents)}
        </p>
      </div>
      <span className="text-[11px] text-accent hidden sm:inline">Swap</span>
    </button>
  );
}
