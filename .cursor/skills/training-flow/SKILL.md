---
name: training-flow
description: >-
  Phase 2 training suite — TrainingHub path, TrainingNode levels, DailyDrill,
  puzzle_bank loading, curriculum generators, memorize/narration phases, and
  motif-backed prompt resolution. Use when building or extending training drills.
disable-model-invocation: false
---

# Training Flow

Phase 2 pedagogy: tactile input only (no voice). Two modes:

1. **Training path** — linear 6-unit curriculum (`packages/chess-core/src/training/curriculum.ts`), 3 puzzles per node, progress in `guestStore.trainingProgress`
2. **Daily matrix** — 3 puzzles/day from `puzzle_bank` + peek events (`useDailySession`)

## Routes

| Route | Screen | Role |
|-------|--------|------|
| `/(main)/training` | `TrainingHubScreen` | Path map + daily matrix CTA |
| `/(main)/training/node/[nodeId]` | `TrainingNodeScreen` | Single curriculum node session |
| `/(main)/training/drill` | `DailyDrillScreen` | Daily 3-puzzle session |

**No separate `StoryPuzzle` route.** Stitch training frames map to `DailyDrill` / `TrainingNodeScreen` via `ActivePuzzleSession`.

## Data flow

### Daily matrix (unchanged)

```
puzzle_bank (Supabase) + match peekEvents (guestStore; one per position)
  → peekPuzzles + usePuzzleBank
  → useDailySession (selectDailyPuzzles — up to 2 peek + bank fill, 3 per todayKey)
  → useTrainingSessionController (kind: daily)
  → ActivePuzzleSession
```

### Training path

```
CURRICULUM (chess-core) + buildTrainingPuzzleSpec (generators) + puzzle_bank slugs
  → useNodePuzzles(nodeId)
  → useTrainingSessionController (kind: node)
  → completeTrainingNode → trainingProgress
```

Onboarding credits `node-2-1` + `node-5-1` via `onboardingCurriculumBridge` on `setOnboardingComplete`.

## Hooks

| Hook | Role |
|------|------|
| `usePuzzleBank` | Loads all active `puzzle_bank` rows via React Query |
| `useDailySession` | Bank + peek puzzles; 3 per `todayKey()`; daily completion gate |
| `useTrainingSessionController` | Daily or node session bootstrap, resume, completion |
| `useNodePuzzles` | Resolve node `puzzles[]` from bank slugs + generators |
| `useTrainingPath` | Path map units/nodes, active node |
| `useDrillSessionController` | Deprecated — use `useTrainingSessionController` |
| `useResolvedPuzzle` | `resolveTrainingPuzzle` per puzzle |
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

Generators: `packages/chess-core/src/training/generators/`. Unit 4–5 bank nodes use `puzzle_bank` slugs; optional DB columns `puzzle_kind`, `training_node_id`.

Validate seeds: `cd packages/chess-core && npm run validate:puzzles`.

## Progress persistence

| Field | Purpose |
|-------|---------|
| `trainingProgress` | `completedNodeIds`, `nodeStars`, `activeNodeId` |
| `nodeSessionProgress` | Mid-node resume (`nodeId` + `completedPuzzleIds`) |
| `drillProgress` / `lastDrillCompletedDate` | Daily matrix only |

Pure helpers: `apps/mobile/lib/trainingProgress.ts`.
