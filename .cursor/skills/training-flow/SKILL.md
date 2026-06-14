---
name: training-flow
description: >-
  Phase 2 training suite — TrainingHub, DailyDrill, puzzle_bank loading,
  memorize/narration phases, and motif-backed prompt resolution. Use when
  building or extending Story of the Position drills.
disable-model-invocation: false
---

# Training Flow

Phase 2 pedagogy: tactile input only (no voice). Story of the Position drills backed by `puzzle_bank` + motif engine.

## Routes

| Route | Screen | Role |
|-------|--------|------|
| `/(main)/training` | `TrainingHubScreen` | Hero + `DailyMatrixCard` CTA |
| `/(main)/training/drill` | `DailyDrillScreen` | Multi-puzzle session |

**No separate `StoryPuzzle` route.** Both Stitch training frames map to `DailyDrill`:

| Stitch frame | ID | RN screen |
|--------------|-----|-----------|
| Active Recall Training Phase | `16b75139d1d14931a1d17f54ce051a0e` | `DailyDrill` (session layout) |
| Interactive Active Recall Training | `f42d4f83e10a44df8c569ed060ad83a4` | `DailyDrill` (progress chrome) |

Blueprint-only onboarding puzzles (`StoryCheck`, `RewardPuzzle`) infer visuals from `HookBoard` + `DailyDrill` patterns.

## Data flow

```
puzzle_bank (Supabase) + match peekEvents (guestStore; one per position)
  → peekPuzzles (motif engine; positionKeyFromFen dedup) + usePuzzleBank
  → useDailySession (selectDailyPuzzles — up to 2 peek + bank fill, 3 per todayKey)
  → useDrillSessionController (resume via drillProgress; completeDailyDrill on finish)
  → useResolvedPuzzle (resolveTrainingPuzzle)
  → DailyDrillScreen
```

`resolveTrainingPuzzle` runs `analyzePosition` on `displayFen`. When the top motif's `expected` matches `puzzle_bank.expected_answer`, the engine prompt and `squaresTouched` win; otherwise the curated DB prompt is kept (e.g. bishop square vs pinned knight on the same FEN).

Validate seeds: `cd packages/chess-core && npm run validate:puzzles`. Author new rows with `npm run probe:puzzles` → merge fixtures → `npm run generate:seed` → `supabase db query --linked -f supabase/seed.sql` (see `supabase/README.md`).

## Hooks

| Hook | Status | Role |
|------|--------|------|
| `usePuzzleBank` | Done | Loads all active `puzzle_bank` rows via React Query |
| `useDailySession` | Done | Bank + peek-generated puzzles via `peekPuzzles`; 3 per `todayKey()`; `peekPuzzleCount` for loop badge |
| `useDrillSessionController` | Done | Resume/recovery via `lib/drillBootstrap.ts`; `completeDailyDrill` on session end |
| `useResolvedPuzzle` | Done | Memoized `resolveTrainingPuzzle` per puzzle |
| `useMemorizePhase` | Done | 5s board memorize → answering → success |
| `usePuzzleSessionPhase` | Done | Board memorize or `useStoryNarration` when `moves[]` present |
| `useStoryNarration` | Done | `expo-speech` move sequence (via session phase) |
| `useTrainingAnswer` | Done | Validate answer + `recordHeatmapInteractions` |
| `useDailyMatrix` | Done | Session puzzle count + peek loop badge when session includes peek puzzles + `isCompletedToday` |

## Session model

`usePuzzleSessionPhase(resetKey, { fen, moves })` sequences the prepare phases:

| Puzzle shape | Flow |
|--------------|------|
| No `moves[]` | memorize board 5s → answer |
| `moves[]` + standard-start FEN | narrate (blank screen) → answer |
| `moves[]` + custom FEN | memorize board 5s → narrate (blank) → answer |

Then: **Answer** (`SquareKeypad` / `YesNoZone`) → **Peek** (2s flash of the **base** FEN, never post-move) → advance or complete → home tab.

## Authoring audio (story) puzzles

Rows with non-empty `moves[]` in `puzzle_bank`:

1. **Pattern A — narration only:** `fen` = standard start, `moves` = legal SAN sequence (3–5 moves). No board shown; everyone knows the start.
2. **Pattern B — memorize then narrate:** `fen` = custom base position, `moves` = short continuation (1–2 plies). Board shown 5s first, or the narration has no context.

Rules:

- `moves[]` must be legal from `fen` — validator rejects illegal sequences
- `subtitle` must not mention the moves (it displays during memorize)
- `expected_answer` is about the position **after** `moves`
- Mirror the row in `packages/chess-core/src/motifs/fixtures/puzzle-bank-fixtures.json`; story_check rows set `"checkColor"` and the validator confirms the yes/no answer against the real position
- Run `cd packages/chess-core && npm run validate:puzzles`

Full recipe comment at the bottom of `supabase/seed.sql`.

Blueprint: **3 puzzles per daily session** — `lib/dailySession.selectDailyPuzzles` (up to 2 peek-sourced from matches, remaining slots from `puzzle_bank`; slot order shuffled deterministically by `todayKey()`). Completion gated via `guestStore.lastDrillCompletedDate`. **Mid-session resume:** `guestStore.drillProgress` stores `completedPuzzleIds` for the current `dateKey`; `DailyDrillScreen` resumes at the next unsolved puzzle via `lib/drillProgress.ts` and clears progress on session complete.

## Phase 2 remaining

```
- [x] TrainingHub + DailyDrill routes
- [x] puzzle_bank loading + heatmap on answer/peek
- [x] useResolvedPuzzle / motif-backed prompts
- [x] Wire useStoryNarration for puzzles with moves[] (`usePuzzleSessionPhase`)
- [x] Daily session cap at 3 puzzles + completion gate (`useDailySession`)
- [x] Mid-session drill resume (`guestStore.drillProgress` + `lib/drillProgress.ts`)
- [x] Home + hub `DailyMatrixCard` with completed-today state
- [x] Expand puzzle_bank (54 curated rows in `supabase/seed.sql`; re-validate via `npm run validate:puzzles`, regenerate with `npm run generate:seed` in `packages/chess-core`)
- [ ] Stitch visual polish (TODO(stitch) on hub + drill screens)
```

## Stitch infer (onboarding siblings)

| Screen | Infer from |
|--------|------------|
| `StoryCheck`, `RewardPuzzle` | `HookBoard` + `DailyDrill` (`PuzzleSessionLayout`, progress chrome) |
| `TrainingHub` | `DailyDrill` + `HomeDashboard` card patterns |

## Simulator (`ios-simulator-testing`)

After training UI changes, run P1 scenarios 9–10 in `ios-simulator-testing` skill.
