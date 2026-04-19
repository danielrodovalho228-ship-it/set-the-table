"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { SlotId } from "@/types/domain";

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
