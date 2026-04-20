import { SLOTS } from "@/lib/slots";
import type { Product, Scenario, Setup, SlotId } from "@/types/domain";

/**
 * Builds a DALL-E / FLUX prompt that renders a beautifully set dining table
 * in the style and mood of the given scenario. The prompt is deliberately
 * descriptive — table settings need a lot of specificity to look right.
 */
export function buildScenarioHeroPrompt(scenario: Scenario, setup: Setup) {
  const styleMood = STYLE_MOODS[scenario.style] ?? "refined and tasteful";
  const lighting  = OCCASION_LIGHTING[scenario.occasion] ?? "warm golden-hour sunlight";
  const palette   = STYLE_PALETTE[scenario.style] ?? "warm neutral tones";

  const items = SLOTS.map((slot) => {
    const p = setup[slot.id];
    if (!p) return null;
    return `${p.name.toLowerCase()}`;
  }).filter(Boolean).join(", ");

  return [
    `A beautifully set dining table for ${humanOccasion(scenario.occasion)},`,
    `${styleMood} ${scenario.style} aesthetic.`,
    `${scenario.description}`,
    `The place settings include: ${items}.`,
    `Color palette: ${palette}.`,
    `Styled as editorial food photography:`,
    `shot from a slight 3/4 overhead angle,`,
    `shallow depth of field, ${lighting},`,
    `magazine-quality composition, tactile textures,`,
    `hyper-detailed, 8k, natural skin-tone accuracy,`,
    `no text, no logos, no hands or people visible.`
  ].join(" ");
}

/** Prompt for a custom user setup (not one of the curated scenarios). */
export function buildCustomSetupPrompt(
  title: string,
  style: string,
  setup: Setup,
  guestCount: number
) {
  const items = SLOTS.map((s) => setup[s.id]?.name.toLowerCase()).filter(Boolean).join(", ");
  return [
    `A beautifully set dining table: ${title}.`,
    `Styled for ${guestCount} guests, ${style} aesthetic.`,
    `Includes: ${items}.`,
    `Editorial food photography, warm natural light, 3/4 overhead angle,`,
    `magazine-quality, no text or people.`
  ].join(" ");
}

// ---------- helpers ----------

const STYLE_MOODS: Record<string, string> = {
  modern:  "crisp, considered, and minimally decorative",
  rustic:  "warm, lived-in, and organic",
  classic: "timeless, refined, and elegant",
  minimal: "pared-back, airy, and quietly luxurious",
  festive: "rich, saturated, and celebratory",
  boho:    "textured, eclectic, and layered",
  coastal: "breezy, sun-bleached, and relaxed",
  scandi:  "pale, clean, and quietly grounded"
};

const STYLE_PALETTE: Record<string, string> = {
  modern:  "soft whites, muted greys, brushed metallics",
  rustic:  "sage, oat, terracotta, warm wood",
  classic: "ivory, cream, gold, blush",
  minimal: "warm whites, pale stone, natural linen",
  festive: "deep red, forest green, matte gold, candlelight",
  boho:    "ochre, rust, cream, natural fibers",
  coastal: "blue, crisp white, sand, pale wood",
  scandi:  "off-white, pale grey, light oak"
};

const OCCASION_LIGHTING: Record<string, string> = {
  thanksgiving: "soft late-autumn afternoon light",
  christmas:    "warm candlelit evening with bokeh",
  birthday:     "bright cheerful daylight",
  dinner_party: "warm amber evening light",
  easter:       "soft morning spring light",
  everyday:     "warm natural midday light",
  halloween:    "moody low warm light with candle glow",
  mothers_day:  "bright soft morning light through a window",
  hanukkah:     "warm candlelit glow from menorah and tapers",
  bbq_cookout:  "golden outdoor late afternoon sun",
  rehearsal:    "soft warm romantic evening light"
};

function humanOccasion(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/bbq cookout/gi, "summer BBQ cookout")
    .replace(/rehearsal/gi, "wedding rehearsal dinner");
}
