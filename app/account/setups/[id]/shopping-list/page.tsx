import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShoppingList } from "@/components/shopping/ShoppingList";
import { ShoppingActions } from "@/components/shopping/ShoppingActions";
import {
  getCurrentUser,
  getCustomSetup,
  listProducts
} from "@/lib/queries";
import { PRODUCT_BY_ID } from "@/data/mock";
import { buildShoppingList } from "@/lib/shopping";
import type { Setup, SlotId, Product } from "@/types/domain";

// Shopping list built from a saved custom setup.
export default async function SavedSetupShoppingListPage({
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

  const { groups, total_cents } = buildShoppingList(setup, record.guest_count);
  const title = `${record.name} — shopping list`;

  return (
    <section className="max-w-4xl mx-auto px-5 pt-10 pb-20 print:pt-4">
      <Link
        href={`/account/setups/${record.id}`}
        className="text-sm text-stone-500 hover:text-ink print:hidden"
      >
        ← Back to setup
      </Link>

      <header className="mt-4 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight2 text-ink">{title}</h1>
          <p className="mt-1 text-stone-600">{record.guest_count} guests</p>
        </div>
        <ShoppingActions
          title={title}
          groups={groups}
          totalCents={total_cents}
          guests={record.guest_count}
        />
      </header>

      <ShoppingList
        groups={groups}
        totalCents={total_cents}
        guests={record.guest_count}
      />
    </section>
  );
}
