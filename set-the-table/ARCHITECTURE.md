# Set the Table — Architecture & Plan

## 1. High-Level Architecture

Server-rendered Next.js App Router app with Supabase as the single backend
(Postgres + Auth + Row Level Security). No separate API layer — Next.js
Route Handlers and Server Components talk to Supabase directly. Client
components only where interactivity demands it (Customizer, auth flows,
favorites toggle).

Rendering:
- Landing, Explore, Scenario detail -> Server Components
- Customizer -> Client Component with `useReducer`
- Auth-gated writes -> Server Actions

Auth: Supabase Auth via `@supabase/ssr`, magic-link email.
No Prisma: `supabase-js` + generated TS types is enough for MVP.

State:
- Server state via RSC + Server Actions
- Customizer state via `useReducer`
- Filters via URL `searchParams`
- Toasts via one Context provider

## 2. Folder Structure

```
set-the-table/
  app/
    layout.tsx, page.tsx, globals.css
    explore/page.tsx
    scenarios/[slug]/page.tsx
    scenarios/[slug]/customize/page.tsx
    account/page.tsx
    account/setups/[id]/page.tsx
    shopping-list/[setupId]/page.tsx
    auth/login/page.tsx
    auth/callback/route.ts
    api/health/route.ts
  components/
    ui/            Button, Card, Input, Badge, ...
    layout/        Nav, Footer
    scenario/      ScenarioCard, ItemList, PriceSummary
    customizer/    SlotPicker, ProductSwapper, LivePrice
    shopping/      ShoppingList, GroupedItems
  lib/
    supabase/{server,browser,types}.ts
    pricing.ts, slots.ts, queries.ts, actions.ts, utils.ts
  data/mock.ts               Phase 1 seed; migrated to Supabase in P2
  public/images/
  supabase/migrations/ + seed.sql
  types/domain.ts
```

## 3. Data Model (Supabase / Postgres)

- `products (id, name, category, style, price_cents, per_guest, image_url, retailer_url)`
- `scenarios (id, slug, title, occasion, style, description, hero_image_url, default_guest_count, budget_tier)`
- `scenario_items (scenario_id, slot, product_id)` — unique per (scenario, slot)
- `favorites (user_id, scenario_id)`
- `custom_setups (id, user_id, base_scenario_id, name, guest_count)`
- `custom_setup_items (setup_id, slot, product_id)`

RLS: public read on catalog tables; per-user read/write on favorites & setups.

## 4. Slot-Based Customization

Ten fixed slots: tablecloth, runner, charger, dinner_plate, salad_plate,
napkin, flatware, glasses, centerpiece, candles.

A `Setup` is `Record<SlotId, Product>`. Swapping dispatches
`{ type: 'SWAP', slot, product }` into a reducer; the rest of the UI
is a pure function of the current setup.

## 5. Price Logic

```
total = sum over slots of (product.price_cents * (per_guest ? guests : 1))
```

Per-guest slots: charger, dinner_plate, salad_plate, napkin, flatware, glasses.
Fixed slots: tablecloth, runner, centerpiece, candles.

## 6. Shopping List

Projection of `Setup + guestCount` grouped by category, each line with
quantity and subtotal. Exported to print / clipboard in Phase 3.

## 7. Phased Execution

- Phase 1: scaffold + static pages with mock data. STOP and explain.
- Phase 2: Supabase, auth, favorites, live Customizer. STOP and explain.
- Phase 3: shopping list + polish.

## 8. Out of Scope (MVP)

No AR, 3D, AI recs, marketplace checkout, advanced drag & drop, mobile app,
Prisma.
