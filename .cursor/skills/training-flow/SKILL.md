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
puzzle_bank (Supabase)
  → usePuzzleBank
  → useResolvedPuzzle (resolveTrainingPuzzle)
  → DailyDrillScreen
```

`resolveTrainingPuzzle` runs `analyzePosition` on `displayFen`. When the top motif's `expected` matches `puzzle_bank.expected_answer`, the engine prompt and `squaresTouched` win; otherwise the curated DB prompt is kept (e.g. bishop square vs pinned knight on the same FEN).

Validate seeds: `cd packages/chess-core && npm run validate:puzzles`.

## Hooks

| Hook | Status | Role |
|------|--------|------|
| `usePuzzleBank` | Done | Loads active `puzzle_bank` rows via React Query |
| `useResolvedPuzzle` | Done | Memoized `resolveTrainingPuzzle` per puzzle |
| `useMemorizePhase` | Done | 5s board memorize → answering → success |
| `useStoryNarration` | **Not wired** | `expo-speech` move sequence for puzzles with `moves` |
| `useTrainingAnswer` | Done | Validate answer + `recordHeatmapInteractions` |
| `useDailyMatrix` | Done | Puzzle count + peek loop badge for hub/home cards |

## Session model

1. **Memorize** — board visible 5s (`useMemorizePhase`), or move narration when wired
2. **Answer** — blank screen + prompt; `SquareKeypad` or `YesNoZone`
3. **Peek** — 2s board flash; records heatmap interaction
4. **Advance** — next puzzle or complete session → home tab

Blueprint: **3 puzzles per daily session**. Current code loads all active rows (7 seeds) — cap not implemented yet.

## Phase 2 remaining

```
- [x] TrainingHub + DailyDrill routes
- [x] puzzle_bank loading + heatmap on answer/peek
- [x] useResolvedPuzzle / motif-backed prompts
- [ ] Wire useStoryNarration for puzzles with moves[]
- [ ] Daily session cap at 3 puzzles (rotate or slice by todayKey)
- [ ] Expand puzzle_bank (~50 curated rows; 7 seeds today)
- [ ] Stitch visual polish (TODO(stitch) on hub + drill screens)
```

## Stitch infer (onboarding siblings)

| Screen | Infer from |
|--------|------------|
| `StoryCheck`, `RewardPuzzle` | `HookBoard` + `DailyDrill` (`PuzzleSessionLayout`, progress chrome) |
| `TrainingHub` | `DailyDrill` + `HomeDashboard` card patterns |

## Simulator (`ios-simulator-testing`)

After training UI changes, run P1 scenarios 9–10 in `ios-simulator-testing` skill.
