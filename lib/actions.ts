"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServer } from "@/lib/supabase/server";
import { generateTableImage } from "@/lib/ai/image";
import { buildScenarioHeroPrompt } from "@/lib/ai/prompts";
import { fetchAndStoreImage, getAdminSupabase } from "@/lib/ai/storage";
import { PRODUCT_BY_ID } from "@/data/mock";
import type { Product, Setup, SlotId } from "@/types/domain";

// ---------- auth ----------

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, error: "Email required" };
  const supabase = createSupabaseServer();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const origin = headers().get("origin") ?? "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` }
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOutAction() {
  const supabase = createSupabaseServer();
  if (!supabase) return;
  await supabase.auth.signOut();
  redirect("/");
}

// ---------- favorites ----------

export async function toggleFavorite(scenarioId: string) {
  const supabase = createSupabaseServer();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const { data: userResp } = await supabase.auth.getUser();
  const user = userResp.user;
  if (!user) redirect("/auth/login");

  const { data: existing } = await supabase
    .from("favorites")
    .select("scenario_id")
    .eq("user_id", user.id)
    .eq("scenario_id", scenarioId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("scenario_id", scenarioId);
  } else {
    await supabase
      .from("favorites")
      .insert({ user_id: user.id, scenario_id: scenarioId });
  }

  revalidatePath("/account");
  revalidatePath("/scenarios");
  return { ok: true, favorited: !existing };
}

// ---------- custom setups ----------

export async function saveCustomSetup(input: {
  baseScenarioId: string | null;
  name: string;
  guestCount: number;
  items: { slot: SlotId; productId: string }[];
}) {
  const supabase = createSupabaseServer();
  if (!supabase) return { ok: false, error: "Supabase not configured" };

  const { data: userResp } = await supabase.auth.getUser();
  const user = userResp.user;
  if (!user) redirect("/auth/login");

  const { data: setup, error } = await supabase
    .from("custom_setups")
    .insert({
      user_id: user.id,
      base_scenario_id: input.baseScenarioId,
      name: input.name || "Untitled setup",
      guest_count: Math.max(1, Math.floor(input.guestCount))
    })
    .select("id")
    .single();

  if (error || !setup) return { ok: false, error: error?.message ?? "Save failed" };

  const rows = input.items.map((it) => ({
    setup_id: setup.id,
    slot: it.slot,
    product_id: it.productId
  }));
  await supabase.from("custom_setup_items").insert(rows);

  revalidatePath("/account");
  return { ok: true, id: setup.id };
}

// ---------- AI image generation ----------

/**
 * Re-generates the hero image for a scenario using the configured AI provider,
 * uploads to Supabase Storage, and stamps `scenarios.generated_hero_url`.
 *
 * Callable from the client via Server Action. Requires SUPABASE_SERVICE_ROLE_KEY
 * in env (for Storage write) — so this is disabled if not configured.
 */
export async function regenerateScenarioHero(scenarioId: string) {
  const hasServiceRole = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  );
  if (!hasServiceRole) {
    return {
      ok: false as const,
      error:
        "Image generation requires SUPABASE_SERVICE_ROLE_KEY in Vercel env. Contact the admin."
    };
  }

  try {
    const admin = getAdminSupabase();
    const { data: scenario } = await admin
      .from("scenarios")
      .select("*")
      .eq("id", scenarioId)
      .maybeSingle();
    if (!scenario) return { ok: false as const, error: "Scenario not found" };

    const { data: items } = await admin
      .from("scenario_items")
      .select("slot, product_id")
      .eq("scenario_id", scenarioId);
    const { data: products } = await admin.from("products").select("*");
    const productById = new Map((products ?? []).map((p) => [p.id, p]));

    const setup: Setup = {} as Setup;
    for (const it of items ?? []) {
      const p = productById.get(it.product_id) ?? PRODUCT_BY_ID[it.product_id];
      if (p) (setup as any)[it.slot as SlotId] = p as Product;
    }

    const prompt = buildScenarioHeroPrompt(scenario as any, setup);
    const generated = await generateTableImage(prompt);
    const stamp = Date.now();
    const publicUrl = await fetchAndStoreImage(
      generated.url,
      `${scenario.slug}-${stamp}`
    );

    await admin
      .from("scenarios")
      .update({
        generated_hero_url: publicUrl,
        generated_at: new Date().toISOString()
      })
      .eq("id", scenarioId);

    revalidatePath(`/scenarios/${scenario.slug}`);
    return { ok: true as const, url: publicUrl };
  } catch (e: any) {
    return {
      ok: false as const,
      error: e?.message ?? "Image generation failed"
    };
  }
}
