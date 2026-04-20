"use client";

import { useEffect } from "react";
import { formatCurrency, titleCase } from "@/lib/utils";
import { SLOT_BY_ID } from "@/lib/slots";
import type { Product, SlotId } from "@/types/domain";

export function ProductSwapper({
  slot,
  current,
  products,
  onSelect,
  onClose
}: {
  slot: SlotId;
  current: Product;
  products: Product[];
  onSelect: (p: Product) => void;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-30 bg-black/40"
      onClick={onClose}
    >
      <div
        className="absolute right-0 top-0 h-full w-full sm:w-[440px] bg-paper p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-2xl tracking-tight2 text-ink">
            Swap {SLOT_BY_ID[slot].label}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-lg hover:bg-stone-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="text-[13px] text-stone-500 mb-4">
          {SLOT_BY_ID[slot].hint}
        </p>

        <div className="space-y-2">
          {products.map((p) => {
            const isCurrent = p.id === current.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p)}
                className={`w-full text-left rounded-lg border bg-paper p-3 flex gap-3 items-center transition ${
                  isCurrent
                    ? "border-accent"
                    : "border-stone-200 hover:border-accent"
                }`}
              >
                <div
                  className="w-14 h-14 rounded bg-stone-100 bg-center bg-cover shrink-0"
                  style={{ backgroundImage: `url(${p.image_url})` }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                  <p className="text-[12px] text-stone-500">
                    {titleCase(p.style)} · {formatCurrency(p.price_cents)}
                  </p>
                </div>
                {isCurrent && (
                  <span className="text-[11px] text-accent ml-2">current</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
