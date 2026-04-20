import { SLOTS } from "@/lib/slots";
import { formatCurrency } from "@/lib/utils";
import type { Setup, SlotId } from "@/types/domain";

const AFFILIATE_DISCLOSURE =
  "As an Amazon Associate we earn from qualifying purchases.";

/**
 * Builds the destination URL for the Buy button:
 * - If `is_my_product` + `asin`: link directly to the owner's Amazon listing
 *   with their associate tag (set via env AMAZON_AFFILIATE_TAG).
 * - Else if `retailer_url`: use the provided affiliate URL.
 * - Else: no shop link.
 *
 * UTM params are appended to all outbound links so click-through can be
 * measured per scenario.
 */
function buyUrl(
  product: { is_my_product?: boolean; asin?: string; retailer_url?: string },
  scenarioSlug: string,
  slot: SlotId
): string | null {
  const tag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG ?? "";
  let base: string | null = null;

  if (product.is_my_product && product.asin) {
    base = `https://www.amazon.com/dp/${product.asin}${tag ? `?tag=${tag}` : ""}`;
  } else if (product.retailer_url) {
    base = product.retailer_url;
  }
  if (!base) return null;

  const u = new URL(base);
  u.searchParams.set("utm_source", "set-the-table");
  u.searchParams.set("utm_medium", "shop-this-look");
  u.searchParams.set("utm_campaign", scenarioSlug);
  u.searchParams.set("utm_content", slot);
  return u.toString();
}

export function ShopThisLook({
  setup,
  scenarioSlug
}: {
  setup: Setup;
  scenarioSlug: string;
}) {
  const lines = SLOTS.map((slot) => {
    const product = setup[slot.id];
    if (!product) return null;
    const url = buyUrl(product, scenarioSlug, slot.id);
    return { slot, product, url };
  }).filter(Boolean) as {
    slot: typeof SLOTS[number];
    product: Setup[SlotId];
    url: string | null;
  }[];

  const myCount = lines.filter((l) => l.product.is_my_product).length;
  const hasAnyShoppable = lines.some((l) => l.url);

  return (
    <section className="rounded-xl border border-stone-200 bg-paper p-6 print:hidden">
      <header className="flex items-baseline justify-between mb-1">
        <h2 className="font-serif text-2xl tracking-tight2 text-ink">
          Shop this look
        </h2>
        {myCount > 0 && (
          <span className="text-[12px] text-accent">
            {myCount} of our own products
          </span>
        )}
      </header>
      <p className="text-sm text-stone-500 mb-5">
        Recreate this setting with the pieces below. Inspired look — products
        may differ slightly from the photo.
      </p>

      <ul className="grid sm:grid-cols-2 gap-3">
        {lines.map(({ slot, product, url }) => (
          <li
            key={slot.id}
            className="flex items-center gap-3 rounded-lg border border-stone-200 p-3"
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
              <p className="text-sm font-medium text-ink truncate">
                {product.name}
              </p>
              <p className="text-[12px] text-stone-500">
                {formatCurrency(product.price_cents)}
                {product.is_my_product && (
                  <span className="ml-1.5 text-accent">· our store</span>
                )}
              </p>
            </div>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener nofollow sponsored"
                className="h-9 px-3 inline-flex items-center rounded-lg bg-ink text-paper text-sm hover:bg-stone-700 shrink-0"
              >
                Shop
              </a>
            ) : (
              <span className="text-[12px] text-stone-400 shrink-0">—</span>
            )}
          </li>
        ))}
      </ul>

      {hasAnyShoppable && (
        <p className="mt-5 text-[11px] text-stone-500">
          {AFFILIATE_DISCLOSURE}
        </p>
      )}
    </section>
  );
}
