import Link from "next/link";
import { notFound } from "next/navigation";
import { Customizer } from "@/components/customizer/Customizer";
import { getCurrentUser, getScenario, listProducts } from "@/lib/queries";
import { PRODUCT_BY_ID, setupForScenario } from "@/data/mock";
import type { Product, Setup, SlotId } from "@/types/domain";

// Server component: fetches everything, hands off to the interactive Customizer.
export default async function CustomizePage({
  params
}: {
  params: { slug: string };
}) {
  const scenario = await getScenario(params.slug);
  if (!scenario) return notFound();

  const products = await listProducts();
  const productById = new Map(products.map((p) => [p.id, p]));

  // Build initial setup. Prefer DB products; fall back to mock resolver.
  const initialSetup = (() => {
    const fromDb: Partial<Setup> = {};
    for (const [slot, productId] of Object.entries(scenario.items)) {
      const p = productById.get(productId) ?? PRODUCT_BY_ID[productId];
      if (p) fromDb[slot as SlotId] = p as Product;
    }
    if (Object.keys(fromDb).length === 10) return fromDb as Setup;
    // Mock fallback
    return setupForScenario(scenario.slug) as Setup;
  })();

  const user = await getCurrentUser();

  return (
    <section className="max-w-6xl mx-auto px-5 pt-10 pb-20">
      <Link
        href={`/scenarios/${scenario.slug}`}
        className="text-sm text-stone-500 hover:text-ink"
      >
        ← Back to scenario
      </Link>

      <header className="mt-4 mb-8">
        <h1 className="font-serif text-4xl tracking-tight2 text-ink">
          Customize — {scenario.title}
        </h1>
        <p className="mt-2 text-stone-600 max-w-prose">
          Click any slot to swap the item. Total updates live. Save your setup to
          your account, or export as a shopping list.
        </p>
      </header>

      <Customizer
        scenarioSlug={scenario.slug}
        scenarioId={scenario.id}
        scenarioTitle={scenario.title}
        initialSetup={initialSetup}
        initialGuests={scenario.default_guest_count}
        allProducts={products}
        canSave={Boolean(user)}
      />
    </section>
  );
}
