---
name: training-flow
description: >-
  Phase 2 training suite — TrainingHub path, TrainingNode levels, DailyDrill,
  runtime puzzle generators (primary), optional puzzle_bank top-up, memorize/narration
  phases, and motif-backed prompt resolution. Use when building or extending training drills.
disable-model-invocation: false
---

# Training Flow

Phase 2 pedagogy: tactile input only (no voice). Two modes:

1. **Training path** — linear 6-unit curriculum (`packages/chess-core/src/training/curriculum.ts`), 3 puzzles per node, progress in `guestStore.trainingProgress`
2. **Daily matrix** — 3 puzzles/day from **generated categories** (`selectDailyCategoryPuzzles`) + peek events + optional `puzzle_bank` top-up (`useDailySession`)

## Routes

| Route | Screen | Role |
|-------|--------|------|
| `/(main)/training` | `TrainingHubScreen` | Path map + daily matrix CTA |
| `/(main)/training/node/[nodeId]` | `TrainingNodeScreen` | Single curriculum node session |
| `/(main)/training/drill` | `DailyDrillScreen` | Daily 3-puzzle session |

**No separate `StoryPuzzle` route.** Stitch training frames map to `DailyDrill` / `TrainingNodeScreen` via `ActivePuzzleSession`.

## Data flow

### Daily matrix (generator-first)

```
match peekEvents (guestStore; one per position)
  → peekPuzzles + optional usePuzzleBank (hybrid top-up)
  → selectDailyPuzzles (up to 2 peek + generated category spread + bank fill)
  → useDailySession
  → useTrainingSessionController (kind: daily)
  → ActivePuzzleSession
```

Works offline from generators when Supabase bank is empty.

### Training path

```
CURRICULUM (chess-core) + buildTrainingPuzzleSpec / buildPuzzleFromCategory
  → useNodePuzzles(nodeId) — first attempt keeps curriculum seeds; in-progress resume stays on that same key; replays after stars use `replay-${stars}`
  → useTrainingSessionController (kind: node)
  → completeTrainingNode → trainingProgress
```

Onboarding credits `node-2-1` + `node-5-1` via `onboardingCurriculumBridge` on `setOnboardingComplete`.

## Hooks

| Hook | Role |
|------|------|
| `usePuzzleBank` | Optional: load active `puzzle_bank` rows for hybrid daily top-up |
| `useDailySession` | Generated + peek puzzles (+ optional bank); 3 per `todayKey()` |
| `useTrainingSessionController` | Daily or node session bootstrap, resume, completion |
| `useNodePuzzles` | Resolve node puzzles from generators; session key is stable mid-session (no bank) |
| `useTrainingPath` | Path map units/nodes, active node |
| `useDrillSessionController` | Deprecated — use `useTrainingSessionController` |
| `useResolvedPuzzle` | `resolveTrainingPuzzle` — motif/peek overlay only; recall/move prompts stay |
| `usePuzzleSessionPhase` | memorize → narrate → answer |
| `useTrainingAnswer` | Validate + heatmap ledger |
| `useDailyMatrix` | Daily puzzle count + peek loop badge |

## Session model

`usePuzzleSessionPhase` + `ActivePuzzleSession` — same per-puzzle flow for daily and path.

| Puzzle shape | Flow |
|--------------|------|
| `showBoard: false` | prompt only — no board, no invisible grid, no peek |
| No `moves[]` | memorize board 5s → answer |
| `moves[]` + standard-start FEN | narrate (blank screen) → answer |
| `moves[]` + custom FEN | memorize board 5s → narrate (blank) → answer |

## Curriculum puzzle kinds

`coordinate`, `static_recall`, `move_update`, `functional_geometry`, `shallow_calc`, `chunk`, `story_check` — see `packages/shared/src/training-curriculum.ts`.

Generators: `packages/chess-core/src/training/generators/` + `categories/` + `position-synthesis/`. Motif nodes use `motif_*` generator IDs; story check uses `story_check_line`. Verify: `npm run validate:generators`. Optional export: `npm run generate:puzzles`.

Validate seeds: `cd packages/chess-core && npm run validate:puzzles`.

## Progress persistence

| Field | Purpose |
|-------|---------|
| `trainingProgress` | `completedNodeIds`, `nodeStars`, `activeNodeId` |
| `nodeSessionProgress` | Mid-node resume (`nodeId` + `completedPuzzleIds`) |
| `drillProgress` / `lastDrillCompletedDate` | Daily matrix only |

Pure helpers: `apps/mobile/lib/trainingProgress.ts`.
