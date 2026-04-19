"use client";

import { useMemo, useReducer, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProductSwapper } from "./ProductSwapper";
import { SlotCard } from "./SlotCard";
import { LivePrice } from "./LivePrice";
import { SLOTS } from "@/lib/slots";
import { computeTotal } from "@/lib/pricing";
import { saveCustomSetup } from "@/lib/actions";
import type { Product, Setup, SlotId } from "@/types/domain";

type State = { setup: Setup; guests: number; name: string };
type Action =
  | { type: "SWAP"; slot: SlotId; product: Product }
  | { type: "SET_GUESTS"; value: number }
  | { type: "SET_NAME"; value: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SWAP":
      return { ...state, setup: { ...state.setup, [action.slot]: action.product } };
    case "SET_GUESTS":
      return { ...state, guests: Math.max(1, Math.min(50, Math.floor(action.value || 1))) };
    case "SET_NAME":
      return { ...state, name: action.value };
  }
}

interface Props {
  scenarioSlug: string;
  scenarioId: string | null;
  scenarioTitle: string;
  initialSetup: Setup;
  initialGuests: number;
  allProducts: Product[];
  canSave: boolean;
}

export function Customizer({
  scenarioSlug,
  scenarioId,
  scenarioTitle,
  initialSetup,
  initialGuests,
  allProducts,
  canSave
}: Props) {
  const [state, dispatch] = useReducer(reducer, {
    setup: initialSetup,
    guests: initialGuests,
    name: `${scenarioTitle} — my version`
  });

  const [openSlot, setOpenSlot] = useState<SlotId | null>(null);
  const [saving, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Products bucketed by slot — computed once per render, cheap for ~40 products.
  const productsBySlot = useMemo(() => {
    const map = new Map<SlotId, Product[]>();
    for (const p of allProducts) {
      const arr = map.get(p.category) ?? [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return map;
  }, [allProducts]);

  const { total_cents } = computeTotal(state.setup, state.guests);

  function handleSave() {
    if (!canSave) {
      window.location.href = "/auth/login";
      return;
    }
    const items = SLOTS.map((s) => ({
      slot: s.id,
      productId: state.setup[s.id].id
    }));
    startTransition(async () => {
      const res = await saveCustomSetup({
        baseScenarioId: scenarioId,
        name: state.name,
        guestCount: state.guests,
        items
      });
      if (res.ok) {
        setSaveMessage("Saved. Find it under My Setups.");
      } else {
        setSaveMessage(res.error ?? "Could not save.");
      }
    });
  }

  return (
    <div className="grid md:grid-cols-[1fr_340px] gap-8">
      <div className="grid sm:grid-cols-2 gap-3">
        {SLOTS.map((slot) => (
          <SlotCard
            key={slot.id}
            slot={slot}
            product={state.setup[slot.id]}
            guests={state.guests}
            onClick={() => setOpenSlot(slot.id)}
          />
        ))}
      </div>

      <aside className="space-y-4">
        <LivePrice totalCents={total_cents} guests={state.guests} />

        <label className="block text-sm text-stone-600">
          Guest count
          <Input
            type="number"
            min={1}
            max={50}
            value={state.guests}
            onChange={(e) =>
              dispatch({ type: "SET_GUESTS", value: Number(e.target.value) })
            }
            className="mt-1"
          />
        </label>

        <label className="block text-sm text-stone-600">
          Name this setup
          <Input
            value={state.name}
            onChange={(e) => dispatch({ type: "SET_NAME", value: e.target.value })}
            className="mt-1"
          />
        </label>

        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : canSave ? "Save setup" : "Sign in to save"}
          </Button>
          <a
            href={`/scenarios/${scenarioSlug}/shopping-list?guests=${state.guests}&${SLOTS
              .map((s) => `${s.id}=${state.setup[s.id].id}`)
              .join("&")}`}
          >
            <Button variant="outline" size="lg" className="w-full">
              Generate shopping list
            </Button>
          </a>
        </div>

        {saveMessage && (
          <p className="text-[13px] text-stone-600" aria-live="polite">
            {saveMessage}
          </p>
        )}

        <p className="text-[12px] text-stone-500 leading-relaxed">
          Per-guest items (plates, napkins, flatware, glasses, chargers) scale with
          your guest count.
        </p>
      </aside>

      {openSlot && (
        <ProductSwapper
          slot={openSlot}
          current={state.setup[openSlot]}
          products={productsBySlot.get(openSlot) ?? []}
          onSelect={(p) => {
            dispatch({ type: "SWAP", slot: openSlot, product: p });
            setOpenSlot(null);
          }}
          onClose={() => setOpenSlot(null)}
        />
      )}
    </div>
  );
}
