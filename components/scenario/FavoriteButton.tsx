"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { toggleFavorite } from "@/lib/actions";

export function FavoriteButton({
  scenarioId,
  initialFavorited
}: {
  scenarioId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    // Optimistic toggle — server action confirms below.
    setFavorited((v) => !v);
    startTransition(async () => {
      const res = await toggleFavorite(scenarioId);
      if (res && typeof res === "object" && "favorited" in res) {
        setFavorited(Boolean(res.favorited));
      }
    });
  }

  return (
    <Button
      variant={favorited ? "secondary" : "outline"}
      size="lg"
      className="w-full"
      onClick={handleClick}
      disabled={pending}
    >
      {favorited ? "★ Favorited" : "☆ Save to favorites"}
    </Button>
  );
}
