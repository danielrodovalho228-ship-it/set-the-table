import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  getCurrentUser,
  listCustomSetups,
  listFavorites
} from "@/lib/queries";
import { hasSupabase } from "@/lib/supabase/server";

export default async function AccountPage() {
  if (!hasSupabase()) {
    return (
      <section className="max-w-3xl mx-auto px-5 pt-20 pb-24 text-center">
        <h1 className="font-serif text-4xl tracking-tight2 text-ink">
          My Setups
        </h1>
        <p className="mt-3 text-stone-600 max-w-prose mx-auto">
          Configure <code className="text-accent">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and <code className="text-accent">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          in <code>.env.local</code> to enable accounts.
        </p>
      </section>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [favorites, setups] = await Promise.all([
    listFavorites(user.id),
    listCustomSetups(user.id)
  ]);

  return (
    <section className="max-w-5xl mx-auto px-5 pt-12 pb-20">
      <header className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-4xl tracking-tight2 text-ink">
            My Setups
          </h1>
          <p className="mt-1 text-stone-600">{user.email}</p>
        </div>
        <form action="/auth/logout" method="post">
          <Button variant="outline" size="sm" type="submit">Sign out</Button>
        </form>
      </header>

      <section className="mb-14">
        <h2 className="font-serif text-2xl tracking-tight2 text-ink mb-4">
          Favorites
        </h2>
        {favorites.length === 0 ? (
          <Card>
            <div className="p-8 text-center text-stone-600">
              You haven't saved any favorites yet.{" "}
              <Link href="/explore" className="text-accent hover:underline">
                Explore settings →
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((s) => (
              <Link
                key={s.id}
                href={`/scenarios/${s.slug}`}
                className="group"
              >
                <Card>
                  <div
                    className="aspect-[4/3] bg-stone-100 bg-center bg-cover"
                    style={{ backgroundImage: `url(${s.hero_image_url})` }}
                    aria-hidden
                  />
                  <div className="p-4">
                    <p className="font-serif text-lg tracking-tight2 text-ink">
                      {s.title}
                    </p>
                    <p className="text-[13px] text-stone-500">
                      {s.occasion.replace("_", " ")}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-2xl tracking-tight2 text-ink mb-4">
          Saved setups
        </h2>
        {setups.length === 0 ? (
          <Card>
            <div className="p-8 text-center text-stone-600">
              No custom setups yet. Open any scenario and hit{" "}
              <span className="font-medium">Customize</span>.
            </div>
          </Card>
        ) : (
          <ul className="divide-y divide-stone-200 border border-stone-200 rounded-lg overflow-hidden bg-paper">
            {setups.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-ink">{s.name}</p>
                  <p className="text-[13px] text-stone-500">
                    {s.guest_count} guests ·{" "}
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/account/setups/${s.id}`}
                  className="text-sm text-accent hover:underline"
                >
                  Open →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
