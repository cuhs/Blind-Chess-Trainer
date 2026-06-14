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

### Puzzle bank updates

Curated drills live in `packages/chess-core/src/motifs/fixtures/puzzle-bank-fixtures.json` (54 rows) and `supabase/seed.sql`.

```bash
cd packages/chess-core
npm run probe:puzzles          # validate candidate FENs → probe-output.json (gitignored)
# merge new rows into puzzle-bank-fixtures.json
npm run generate:seed          # regenerate seed.sql
npm run validate:puzzles
supabase db query --linked -f supabase/seed.sql   # upsert cloud puzzle_bank
```

`probe-output.json` is local-only — do not commit.

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
