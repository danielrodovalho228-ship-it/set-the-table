# AI Image Generation

The app can replace every scenario's hero image with an AI-generated version
tailored to the setup (style, occasion, and items). Optional — without it, the
app falls back to the Unsplash URLs stored in `scenarios.hero_image_url`.

## Supported providers

Pick one via `IMAGE_PROVIDER` env var:

| Provider | Flag | Key env var | Cost per image (HD) |
|---|---|---|---|
| OpenAI DALL-E 3 (default) | `openai` | `OPENAI_API_KEY` | ~$0.08 |
| Fal.ai (FLUX schnell) | `fal` | `FAL_API_KEY` | ~$0.025 |
| Replicate (FLUX schnell) | `replicate` | `REPLICATE_API_TOKEN` | ~$0.01 |

Switching providers is a one-line env change — no code change.

## How it works

1. **Prompt is built from the scenario** — style, occasion, product names,
   description, and color palette. See `lib/ai/prompts.ts`.
2. **Model generates an image** — one HTTP call. Takes 3–15 seconds.
3. **Image is uploaded to Supabase Storage** bucket `scenario-heroes`.
4. **`scenarios.generated_hero_url`** is set to the public CDN URL. All pages
   use this URL when present, else fall back to `hero_image_url`.

## Pre-generate all 11 heroes (one-time setup)

Script: `scripts/generate-heroes.ts`. Reads scenarios from Supabase, calls
the configured provider for each, uploads, stamps the DB.

### Prerequisites (in `.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...     # Supabase → Settings → API → service_role
IMAGE_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
```

> `SUPABASE_SERVICE_ROLE_KEY` is a secret — bypasses RLS. Keep only in
> `.env.local` (gitignored). Rotate it at Supabase → Settings → API if it
> ever leaks.

### Run

```bash
npm install              # ensures tsx + dotenv are installed
npm run generate:heroes  # generates + uploads all 11
```

For one scenario only (faster iteration):

```bash
npm run generate:heroes:one=classic-thanksgiving
```

Total cost for 11 DALL-E 3 HD images ≈ **$0.88**. Safe to re-run — newer
images overwrite older ones.

## "Generate variation" button (live)

The scenario page has a button that lets the user ask for a new image on demand.
It calls the `regenerateScenarioHero` server action, which runs the same flow
as the script.

This button is **only rendered when `SUPABASE_SERVICE_ROLE_KEY` is set in the
server env** — because writing to Storage requires service-role access.

- **Not set:** button is hidden. Pre-generated heroes still work.
- **Set:** button is visible; each click costs ~$0.04–0.08.

Recommendation: **don't add `SUPABASE_SERVICE_ROLE_KEY` to Vercel env vars
unless you want the button live in production.** Pre-generating locally via
the script is cheaper and safer.

If you do enable it in prod, plan to gate it behind a Pro tier later — a bad
actor could otherwise burn through your budget with automated clicks.

## Prompt tuning

Edit `lib/ai/prompts.ts`:

- `STYLE_MOODS` — adjective-heavy descriptors per aesthetic.
- `STYLE_PALETTE` — color palette per style.
- `OCCASION_LIGHTING` — lighting cue per occasion.
- `buildScenarioHeroPrompt` — assembles the full prompt.

Good prompts for table settings emphasize: editorial food photography, 3/4
overhead angle, warm natural light, shallow depth of field, no people, no text.
The current template bakes these in.
