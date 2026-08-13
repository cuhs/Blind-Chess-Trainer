# MindBoard Supabase

## Cloud project (default)

Use your Supabase Dashboard project. Do **not** commit project refs, URLs, or API keys to this repo — keep them in `.env.local` only (gitignored).

### First-time setup

1. Create or open a cloud project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Copy `.env.example` → `.env.local` at repo root (or `apps/mobile/.env.local`).
3. Paste **Project URL** and **publishable** key from Dashboard → Project Settings → API → **API Keys** into `.env.local` as `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Link and sync schema (requires `supabase login`):

```bash
supabase link --project-ref <project-ref>
supabase db push
supabase db query --linked -f supabase/seed.sql
supabase config push   # syncs enable_anonymous_sign_ins from config.toml
```

5. Enable **Authentication → Providers → Anonymous sign-ins** in the Dashboard (or rely on `config push` above).
6. After verifying the app works, disable legacy **anon** / **service_role** keys under **API → Legacy API Keys**.
7. Restart Metro: `cd apps/mobile && npm start`.

### Puzzle bank (optional regression + hybrid top-up)

Training drills are **generated at runtime** in `packages/chess-core/src/training/` (`buildPuzzleFromCategory`, `buildTrainingPuzzleSpec`). The mobile app works without any `puzzle_bank` rows.

The 54 curated fixtures in `packages/chess-core/src/motifs/fixtures/puzzle-bank-fixtures.json` and `supabase/seed.sql` are golden regression tests and an optional hybrid daily top-up when Supabase is linked.

```bash
cd packages/chess-core
npm run validate:generators    # fuzz all categories (primary CI gate)
npm run validate:puzzles       # 54 bank fixtures
npm run generate:puzzles -- --category pin --count 100 --verify   # bulk verified export
npm run generate:seed          # regenerate seed.sql from fixtures (after manual fixture edits)
supabase db query --linked -f supabase/seed.sql   # upsert cloud puzzle_bank (optional)
```

Legacy authoring flow (`probe:puzzles` → merge fixtures → `generate:seed`) remains for hand-curated rows. `probe-output.json` is local-only — do not commit.

### Agent / MCP

- **Cloud queries & migrations:** Supabase MCP plugin (`supabase` in `.cursor/mcp.json`).
- **Optional local Postgres MCP:** `supabase-postgres` points at `localhost:54322` (Docker only).
- **Never** read, write, or commit `.env.local` — user-managed secrets only.

## Optional local Docker

```bash
supabase start
supabase db reset
```

Set `EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` in `.env.local`.
