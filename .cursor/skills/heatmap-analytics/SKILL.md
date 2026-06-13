---
name: heatmap-analytics
description: >-
  Implements cognitive heatmap and replay using Stitch heatmap and game
  analysis frames. Use when building CognitiveHeatmap, FogOverlay, peek
  tracking, or ReplayTimeline.
disable-model-invocation: false
---

# Heatmap Analytics

## Stitch Frames

| RN screen | Stitch ID | Title |
|-----------|-----------|-------|
| `CognitiveHeatmap` / `FogRevealScreen` | `61ce6c33f6fe4350b176eb6cd2ddace6` | Animated Cognitive Heatmap Dashboard |
| `HomeDashboard` | *(infer)* extends `61ce6c33` | Closed-loop home — hero heatmap |
| `ReplayTimeline` | `48bde48ed59748cba0907d6a02705475` | Populated Game Analysis & Review |

## Stitch Heatmap UI

- Title: "Cognitive Heatmap"
- Subtitle: "Your mental map of the board. Clear the fog to master the game."
- Stats: CLARITY %, MASTERY (e.g. 8/64 squares)
- Legend: Fog (unknown), Green (concept acquired), Gold (strategic mastery)
- CTA cards: "Unlock e4 Mastery" → Start Training

## Fog Math (blueprint — not Stitch)

```
opacity = 1 - (interactions / threshold)
```

Center 15, edge 10, corner 5. Onboarding reveal: ~99% fog.

## HomeDashboard Hero Heatmap

- `InteractiveHeatmap` — centerpiece 8×8 grid with `FogOverlay`
- Touched squares glow green through fog; blindspots use stone neutrals
- Tap cleared/touched square → `SquareTooltip` (accuracy %, weakness label)
- `useFogClearedPercent` → Board Mapped % in `HabitHeader`
- `useHeatmapLedger` + `useFogOpacity` hooks

## Data Layer

- `heatmap_ledger` is append-only: `user_id`, `origin_square`, `target_square`, `is_success`, `interaction_type` (`puzzle` | `match_peek`), `client_event_id` (idempotency key)
- Successful puzzle events increment the local `guestStore.heatmapLedger` cache immediately; failed events still sync to the ledger with `is_success = false`
- `useHeatmapLedger` hydrates aggregate square counts from Supabase via `get_heatmap_counts()` and keeps pending inserts in AsyncStorage until flushed
- Flush is idempotent: upsert on `(user_id, client_event_id)` with `ignoreDuplicates`, guarded by a module-level in-flight flag (the hook mounts in several components at once); failed batches stay queued and log a dev warning
- `profiles.total_fog_cleared` mirrors `useFogClearedPercent().clarityPercent`

## Grid Geometry

`InteractiveHeatmap` shares `boardUtils` with `ChessBoard` — `HeatmapCell.square` `'e4'` = board cell `e4` = FEN square `e4`. Use `squareFromIndex` / `forEachDisplaySquare` — see `chess-ui/notation.md`.

## Closed Loop

Target pipeline (not fully wired):

```
Voice match peek → heatmap_ledger (match_peek) + guestStore.peekEvents
  → motif engine → puzzle_bank row (source: peek)
  → DailyDrill → fog lifts
```

**Today:** puzzle training records `heatmap_ledger` on answer via `useTrainingAnswer`. Match peeks write a `match_peek` ledger row on **every** peek; `guestStore.addPeekEvent` stores at most **one** event per position (`positionKeyFromFen`). `lib/peekPuzzles.ts` turns yesterday's peeks (or today's when yesterday is empty) into `source: 'peek'` drills merged in `useDailySession` — one puzzle max per position. Server-side `puzzle_bank` insert remains Phase 4.

## Checklist

```
- [ ] Same 8×8 mapping as ChessBoard (boardUtils)
- [ ] File a–h bottom, rank 8–1 left
- [ ] FogOverlay uses colors.fogStone / outlineVariant
- [ ] Legend uses SVG/color chips — no emoji
- [ ] Replay timeline highlights peeks + illegal moves
- [ ] Stats: clarity % and mastery count
- [ ] HomeDashboard hero heatmap interactive with tooltips
- [ ] Board Mapped % in HabitHeader via useFogClearedPercent
- [ ] Pending ledger events persist offline and flush after auth/env setup
```
