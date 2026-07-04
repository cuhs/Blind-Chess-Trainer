# MindBoard — Agent Guide

Blind-Chess-Trainer is the repo for **MindBoard**, a cognitive blindfold chess platform.

## Documentation Map

| Doc | Purpose |
|-----|---------|
| `Product-Blueprint.md` | Product vision, phases, interaction logic, pedagogical copy |
| `DESIGN.md` | Design system — **synced from Stitch** (tokens, screens, components) |
| `apps/mobile/theme/tokens.ts` | Machine-readable design tokens |
| `AGENTS.md` | This file — architecture, constraints, tooling |
| `supabase/README.md` | Cloud project setup, link/push/seed, optional local Docker |
| `.cursor/rules/` | Auto-applied coding standards |
| `.cursor/skills/` | Domain workflows invoked by task |

**Before UI work:** read `DESIGN.md` + import from `@/theme`. **Before architecture:** read `Product-Blueprint.md`.

**After structural changes:** keep agent docs accurate — see [Agent Doc Maintenance](#agent-doc-maintenance).

## Stitch Project

| Field | Value |
|-------|-------|
| Project | MindBoard: Blindfold Chess Academy |
| Project ID | `3837939560019732420` |
| Design system | Playful Tactile Minimalism |
| Device | Mobile (390×884 logical) |
| Color mode | Light |
| Fonts | Plus Jakarta Sans (headlines), Be Vietnam Pro (body) |

MCP (`.cursor/mcp.json`):

| Server | Purpose |
|--------|---------|
| `stitch` | Design frames → `tokens.ts`, `DESIGN.md` |
| `ios-simulator` | UI verification on booted Simulator (tap, type, screenshot, a11y tree) |
| `supabase` | Cloud project queries, migrations, SQL (linked via Dashboard / `supabase link`) |
| `supabase-postgres` | Optional local Docker Postgres only (`localhost:54322`) |

## Core Philosophy

Closed-loop system: text training → voice matches → failures → custom puzzles → heatmap clears → repeat. No gatekeeping — peek and haptic fallback are features.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native + Expo (Expo Router) |
| Chess | chess.js |
| Engine | Stockfish 17 native C++ on iOS (`@og-nav/expo-stockfish`); WASM in Vitest only |
| Backend | Supabase + Express.js |
| Motifs | Deterministic TypeScript microservice |
| Voice | On-device STT → `resolveVoiceTranscript` (voice-pipeline) → `resolveNoisyTranscript` (chess-core `voice/`) → `resolveMove` legality gate |
| LLM | Templating only (JSON → questions) |
| Designs | Google Stitch → `apps/mobile/theme/tokens.ts` (**synced**) |

## Planned Structure

```
apps/mobile/
  app/                # Expo Router — (onboarding), (main) tabs
  theme/tokens.ts     # Stitch design tokens (synced)
  components/         # See DESIGN.md catalog
  screens/            # Mapped to Stitch frames
  hooks/              # Shared stateful logic
  lib/                # Supabase client + QueryClient
  stores/             # Zustand + AsyncStorage (guest session)
apps/api/             # Express gateway
packages/chess-core/        # includes src/motifs/ (deterministic motif engine)
packages/voice-pipeline/    # STT orchestration (`resolveVoiceTranscript`), contextual strings; re-exports match-move + voice resolver
packages/heatmap/
packages/shared/
supabase/migrations/
supabase/seed.sql     # Curated puzzle_bank seed rows
```

## Mobile Routes

| Group | Route | Screen |
|-------|-------|--------|
| Gate | `/` | Redirect → `currentOnboardingStep` or `/(main)` when `onboardingComplete` |
| Onboarding | `/(onboarding)/hook` | `HookBoardScreen` |
| Onboarding | `/(onboarding)/story-check` | `StoryCheckScreen` |
| Onboarding | `/(onboarding)/reward/[index]` | `RewardPuzzleScreen` |
| Onboarding | `/(onboarding)/fog-reveal` | `FogRevealScreen` |
| Onboarding | `/(onboarding)/match-primer` | `MatchPrimerScreen` |
| Main tabs | `/(main)/index` | `HomeDashboardScreen` |
| Main tabs | `/(main)/training` | `TrainingHubScreen` |
| Main tabs | `/(main)/training/drill` | `DailyDrillScreen` |
| Main tabs | `/(main)/match` | `MatchSetupScreen` |
| Main tabs | `/(main)/match/play` | `VoiceMatchScreen` |
| Main tabs | `/(main)/analysis` | `MatchHistoryScreen` (saved matches list) |
| Main tabs | `/(main)/analysis/[matchId]` | `ReplayScreen` — event timeline with peek/illegal steps, heatmap overlay, clear-board toggle |
| Settings (header only) | `/(main)/settings` | Settings stub — not in tab bar |

## Stitch → Screen Mapping

| Stitch frame | RN screen | Phase |
|--------------|-----------|-------|
| Animated Invisible Grid Hook | `HookBoard` | 1 |
| Active Recall Training Phase | `DailyDrill` | 2 |
| Interactive Active Recall Training | `DailyDrill` | 2 |
| Animated Match Engine | `VoiceMatch` | 3 |
| Animated Cognitive Heatmap Dashboard | `CognitiveHeatmap` / `FogRevealScreen` | 1 / 4 |
| MindBoard Home (Enhanced Loop) | `HomeDashboard` | 1 exit |
| Populated Game Analysis & Review | `ReplayTimeline` | 4 |

Blueprint-only screens (no Stitch frame): `StoryCheck`, `RewardPuzzle`, `MatchPrimer`, `DisambiguationOverlay`. **Infer visuals** from nearest sibling Stitch screen + `@/theme` — never invent new design language. See `DESIGN.md` § Screens without a Stitch frame.

## Closed-Loop Home (`HomeDashboard`)

Post-onboarding `/(main)/index` — Stitch frame `b1eff5fd32e743e2a7f8a4b78a340318`. Top-to-bottom:

1. **AppHeader** — bordered top bar with mascot + settings
2. **HabitHeader** — `StatCard` row: bolt streak + Board Mapped %
3. **Hero copy** — "Cognitive Heatmap" title + subtitle
4. **InteractiveHeatmap** — non-interactive fog teaser (`interactive={false}`)
5. **DailyMatrixCard** — "Today's Matrix: N Positions" primary CTA + `PeekChip` loop badge; disabled when today's drill is complete
6. **VoiceMatchCard** — "Start Blindfold Match" secondary row
7. **Tab bar** — Home | Training | Match | Analysis (soft active pill); Settings via header gear only

## Build Order

1. Onboarding — `HookBoard` → `MatchPrimer` (Stitch: Invisible Grid Hook)
1b. Home — `HomeDashboard` from Stitch `b1eff5fd32e743e2a7f8a4b78a340318`
2. Training — `TrainingHub`, `DailyDrill` backed by `puzzle_bank`; motif resolve via `useResolvedPuzzle` (no separate `StoryPuzzle` route — both Stitch training frames map to `DailyDrill`)
   - Done: engine-backed prompts when top motif matches `expected_answer`; daily cap at 3 puzzles (`selectDailyPuzzles` + `useDailySession`); completion gate via `lastDrillCompletedDate`; home + hub `DailyMatrixCard`; TrainingHub stats + closed-loop card; 54 curated `puzzle_bank` seed rows
3. Voice match — `MatchSetupScreen` (Elo slider) → `VoiceMatchScreen` (native Stockfish on iOS dev build)
   - Done: `MatchRecorder` captures moves, peeks, illegal attempts, disambiguation, and resign; fuzzy voice resolver with piece-intent guards, length-scaled auto-submit confidence, and voice-triggered disambiguation overlay; engine-wait UI (spinner + "Move sent"); on-device STT via `useMatchSpeech` + `expo-speech-recognition` (requires dev build rebuild after native dep change)
4. Post-game — `ReplayScreen` event timeline (peek/illegal as own steps) + dismissible heatmap overlay
5. Infrastructure — Supabase, Express API (`apps/api/` — LLM templating when needed)

## Data Layer

Supabase schema lives in `supabase/migrations/`; seed rows live in `supabase/seed.sql`. **Default backend:** cloud Supabase — setup in `supabase/README.md`. Secrets live in `.env.local` only (never commit or edit).

| Table | Purpose |
|-------|---------|
| `profiles` | Global Elo handicap, current streak, total fog cleared |
| `heatmap_ledger` | Append-only puzzle/match-peek square interactions; `client_event_id` idempotency key dedupes retried flushes |
| `puzzle_bank` | Curated Story of the Position FENs/prompts |

Client table grants are minimal: `authenticated` only (no `anon`), select/insert on ledger, select on puzzles. Streak and daily-drill date keys use the device's local calendar day (`apps/mobile/lib/dateKey.ts`). The bolt streak bumps on daily matrix completion (`completeDailyDrill`) or finishing a voice match (`recordHabitActivity`), not on bare app launch.

Mobile server state uses `@tanstack/react-query` and `apps/mobile/lib/supabase.ts`. `guestStore` remains the offline-first cache for heatmap aggregates and pending ledger inserts. Onboarding resume: `app/index.tsx` redirects to `currentOnboardingStep` (persisted in guest store) until `onboardingComplete`. Daily drill mid-session progress: `drillProgress` (`dateKey` + `completedPuzzleIds`) resumes via `useDrillSessionController` + `lib/drillBootstrap.ts`; cleared atomically on session end (`completeDailyDrill`). Match peeks append `match_peek` ledger rows on every peek; `peekEvents` dedupes by `positionKeyFromFen` (one stored event and one generated puzzle per position). Finished matches append a `MatchRecord` to `guestStore.matchHistory` (capped at 50, persisted in AsyncStorage) synchronously when a game ends; Analysis tab + `ReplayScreen` consume this offline with no server round-trip. `usePuzzleBank` loads all active `puzzle_bank` rows; `useDailySession` picks 3 per local calendar day via `lib/dailySession.ts` (up to 2 peek-generated from match events, remaining slots from the bank with prompt-category spread when possible; order shuffled by date) and gates re-entry with `lastDrillCompletedDate`. `useProfileSync` hydrates match Elo from `profiles`. `useResolvedPuzzle` overlays engine prompts when `analyzePosition` agrees with `expected_answer`. Validate seeds: `cd packages/chess-core && npm run validate:puzzles`. Skill: `training-flow`.

## Agent Doc Maintenance

**Required:** when a change makes agent docs wrong or incomplete, update them in the **same task** — not later.

| Trigger | Update |
|---------|--------|
| New/removed screen, route, tab | `AGENTS.md`, `react-native-expo.mdc`, domain skill |
| New/removed component | `DESIGN.md` catalog |
| Chess/board changes | `DESIGN.md` § Chess, `chess-board.mdc`, `chess-ui` skill |
| New package or API | `AGENTS.md` structure, scoped rule |
| New convention | matching rule + `AGENTS.md` constraints |
| Stitch re-sync | `DESIGN.md`, `tokens.ts`, `stitch-designs` skill |

Verify `AGENTS.md` rules/skills tables match files in `.cursor/rules/` and `.cursor/skills/`. Skill: `doc-maintenance`.

## Skills

| Skill | When |
|-------|------|
| `doc-maintenance` | After changes that affect architecture, routes, components, or conventions |
| `stitch-designs` | Re-sync Stitch → DESIGN.md + tokens.ts |
| `onboarding-flow` | Phase 1 screens |
| `training-flow` | TrainingHub, DailyDrill, puzzle_bank, narration phases |
| `motif-engine` | Tactical detection + tests |
| `voice-match` | STT pipeline, disambiguation |
| `heatmap-analytics` | Fog, peek, replay, drilling |
| `chess-ui` | Board rendering, labels, SVG pieces, grid geometry |
| `ios-simulator-testing` | Verify mobile UI flows via iOS Simulator MCP |

## Rules

| Rule | Scope |
|------|-------|
| `mindboard-core` | Always |
| `doc-maintenance` | Always |
| `design-system` | `apps/mobile/**` |
| `design-stitch` | `apps/mobile/**` |
| `typescript-standards` | `**/*.{ts,tsx}` |
| `testing` | `**/*.{test,spec}.{ts,tsx}` |
| `react-native-expo` | `apps/mobile/**` |
| `chess-logic` | `packages/chess-core/**` |
| `chess-board` | `apps/mobile/components/{chess,heatmap}/**` |
| `motif-engine` | `packages/chess-core/src/motifs/**` |
| `voice-pipeline` | `packages/voice-pipeline/**` |
| `ios-simulator-testing` | `apps/mobile/**` |
| `backend-api` | `apps/api/**`, `supabase/**` |

## Non-Negotiable Constraints

- **Motifs:** TypeScript on chess.js → JSON. LLM templates questions only.
- **Voice:** Ambiguous/illegal input triggers disambiguation; responses re-enter the same pipeline.
- **Training:** tactile manual input — `SquareKeypad` (A–H / 1–8) for squares, `YesNoZone` (swipe / tap halves) for yes-no. No native keyboard, no voice. **Matches:** voice-first.
- **Fog:** `opacity = 1 - (interactions / threshold)` — center 15, edge 10, corner 5.
- **Design:** Import tokens from `@/theme` — no inline hex. Blueprint wins on interaction; Stitch wins on visuals.
- **Components:** Search `components/` and `DESIGN.md` catalog before new UI. Reuse primitives; extract shared blocks when they repeat or screens grow large. `screens/` compose only.
- **Chess UI:** Correct square colors, labels, white-at-bottom, shared `boardUtils`. Square names, FEN, grid indices, and heatmap cells must correlate — see `chess-ui/notation.md`. SVG pieces — no Unicode glyphs.
- **Icons:** No emoji in UI. Use SVG via `components/ui/icons/` and `components/chess/pieces/`.
- **Testing:** Unit tests first (Vitest). Mobile UI: verify on iOS Simulator MCP after screen/component changes — `ios-simulator-testing` skill. All interactives need `accessibilityLabel` for MCP.
- **Docs:** Update `AGENTS.md`, `DESIGN.md`, rules, and skills when code changes invalidate them — same task, not deferred.

## Commands

```bash
cd apps/mobile && npm run nnue              # once: download Stockfish NNUE weights (~88 MB)
cd apps/mobile && npm run ios:build        # first time / after native dep changes (Xcode 16.1+)
cd apps/mobile && npm start                # Metro + MindBoard dev client (not Expo Go)
cd apps/mobile && npm run ios              # same, opens iOS simulator
cd apps/api && npm run dev
cd packages/chess-core && npm test
npx @_davideast/stitch-mcp doctor          # verify Stitch API
```

### Supabase (cloud — default)

Copy `.env.example` → `.env.local` and fill in **publishable** key from Dashboard → Project Settings → API → API Keys. See `supabase/README.md`.

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push                                              # apply migrations
supabase db query --linked -f supabase/seed.sql             # seed puzzle_bank
supabase config push                                          # sync auth (anonymous sign-ins)
```

One-time Dashboard check: **Authentication → Providers → Anonymous sign-ins** must be enabled.

### Supabase (optional local Docker)

```bash
supabase start
supabase db reset                      # migrations + seed locally
# EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 in .env.local
```

**Simulator MCP workflow:** `get_booted_sim_id` → `ui_describe_all` → `ui_find_element` / `ui_tap` / `ui_type` → `screenshot`. Bundle: `com.mindboard.app`.

## Commits

```
feat(mobile): implement HookBoard from Stitch frame a7e36868
feat(mobile): add tokens.ts from Playful Tactile Minimalism
fix(voice-pipeline): map homophone "night" to knight
```
