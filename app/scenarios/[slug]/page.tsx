import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ItemList } from "@/components/scenario/ItemList";
import { PriceSummary } from "@/components/scenario/PriceSummary";
import { FavoriteButton } from "@/components/scenario/FavoriteButton";
import {
  getCurrentUser,
  getScenario,
  isFavorited,
  listProducts
} from "@/lib/queries";
import { computeTotal } from "@/lib/pricing";
import { PRODUCT_BY_ID, setupForScenario } from "@/data/mock";
import { titleCase } from "@/lib/utils";
import type { Product, Setup, SlotId } from "@/types/domain";

export default async function ScenarioPage({
  params
}: {
  params: { slug: string };
}) {
  const scenario = await getScenario(params.slug);
  if (!scenario) return notFound();

  const products = await listProducts();
  const productById = new Map(products.map((p) => [p.id, p]));

  const setup: Setup = (() => {
    const built: Partial<Setup> = {};
    for (const [slot, productId] of Object.entries(scenario.items)) {
      const p = productById.get(productId) ?? PRODUCT_BY_ID[productId];
      if (p) built[slot as SlotId] = p as Product;
    }
    if (Object.keys(built).length === 10) return built as Setup;
    return setupForScenario(scenario.slug) as Setup;
  })();

  const guestCount = scenario.default_guest_count;
  const { total_cents } = computeTotal(setup, guestCount);

  const user = await getCurrentUser();
  const initialFavorited = user
    ? await isFavorited(user.id, scenario.id)
    : false;

  return (
    <article className="max-w-6xl mx-auto px-5 pt-10 pb-20">
      <Link href="/explore" className="text-sm text-stone-500 hover:text-ink">
        ← Back to explore
      </Link>

      <header className="mt-4 grid md:grid-cols-2 gap-8 items-end">
        <div>
          <div className="flex gap-2 mb-3">
            <Badge>{titleCase(scenario.occasion)}</Badge>
            <Badge>{titleCase(scenario.style)}</Badge>
          </div>
          <h1 className="font-serif text-5xl tracking-tight2 text-ink">
            {scenario.title}
          </h1>
          <p className="mt-4 text-[17px] text-stone-600 max-w-prose">
            {scenario.description}
          </p>
        </div>
        <div
          className="aspect-[5/4] rounded-xl bg-stone-100 bg-center bg-cover shadow-soft"
          style={{ backgroundImage: `url(${scenario.hero_image_url})` }}
          aria-hidden
        />
      </header>

      <section className="mt-12 grid md:grid-cols-[1fr_320px] gap-8">
        <div>
          <h2 className="font-serif text-2xl tracking-tight2 text-ink mb-4">
            What's on the table
          </h2>
          <ItemList setup={setup} guestCount={guestCount} />
        </div>
        <aside className="space-y-4">
          <PriceSummary totalCents={total_cents} guestCount={guestCount} />

          <div className="flex flex-col gap-2">
            <Link href={`/scenarios/${scenario.slug}/customize`}>
              <Button className="w-full" size="lg">Customize</Button>
            </Link>
            <FavoriteButton
              scenarioId={scenario.id}
              initialFavorited={initialFavorited}
            />
            <Link href={`/scenarios/${scenario.slug}/customize`}>
              <Button variant="ghost" size="lg" className="w-full">
                Generate shopping list
              </Button>
            </Link>
          </div>

          <p className="text-[12px] text-stone-500 leading-relaxed">
            Prices are estimates for {guestCount} guests. Per-guest items scale
            with your guest count.
          </p>
        </aside>
      </section>
    </article>
  );
}
