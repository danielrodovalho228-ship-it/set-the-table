import Link from "next/link";

export default function NotFound() {
  return (
    <section className="max-w-xl mx-auto px-5 py-24 text-center">
      <h1 className="font-serif text-5xl tracking-tight2 text-ink">Not found</h1>
      <p className="mt-3 text-stone-600">
        We couldn't find that table. Let's head back to the gallery.
      </p>
      <div className="mt-6">
        <Link
          href="/explore"
          className="inline-flex items-center h-11 px-5 rounded-lg bg-ink text-paper hover:bg-stone-700"
        >
          Explore settings
        </Link>
      </div>
    </section>
  );
}
