/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      // Supabase Storage public CDN (AI-generated heros) — hostname varies per project
      { protocol: "https", hostname: "*.supabase.co" },
      // OpenAI temporary image URLs (used only during generation, not cached)
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" }
    ]
  }
};

export default nextConfig;
