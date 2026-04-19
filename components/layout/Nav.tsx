import Link from "next/link";
import { getCurrentUser } from "@/lib/queries";

export async function Nav() {
  // Server component: reads current user once per request.
  const user = await getCurrentUser().catch(() => null);

  return (
    <header className="w-full border-b border-stone-200 bg-paper/80 backdrop-blur sticky top-0 z-20 print:hidden">
      <div className="max-w-6xl mx-auto h-16 px-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="font-serif text-lg tracking-tight2 text-ink">
            Set the Table
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-[15px] text-stone-700">
          <Link href="/explore" className="hover:text-ink">Explore</Link>
          {user ? (
            <>
              <Link href="/account" className="hover:text-ink">My Setups</Link>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="h-9 inline-flex items-center px-3 rounded-lg text-sm text-stone-600 hover:bg-stone-100"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/account" className="hover:text-ink">My Setups</Link>
              <Link
                href="/auth/login"
                className="h-9 inline-flex items-center px-4 rounded-lg bg-ink text-paper hover:bg-stone-700"
              >
                Sign in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
