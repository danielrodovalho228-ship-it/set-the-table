import type { SlotId } from "@/types/domain";

export interface SlotDef {
  id: SlotId;
  label: string;
  per_guest: boolean;
  hint: string;
}

export const SLOTS: readonly SlotDef[] = [
  { id: "tablecloth",   label: "Tablecloth",   per_guest: false, hint: "Sets the foundation of the table." },
  { id: "runner",       label: "Runner",       per_guest: false, hint: "A central band that anchors the centerpiece." },
  { id: "charger",      label: "Charger",      per_guest: true,  hint: "Decorative under-plate beneath the dinner plate." },
  { id: "dinner_plate", label: "Dinner Plate", per_guest: true,  hint: "The main course plate." },
  { id: "salad_plate",  label: "Salad Plate",  per_guest: true,  hint: "Stacks on the dinner plate or beside it." },
  { id: "napkin",       label: "Napkin",       per_guest: true,  hint: "Cloth napkins lift any setting." },
  { id: "flatware",     label: "Flatware Set", per_guest: true,  hint: "Knife, fork, spoon — per guest." },
  { id: "glasses",      label: "Glassware",    per_guest: true,  hint: "Water and wine, per guest." },
  { id: "centerpiece",  label: "Centerpiece",  per_guest: false, hint: "The visual heart of the table." },
  { id: "candles",      label: "Candles",      per_guest: false, hint: "Tapers or pillars — warm light." }
] as const;

export const SLOT_BY_ID: Record<SlotId, SlotDef> = Object.fromEntries(
  SLOTS.map((s) => [s.id, s])
) as Record<SlotId, SlotDef>;
