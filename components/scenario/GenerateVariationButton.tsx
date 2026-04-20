"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { regenerateScenarioHero } from "@/lib/actions";

/**
 * Triggers a fresh AI generation for the scenario hero image.
 * After success, calls router.refresh() — the server component re-fetches
 * `generated_hero_url` and the image swaps automatically.
 *
 * Each click costs ~$0.04-0.08 in production (DALL-E 3 HD).
 */
export function GenerateVariationButton({
  scenarioId
}: {
  scenarioId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await regenerateScenarioHero(scenarioId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error ?? "Could not generate a new image");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? "Generating…" : "✨ Generate variation"}
      </Button>
      {error && (
        <p className="text-[12px] text-red-700 max-w-xs" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
