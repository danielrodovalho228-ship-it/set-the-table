import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ScenarioCard } from "@/components/scenario/ScenarioCard";
import { listScenarios } from "@/lib/queries";

export default async function HomePage() {
  const all = await listScenarios();
  const featured = all.slice(0, 3);
  const hero = featured[0];

  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-14">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm tracking-[0.18em] uppercase text-accent mb-4">
              Tables worth remembering
            </p>
            <h1 className="font-serif text-5xl md:text-6xl tracking-tight2 text-ink leading-[1.02]">
              Set the perfect table,{" "}
              <span className="text-accent">for any occasion.</span>
            </h1>
            <p className="mt-5 text-[17px] text-stone-600 max-w-prose">
              Browse curated table settings for Thanksgiving, Christmas,
              birthdays and dinner parties. Customize every piece, see the cost
              instantly, and save a shopping list for the evening.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/explore">
                <Button size="lg">Explore settings</Button>
              </Link>
              {hero && (
                <Link href={`/scenarios/${hero.slug}`}>
                  <Button size="lg" variant="outline">See a sample</Button>
                </Link>
              )}
            </div>
          </div>
          {hero && (
            <div
              className="aspect-[5/4] rounded-xl bg-stone-100 bg-center bg-cover shadow-soft"
              style={{
                backgroundImage: `url(${hero.generated_hero_url ?? hero.hero_image_url})`
              }}
              aria-hidden
            />
          )}
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-6xl mx-auto px-5 py-10 grid md:grid-cols-3 gap-6">
        {[
          {
            t: "Curated by occasion",
            d: "Holiday dinners, birthdays, and intimate gatherings — every scenario is a starting point you can actually use."
          },
          {
            t: "Customize every slot",
            d: "Swap tablecloth, plates, napkins, flatware, centerpiece. The cost updates as you go."
          },
          {
            t: "Shopping list in one click",
            d: "Grouped by category, with quantities tied to your guest count."
          }
        ].map((c) => (
          <div key={c.t} className="rounded-lg border border-stone-200 bg-paper p-6">
            <h3 className="font-serif text-xl tracking-tight2 text-ink">{c.t}</h3>
            <p className="mt-2 text-[15px] text-stone-600">{c.d}</p>
          </div>
        ))}
      </section>

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-3xl tracking-tight2 text-ink">
            Featured occasions
          </h2>
          <Link href="/explore" className="text-sm text-accent hover:underline">
            Explore all →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((s) => (
            <ScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="rounded-xl bg-ink text-paper px-10 py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="font-serif text-3xl tracking-tight2">
              Plan your next table in minutes.
            </h2>
            <p className="mt-2 text-stone-300 max-w-prose">
              Save favorites, customize settings, and bring a shopping list to
              check out.
            </p>
          </div>
          <Link href="/explore">
            <Button size="lg" variant="secondary">Start exploring</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
