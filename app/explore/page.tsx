import Link from "next/link";
import { ScenarioCard } from "@/components/scenario/ScenarioCard";
import { Select } from "@/components/ui/Select";
import { listScenarios } from "@/lib/queries";
import type { BudgetTier, Occasion, Style } from "@/types/domain";

interface SearchParams {
  occasion?: string;
  style?: string;
  budget?: string;
}

const BUDGET_LABEL: Record<BudgetTier, string> = {
  under_100: "Under $100",
  "100_250": "$100–250",
  "250_500": "$250–500",
  "500_plus": "$500+"
};

export default async function ExplorePage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const { occasion, style, budget } = searchParams;
  const all = await listScenarios();

  const filtered = all.filter((s) => {
    if (occasion && occasion !== "all" && s.occasion !== occasion) return false;
    if (style    && style    !== "all" && s.style    !== style)    return false;
    if (budget   && budget   !== "all" && s.budget_tier !== budget) return false;
    return true;
  });

  const occasions: Occasion[] = [
    "thanksgiving", "christmas", "birthday", "dinner_party", "easter",
    "halloween", "mothers_day", "hanukkah", "bbq_cookout", "rehearsal"
  ];
  const styles: Style[] = [
    "modern", "rustic", "classic", "minimal", "festive",
    "boho", "coastal", "scandi"
  ];
  const budgets: BudgetTier[] = ["under_100", "100_250", "250_500", "500_plus"];

  return (
    <section className="max-w-6xl mx-auto px-5 pt-12 pb-16">
      <header className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight2 text-ink">Explore</h1>
        <p className="mt-2 text-stone-600 max-w-prose">
          Curated table settings, ready to copy or customize.
        </p>
      </header>

      <form
        method="get"
        action="/explore"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
      >
        <label className="flex flex-col gap-1 text-sm text-stone-600">
          Occasion
          <Select name="occasion" defaultValue={occasion ?? "all"}>
            <option value="all">All occasions</option>
            {occasions.map((o) => (
              <option key={o} value={o}>{o.replace("_", " ")}</option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-stone-600">
          Style
          <Select name="style" defaultValue={style ?? "all"}>
            <option value="all">Any style</option>
            {styles.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-stone-600">
          Budget
          <Select name="budget" defaultValue={budget ?? "all"}>
            <option value="all">Any budget</option>
            {budgets.map((b) => (
              <option key={b} value={b}>{BUDGET_LABEL[b]}</option>
            ))}
          </Select>
        </label>
        <div className="sm:col-span-3 flex items-center gap-3">
          <button
            type="submit"
            className="h-11 px-5 rounded-lg bg-ink text-paper text-[15px] hover:bg-stone-700"
          >
            Apply filters
          </button>
          <Link href="/explore" className="text-sm text-stone-500 hover:text-ink">
            Reset
          </Link>
        </div>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-paper p-10 text-center">
          <p className="text-stone-600">No scenarios match those filters.</p>
          <Link href="/explore" className="text-accent hover:underline text-sm">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <ScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      )}
    </section>
  );
}
