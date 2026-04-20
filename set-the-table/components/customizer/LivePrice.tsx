"use client";

import { formatCurrency } from "@/lib/utils";

export function LivePrice({
  totalCents,
  guests
}: {
  totalCents: number;
  guests: number;
}) {
  const perGuest = totalCents / Math.max(1, guests);
  return (
    <div className="rounded-lg border border-stone-200 bg-paper p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-stone-500">Live total</span>
        <span className="font-serif text-3xl tracking-tight2 text-ink">
          {formatCurrency(totalCents)}
        </span>
      </div>
      <div className="mt-1 text-[13px] text-stone-500">
        About {formatCurrency(perGuest)} per guest · {guests} guests
      </div>
    </div>
  );
}
