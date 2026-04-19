"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { SLOT_BY_ID } from "@/lib/slots";
import type { GroupedShopping } from "@/lib/shopping";

function buildPlaintext(
  title: string,
  groups: GroupedShopping[],
  totalCents: number,
  guests: number
) {
  const lines: string[] = [];
  lines.push(`${title}`);
  lines.push(`${guests} guests · estimated total ${formatCurrency(totalCents)}`);
  lines.push("");
  for (const g of groups) {
    lines.push(`# ${g.section.label} — ${formatCurrency(g.subtotal_cents)}`);
    for (const l of g.lines) {
      lines.push(
        `  - ${l.product.name}  (${SLOT_BY_ID[l.slot].label}, qty ${l.quantity}) — ${formatCurrency(l.subtotal_cents)}`
      );
    }
    lines.push("");
  }
  lines.push(`Total: ${formatCurrency(totalCents)}`);
  return lines.join("\n");
}

export function ShoppingActions({
  title,
  groups,
  totalCents,
  guests
}: {
  title: string;
  groups: GroupedShopping[];
  totalCents: number;
  guests: number;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        buildPlaintext(title, groups, totalCents, guests)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button onClick={copy} variant="primary" size="md">
        {copied ? "Copied ✓" : "Copy to clipboard"}
      </Button>
      <Button onClick={() => window.print()} variant="outline" size="md">
        Print / Save as PDF
      </Button>
    </div>
  );
}
