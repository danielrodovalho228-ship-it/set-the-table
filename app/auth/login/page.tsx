import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signInWithMagicLink } from "@/lib/actions";

export default function LoginPage({
  searchParams
}: {
  searchParams: { sent?: string; err?: string };
}) {
  async function onSubmit(formData: FormData) {
    "use server";
    const res = await signInWithMagicLink(formData);
    const { redirect } = await import("next/navigation");
    if (res.ok) redirect("/auth/login?sent=1");
    redirect(`/auth/login?err=${encodeURIComponent(res.error ?? "failed")}`);
  }

  return (
    <section className="max-w-md mx-auto px-5 pt-20 pb-24">
      <h1 className="font-serif text-3xl tracking-tight2 text-ink">Sign in</h1>
      <p className="mt-2 text-stone-600 text-[15px]">
        We'll email you a one-time link. No password to remember.
      </p>

      {searchParams.sent === "1" ? (
        <div className="mt-8 rounded-lg border border-stone-200 bg-paper p-5">
          <p className="text-ink font-medium">Check your email.</p>
          <p className="text-stone-600 text-[14px] mt-1">
            We sent you a sign-in link. It expires in a few minutes.
          </p>
        </div>
      ) : (
        <form action={onSubmit} className="mt-8 flex flex-col gap-3">
          <label className="text-sm text-stone-600">
            Email
            <Input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="mt-1"
            />
          </label>
          <Button type="submit" size="lg">
            Email me a sign-in link
          </Button>
          {searchParams.err && (
            <p className="text-sm text-red-700">{searchParams.err}</p>
          )}
        </form>
      )}

      <p className="mt-5 text-[12px] text-stone-500">
        You can still browse and customize without signing in — auth is only
        required to save favorites and setups.
      </p>
    </section>
  );
}
