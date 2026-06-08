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

## Grid Geometry

`InteractiveHeatmap` shares `boardUtils` with `ChessBoard` — `HeatmapCell.square` `'e4'` = board cell `e4` = FEN square `e4`. Use `squareFromIndex` / `forEachDisplaySquare` — see `chess-ui/notation.md`.

## Closed Loop

Peek → PeekEvent(FEN) → motif engine → daily puzzle → training → fog lifts

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
```
