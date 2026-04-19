import { formatCurrency } from "@/lib/utils";

export function PriceSummary({
  totalCents,
  guestCount
}: {
  totalCents: number;
  guestCount: number;
}) {
  const perGuest = totalCents / Math.max(1, guestCount);
  return (
    <div className="rounded-lg border border-stone-200 bg-paper p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-stone-500">Estimated total</span>
        <span className="font-serif text-3xl tracking-tight2 text-ink">
          {formatCurrency(totalCents)}
        </span>
      </div>
      <div className="mt-2 text-[13px] text-stone-500">
        About {formatCurrency(perGuest)} per guest · {guestCount} guests
      </div>
    </div>
  );
}
