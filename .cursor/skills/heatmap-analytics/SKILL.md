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
| `CognitiveHeatmap` | `61ce6c33f6fe4350b176eb6cd2ddace6` | Animated Cognitive Heatmap Dashboard |
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

## Closed Loop

Peek → PeekEvent(FEN) → motif engine → daily puzzle → training → fog lifts

## Checklist

```
- [ ] FogOverlay uses colors.fogStone / outlineVariant
- [ ] Legend matches Stitch three-state model
- [ ] Replay timeline highlights peeks + illegal moves
- [ ] Stats: clarity % and mastery count
```
