import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ItemList } from "@/components/scenario/ItemList";
import { PriceSummary } from "@/components/scenario/PriceSummary";
import {
  getCurrentUser,
  getCustomSetup,
  listProducts
} from "@/lib/queries";
import { computeTotal } from "@/lib/pricing";
import { PRODUCT_BY_ID } from "@/data/mock";
import type { Product, Setup, SlotId } from "@/types/domain";

export default async function SavedSetupPage({
  params
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const data = await getCustomSetup(user.id, params.id);
  if (!data) return notFound();
  const { setup: record, items } = data;

  const products = await listProducts();
  const productById = new Map(products.map((p) => [p.id, p]));

  const setup: Setup = {} as Setup;
  for (const it of items) {
    const p = productById.get(it.product_id) ?? PRODUCT_BY_ID[it.product_id];
    if (p) (setup as any)[it.slot as SlotId] = p as Product;
  }

  const { total_cents } = computeTotal(setup, record.guest_count);

  return (
    <section className="max-w-6xl mx-auto px-5 pt-10 pb-20">
      <Link href="/account" className="text-sm text-stone-500 hover:text-ink">
        ← Back to my setups
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight2 text-ink">
            {record.name}
          </h1>
          <p className="mt-1 text-stone-600">{record.guest_count} guests</p>
        </div>
        <Link href={`/account/setups/${record.id}/shopping-list`}>
          <Button size="md">Generate shopping list</Button>
        </Link>
      </header>

      <div className="mt-8 grid md:grid-cols-[1fr_320px] gap-8">
        <ItemList setup={setup} guestCount={record.guest_count} />
        <aside>
          <PriceSummary totalCents={total_cents} guestCount={record.guest_count} />
        </aside>
      </div>
    </section>
  );
}
