import { createSupabaseServer, hasSupabase } from "@/lib/supabase/server";
import {
  PRODUCTS as MOCK_PRODUCTS,
  SCENARIOS as MOCK_SCENARIOS,
  SCENARIO_BY_SLUG
} from "@/data/mock";
import type {
  Product,
  Scenario,
  SlotId
} from "@/types/domain";

/**
 * Data access layer. Supabase when configured, mock data otherwise.
 * This keeps the app runnable in either state.
 */

export async function listScenarios(): Promise<Scenario[]> {
  if (!hasSupabase()) return MOCK_SCENARIOS;
  const supabase = createSupabaseServer()!;
  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("*")
    .order("title");
  const { data: items } = await supabase
    .from("scenario_items")
    .select("scenario_id, slot, product_id");
  const { data: products } = await supabase.from("products").select("*");
  if (!scenarios || !items || !products) return MOCK_SCENARIOS;

  const productBySlug = new Map(
    products.map((p) => [p.id as string, p as unknown as Product])
  );
  // Map DB rows into our Scenario shape with an items map keyed by slot.
  return scenarios.map((s) => {
    const slotItems = items.filter((i) => i.scenario_id === s.id);
    const itemMap = {} as Record<SlotId, string>;
    for (const it of slotItems) {
      const p = productBySlug.get(it.product_id);
      if (p) itemMap[it.slot as SlotId] = p.id;
    }
    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      occasion: s.occasion,
      style: s.style,
      description: s.description,
      hero_image_url: s.hero_image_url,
      default_guest_count: s.default_guest_count,
      budget_tier: s.budget_tier,
      items: itemMap
    } as Scenario;
  });
}

export async function getScenario(slug: string): Promise<Scenario | null> {
  if (!hasSupabase()) return SCENARIO_BY_SLUG[slug] ?? null;
  const all = await listScenarios();
  return all.find((s) => s.slug === slug) ?? null;
}

export async function listProducts(): Promise<Product[]> {
  if (!hasSupabase()) return MOCK_PRODUCTS;
  const supabase = createSupabaseServer()!;
  const { data } = await supabase.from("products").select("*");
  return (data as unknown as Product[]) ?? MOCK_PRODUCTS;
}

export async function getCurrentUser() {
  const supabase = createSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function isFavorited(userId: string, scenarioId: string) {
  const supabase = createSupabaseServer();
  if (!supabase) return false;
  const { data } = await supabase
    .from("favorites")
    .select("scenario_id")
    .eq("user_id", userId)
    .eq("scenario_id", scenarioId)
    .maybeSingle();
  return Boolean(data);
}

export async function listFavorites(userId: string): Promise<Scenario[]> {
  const supabase = createSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from("favorites")
    .select("scenario_id")
    .eq("user_id", userId);
  const ids = (data ?? []).map((r) => r.scenario_id);
  if (ids.length === 0) return [];
  const all = await listScenarios();
  return all.filter((s) => ids.includes(s.id));
}

export async function listCustomSetups(userId: string) {
  const supabase = createSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from("custom_setups")
    .select("id, name, guest_count, base_scenario_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getCustomSetup(userId: string, id: string) {
  const supabase = createSupabaseServer();
  if (!supabase) return null;
  const { data: setup } = await supabase
    .from("custom_setups")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (!setup) return null;
  const { data: items } = await supabase
    .from("custom_setup_items")
    .select("slot, product_id")
    .eq("setup_id", id);
  return { setup, items: items ?? [] };
}
