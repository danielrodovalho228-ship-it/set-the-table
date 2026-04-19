#!/usr/bin/env bash
# scripts/supabase-setup.sh
#
# One-shot Supabase setup using either the Supabase CLI or psql.
# Requires ONE of:
#   A) Supabase CLI — `supabase` installed + `supabase link` already run
#   B) psql — a valid `DATABASE_URL` in your environment
#
# Usage:
#   ./scripts/supabase-setup.sh
#
# Prints what it's doing; safe to re-run (idempotent — statements use
# CREATE TABLE IF NOT EXISTS / ON CONFLICT DO NOTHING).

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SETUP_SQL="$ROOT_DIR/supabase/setup.sql"

if [[ ! -f "$SETUP_SQL" ]]; then
  echo "ERROR: $SETUP_SQL not found." >&2
  exit 1
fi

echo "→ Using combined SQL: $SETUP_SQL"

# Path A — Supabase CLI
if command -v supabase >/dev/null 2>&1; then
  if supabase status >/dev/null 2>&1 || [[ -f "$ROOT_DIR/supabase/.temp" ]] || [[ -f "$ROOT_DIR/supabase/config.toml" ]]; then
    echo "→ Running via Supabase CLI (supabase db push)"
    # `supabase db remote commit` / `db push` require migration folder structure.
    # Simpler: `supabase db execute` reads SQL directly.
    if supabase help db 2>&1 | grep -q "execute"; then
      supabase db execute --file "$SETUP_SQL"
      echo "✓ Done (Supabase CLI)"
      exit 0
    fi
  fi
fi

# Path B — psql + DATABASE_URL
if command -v psql >/dev/null 2>&1 && [[ -n "${DATABASE_URL:-}" ]]; then
  echo "→ Running via psql against \$DATABASE_URL"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SETUP_SQL"
  echo "✓ Done (psql)"
  exit 0
fi

cat <<EOF
Neither path worked. You have two options:

  A) Paste manually (easiest):
     - Open your Supabase project → SQL Editor → New query
     - Paste the entire contents of supabase/setup.sql
     - Run. That's it — tables + RLS + 40 products + 6 scenarios.

  B) Configure one of these and re-run this script:
     - Install supabase CLI + 'supabase login' + 'supabase link'
     - Or: export DATABASE_URL='postgresql://...' (from Supabase → Settings → Database)

EOF
exit 1
