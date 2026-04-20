/**
 * Pluggable AI image generation.
 *
 * Configure via env vars:
 *   IMAGE_PROVIDER = "openai" | "fal" | "replicate"  (default: openai)
 *   OPENAI_API_KEY = sk-...     (when provider=openai)
 *   FAL_API_KEY    = ...        (when provider=fal)
 *   REPLICATE_API_TOKEN = ...   (when provider=replicate)
 *
 * Server-side only. Never import into client components.
 */

export type GeneratedImage = { url: string; provider: string };

export async function generateTableImage(
  prompt: string,
  opts: { aspectRatio?: "landscape" | "square" } = {}
): Promise<GeneratedImage> {
  const provider = (process.env.IMAGE_PROVIDER ?? "openai").toLowerCase();
  switch (provider) {
    case "openai":    return generateWithOpenAI(prompt, opts);
    case "fal":       return generateWithFal(prompt, opts);
    case "replicate": return generateWithReplicate(prompt, opts);
    default:
      throw new Error(
        `Unknown IMAGE_PROVIDER=${provider}. Expected "openai" | "fal" | "replicate".`
      );
  }
}

// ---------- OpenAI DALL-E 3 ----------

async function generateWithOpenAI(
  prompt: string,
  opts: { aspectRatio?: "landscape" | "square" }
): Promise<GeneratedImage> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");
  const size = opts.aspectRatio === "square" ? "1024x1024" : "1792x1024";

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      size,
      quality: "hd",
      n: 1,
      response_format: "url"
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `OpenAI image error: ${data?.error?.message ?? res.statusText}`
    );
  }
  return { url: data.data[0].url as string, provider: "openai" };
}

// ---------- Fal.ai (FLUX) ----------

async function generateWithFal(
  prompt: string,
  opts: { aspectRatio?: "landscape" | "square" }
): Promise<GeneratedImage> {
  const key = process.env.FAL_API_KEY;
  if (!key) throw new Error("FAL_API_KEY not set");
  // FLUX dev via Fal — good quality/price ratio.
  const aspect = opts.aspectRatio === "square" ? "1:1" : "16:9";

  const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt,
      image_size: { aspect_ratio: aspect },
      num_inference_steps: 4,
      num_images: 1
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Fal.ai image error: ${data?.error ?? data?.detail ?? res.statusText}`
    );
  }
  const url = data?.images?.[0]?.url;
  if (!url) throw new Error("Fal.ai returned no image URL");
  return { url, provider: "fal" };
}

// ---------- Replicate (FLUX) ----------

async function generateWithReplicate(
  prompt: string,
  opts: { aspectRatio?: "landscape" | "square" }
): Promise<GeneratedImage> {
  const key = process.env.REPLICATE_API_TOKEN;
  if (!key) throw new Error("REPLICATE_API_TOKEN not set");
  const aspect = opts.aspectRatio === "square" ? "1:1" : "16:9";

  // Create prediction (FLUX schnell is fast + cheap)
  const create = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${key}`,
      "Content-Type": "application/json",
      Prefer: "wait"
    },
    body: JSON.stringify({
      // FLUX schnell official Replicate model
      version: "black-forest-labs/flux-schnell",
      input: { prompt, aspect_ratio: aspect, num_outputs: 1 }
    })
  });
  const data = await create.json();
  if (!create.ok) {
    throw new Error(
      `Replicate error: ${data?.error ?? data?.detail ?? create.statusText}`
    );
  }
  const url = Array.isArray(data.output) ? data.output[0] : data.output;
  if (!url) throw new Error("Replicate returned no image URL");
  return { url, provider: "replicate" };
}
