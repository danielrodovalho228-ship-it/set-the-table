"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="max-w-xl mx-auto px-5 py-24 text-center">
      <h1 className="font-serif text-4xl tracking-tight2 text-ink">
        Something went wrong
      </h1>
      <p className="mt-3 text-stone-600">
        {error?.message || "An unexpected error occurred."}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    </section>
  );
}
