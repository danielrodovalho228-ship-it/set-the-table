import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingList } from "@/components/shopping/ShoppingList";
import { ShoppingActions } from "@/components/shopping/ShoppingActions";
import { getScenario, listProducts } from "@/lib/queries";
import { PRODUCT_BY_ID, setupForScenario } from "@/data/mock";
import { buildShoppingList, setupFromSearchParams } from "@/lib/shopping";
import type { Setup, SlotId, Product } from "@/types/domain";

// Ad-hoc shopping list: built from the scenario default + any URL overrides
// the Customizer passed in (?guests=...&tablecloth=...&runner=...&...).
export default async function ScenarioShoppingListPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const scenario = await getScenario(params.slug);
  if (!scenario) return notFound();

  const products = await listProducts();
  const productById = new Map(products.map((p) => [p.id, p]));
  const productBySlug = new Map(
    products.filter((p) => "slug" in p).map((p) => [(p as any).slug ?? p.id, p])
  );

  const lookup = (id: string) =>
    productById.get(id) ?? productBySlug.get(id) ?? PRODUCT_BY_ID[id];

  const fallback = (() => {
    const built: Partial<Setup> = {};
    for (const [slot, productId] of Object.entries(scenario.items)) {
      const p = productById.get(productId) ?? PRODUCT_BY_ID[productId];
      if (p) built[slot as SlotId] = p as Product;
    }
    if (Object.keys(built).length === 10) return built as Setup;
    return setupForScenario(scenario.slug) as Setup;
  })();

  const { setup, guests } = setupFromSearchParams(searchParams, lookup, fallback);
  const { groups, total_cents } = buildShoppingList(setup, guests);

  const title = `${scenario.title} — shopping list`;

  return (
    <section className="max-w-4xl mx-auto px-5 pt-10 pb-20 print:pt-4">
      <Link
        href={`/scenarios/${scenario.slug}/customize?guests=${guests}`}
        className="text-sm text-stone-500 hover:text-ink print:hidden"
      >
        ← Back to customize
      </Link>

      <header className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight2 text-ink">
            {title}
          </h1>
          <p className="mt-1 text-stone-600">
            {guests} guests · grouped by section
          </p>
        </div>
        <ShoppingActions
          title={title}
          groups={groups}
          totalCents={total_cents}
          guests={guests}
        />
      </header>

      <ShoppingList groups={groups} totalCents={total_cents} guests={guests} />
    </section>
  );
}
