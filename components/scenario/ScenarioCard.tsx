import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { computeTotal } from "@/lib/pricing";
import { setupForScenario } from "@/data/mock";
import { formatCurrency, titleCase } from "@/lib/utils";
import type { Scenario } from "@/types/domain";

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const setup = setupForScenario(scenario.slug);
  const { total_cents } = setup
    ? computeTotal(setup, scenario.default_guest_count)
    : { total_cents: 0 };

  return (
    <Link href={`/scenarios/${scenario.slug}`} className="group">
      <Card className="h-full group-hover:shadow-[0_2px_6px_rgba(0,0,0,0.06),_0_18px_40px_-18px_rgba(0,0,0,0.2)] transition">
        <div
          className="aspect-[4/3] bg-stone-100 bg-center bg-cover"
          style={{ backgroundImage: `url(${scenario.hero_image_url})` }}
          aria-hidden
        />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge>{titleCase(scenario.occasion)}</Badge>
            <Badge>{titleCase(scenario.style)}</Badge>
          </div>
          <h3 className="font-serif text-xl tracking-tight2 text-ink">
            {scenario.title}
          </h3>
          <p className="mt-1 text-sm text-stone-500 line-clamp-2">
            {scenario.description}
          </p>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-[13px] text-stone-500">
              For {scenario.default_guest_count} guests
            </span>
            <span className="font-medium text-ink">
              {formatCurrency(total_cents)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
