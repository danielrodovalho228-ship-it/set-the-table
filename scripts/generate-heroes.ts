#!/usr/bin/env tsx
/**
 * scripts/generate-heroes.ts
 *
 * Pre-generates an AI hero image for every scenario in the DB, uploads to
 * Supabase Storage, and stamps `scenarios.generated_hero_url`.
 *
 * Run locally (NOT on Vercel — would burn build time + money on every deploy):
 *
 *     npx tsx scripts/generate-heroes.ts
 *
 * Required env (.env.local):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY  (Supabase Dashboard → Settings → API → service_role)
 *   - OPENAI_API_KEY              (or FAL_API_KEY / REPLICATE_API_TOKEN)
 *   - IMAGE_PROVIDER              (openai | fal | replicate)
 *
 * Cost estimate (DALL-E 3 HD, ~US$0.08 each):
 *   - 11 scenarios = ~US$0.88 total
 *
 * Safe to re-run — uses upsert and skips scenarios with --skip-existing flag.
 */

import { config as loadEnv } from "dotenv"; loadEnv({ path: ".env.local" }); loadEnv();
import { generateTableImage } from "../lib/ai/image";
import { buildScenarioHeroPrompt } from "../lib/ai/prompts";
import { fetchAndStoreImage, getAdminSupabase } from "../lib/ai/storage";
import { PRODUCT_BY_ID } from "../data/mock";
import type { Setup, SlotId } from "../types/domain";

const SKIP_EXISTING = process.argv.includes("--skip-existing");
const ONE_SLUG = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

async function main() {
  const supabase = getAdminSupabase();

  console.log("→ Fetching scenarios + scenario_items + products from Supabase…");
  const { data: scenarios, error: sErr } = await supabase
    .from("scenarios")
    .select("*")
    .order("title");
  if (sErr || !scenarios) throw sErr ?? new Error("no scenarios");

  const { data: items } = await supabase
    .from("scenario_items")
    .select("scenario_id, slot, product_id");
  const { data: products } = await supabase.from("products").select("*");
  const productById = new Map((products ?? []).map((p) => [p.id, p]));

  const targets = scenarios.filter((s) => !ONE_SLUG || s.slug === ONE_SLUG);
  console.log(`→ ${targets.length} scenarios to process`);

  for (const scenario of targets) {
    if (SKIP_EXISTING && scenario.generated_hero_url) {
      console.log(`  - skip ${scenario.slug} (already has generated hero)`);
      continue;
    }

    // Build the Setup object
    const setup: Setup = {} as Setup;
    for (const it of items ?? []) {
      if (it.scenario_id !== scenario.id) continue;
      const p = productById.get(it.product_id) ?? PRODUCT_BY_ID[it.product_id];
      if (p) (setup as any)[it.slot as SlotId] = p;
    }
    if (Object.keys(setup).length < 5) {
      console.log(`  - skip ${scenario.slug} (incomplete setup)`);
      continue;
    }

    const prompt = buildScenarioHeroPrompt(scenario as any, setup);
    console.log(`\n→ ${scenario.slug}`);
    console.log(`  prompt: ${prompt.slice(0, 140)}…`);

    try {
      const { url, provider } = await generateTableImage(prompt);
      console.log(`  generated via ${provider}`);
      const publicUrl = await fetchAndStoreImage(url, scenario.slug);
      console.log(`  uploaded → ${publicUrl}`);

      const { error: updErr } = await supabase
        .from("scenarios")
        .update({
          generated_hero_url: publicUrl,
          generated_at: new Date().toISOString()
        })
        .eq("id", scenario.id);
      if (updErr) throw updErr;
      console.log(`  ✓ scenarios.generated_hero_url updated`);
    } catch (e: any) {
      console.error(`  ✗ FAILED ${scenario.slug}: ${e?.message ?? e}`);
    }
  }

  console.log("\n✓ Done.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
