import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase admin client (service role).
 * Used by the hero-generation script and server actions that need to write to
 * Storage. NEVER import this into a client component — it has full DB access.
 */
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

/**
 * Downloads `sourceUrl`, uploads to the `scenario-heroes` Supabase Storage
 * bucket as `<key>.png`, and returns the public URL.
 */
export async function fetchAndStoreImage(
  sourceUrl: string,
  key: string
): Promise<string> {
  const res = await fetch(sourceUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch generated image: ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/png";

  const supabase = createAdminClient();
  const path = `${key}.png`;
  const { error } = await supabase.storage
    .from("scenario-heroes")
    .upload(path, buffer, { contentType, upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from("scenario-heroes").getPublicUrl(path);
  return data.publicUrl;
}

export function getAdminSupabase() {
  return createAdminClient();
}
