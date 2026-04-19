# Deploying Set the Table

Two paths below: **Web UI** (click through GitHub + Vercel) or **CLI** (`gh` +
`vercel`). Both end in the same place: a live app with Supabase-backed auth.

---

## 1. Prerequisites

- A GitHub account.
- A Vercel account (sign in with GitHub — free hobby tier is fine).
- A Supabase project (free tier) if you want auth, favorites, and saved setups.
  Without Supabase the app still runs using the mock catalog — just no login.

---

## 2. Set up Supabase (optional, one-time)

1. Go to https://supabase.com → **New project**. Pick a region near you.
   Save the **Project URL** and **anon public key** (Project Settings → API).
2. Open **SQL Editor** → **New query** → paste the contents of
   `supabase/migrations/0001_init.sql` → **Run**.
3. New query → paste `supabase/seed.sql` → **Run**. You now have 40 products and
   6 scenarios in the DB.
4. **Authentication → URL Configuration**:
   - Set **Site URL** to your Vercel production URL (fill this in after Vercel
     deploy, e.g. `https://set-the-table-abc.vercel.app`).
   - Add the same URL plus `/*` under **Redirect URLs** (e.g.
     `https://set-the-table-abc.vercel.app/*`). This is required for magic-link
     callbacks. You can come back and edit this after you know the Vercel URL.
5. (Optional) **Authentication → Email templates**: customize the magic-link
   email so it feels on-brand.

---

## 3. Initialize git locally (one-time)

The project ships without git history. From the project folder:

```bash
# If a partial .git folder exists from the export, remove it first:
rm -rf .git

git init -b main
git add .
git commit -m "Initial commit: Set the Table MVP"
```

That's the snapshot you'll push to GitHub.

---

## 4. Option A — Web UI

### 4A.1 Create the GitHub repo

1. Go to https://github.com/new.
2. Name it `set-the-table` (or whatever you like). Public or private.
3. **Do not** add README/gitignore/license — the project already has them.
4. Copy the "push an existing repository from the command line" block — you'll
   use it in a moment.

### 4A.2 Push your code

From the project folder, run the three commands GitHub shows you (replace the
URL with your own):

```bash
git remote add origin https://github.com/YOUR-USER/set-the-table.git
git branch -M main
git push -u origin main
```

### 4A.3 Import into Vercel

1. Go to https://vercel.com/new.
2. Pick your `set-the-table` repo → **Import**.
3. Framework Preset: **Next.js** (autodetected). Leave defaults.
4. **Environment Variables** — add these three (Supabase optional):

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase Settings → API |
   | `NEXT_PUBLIC_SITE_URL` | leave blank for now; fill after first deploy |

5. **Deploy**. Takes ~90 seconds.
6. After the first deploy:
   - Copy the production URL (e.g. `https://set-the-table-abc.vercel.app`).
   - **Vercel → Settings → Environment Variables** → set
     `NEXT_PUBLIC_SITE_URL` to that URL → **Save**.
   - **Deployments → ⋯ → Redeploy** to pick up the new env.
   - **Supabase → Authentication → URL Configuration** → paste the URL as
     Site URL and add it plus `/*` under Redirect URLs.

Done. Sign in flow works via magic link.

---

## 5. Option B — CLI

Assumes `gh` and `vercel` are installed and authed (`gh auth login`,
`vercel login`). Run the git init from §3 first, then:

```bash
cd set-the-table

# GitHub
gh repo create set-the-table --public --source=. --remote=origin --push

# Vercel
vercel link            # create/link the project; accept defaults
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel --prod          # deploy production build
```

Then set `NEXT_PUBLIC_SITE_URL` once you know the final URL:

```bash
vercel env add NEXT_PUBLIC_SITE_URL production
# paste the URL vercel --prod just printed
vercel --prod          # redeploy
```

Finally update Supabase Auth → URL Configuration with the same URL + `/*`.

---

## 6. Verifying the deploy

On the production URL, check:

- Landing loads and shows featured occasions.
- `/explore` filters work (reload keeps filters via URL).
- Open a scenario → price shows for the default guest count.
- Click **Customize** → swap a plate, the live total updates.
- **Sign in** → paste an email → click the magic link in your inbox → land
  on `/account` as the signed-in user.
- Favorite a scenario → it appears under `/account` → Favorites.
- Save a setup → it appears under Saved setups → open it → **Generate
  shopping list** → Copy/Print buttons work.

If magic link redirects fail, 99% of the time it's the Supabase **Redirect
URLs** list. Add both `https://your-domain/*` and any preview URL Vercel
gives you (`https://your-project-git-main-*.vercel.app/*`).

---

## 7. Custom domain (optional)

- **Vercel → Settings → Domains** → add your domain, follow the DNS steps.
- Update `NEXT_PUBLIC_SITE_URL` and Supabase Auth → Site URL / Redirect URLs
  to the new domain.
- Redeploy.

---

## 8. Updating the deploy

Every push to `main` triggers a Vercel production deploy automatically.
PRs get preview deployments with their own URL. Add those preview URLs (or a
wildcard) to Supabase Redirect URLs if you want auth to work on previews.
