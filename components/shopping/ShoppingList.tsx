import { formatCurrency } from "@/lib/utils";
import { SLOT_BY_ID } from "@/lib/slots";
import type { GroupedShopping } from "@/lib/shopping";

export function ShoppingList({
  groups,
  totalCents,
  guests
}: {
  groups: GroupedShopping[];
  totalCents: number;
  guests: number;
}) {
  return (
    <div className="space-y-8 print:space-y-4">
      {groups.map((group) => (
        <section key={group.section.id}>
          <header className="mb-2 flex items-baseline justify-between">
            <h3 className="font-serif text-xl tracking-tight2 text-ink">
              {group.section.label}
            </h3>
            <span className="text-sm text-stone-500">
              {formatCurrency(group.subtotal_cents)}
            </span>
          </header>
          <ul className="divide-y divide-stone-200 border border-stone-200 rounded-lg overflow-hidden bg-paper">
            {group.lines.map((line) => {
              const slot = SLOT_BY_ID[line.slot];
              return (
                <li
                  key={line.slot}
                  className="flex items-center gap-4 px-4 py-3 print:px-2 print:py-2"
                >
                  <div
                    className="w-12 h-12 rounded bg-stone-100 bg-center bg-cover shrink-0 print:hidden"
                    style={{ backgroundImage: `url(${line.product.image_url})` }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink truncate">
                      {line.product.name}
                    </p>
                    <p className="text-[12px] text-stone-500">
                      {slot.label} · qty {line.quantity}
                      {line.product.retailer_url ? (
                        <>
                          {" "}·{" "}
                          <a
                            href={line.product.retailer_url}
                            className="text-accent hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            buy
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm text-ink">
                      {formatCurrency(line.subtotal_cents)}
                    </p>
                    <p className="text-[12px] text-stone-500">
                      {line.quantity} × {formatCurrency(line.product.price_cents)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className="rounded-lg border border-stone-300 bg-paper p-5 flex items-baseline justify-between">
        <div>
          <p className="text-sm text-stone-500">Total · {guests} guests</p>
          <p className="text-[12px] text-stone-500">
            About {formatCurrency(totalCents / Math.max(1, guests))} per guest
          </p>
        </div>
        <p className="font-serif text-3xl tracking-tight2 text-ink">
          {formatCurrency(totalCents)}
        </p>
      </div>
    </div>
  );
}
