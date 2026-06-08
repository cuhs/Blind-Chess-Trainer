---
name: voice-match
description: >-
  Implements voice match engine using Stitch Animated Match Engine frame.
  Use when building VoiceMatch, DisambiguationOverlay, STT pipeline, or
  clock freeze UI.
disable-model-invocation: false
---

# Voice Match Engine

## Stitch Frame

`2cbaa7be4acd4190a3f95dae66d1b0bc` — **Animated Match Engine**

## Stitch UI Elements

- Timer display (e.g. `04:42`)
- "CLOCK FROZEN" badge with freeze icon
- "Your Move:" voice prompt area
- Mic button, Peek button (`visibility`), Pause button
- Minimal/chrome-free match surface

## Pipeline (unchanged)

```
STT → normalizeMove() → validateMove(chess.js) → apply | freeze
```

## Disambiguation

No Stitch frame — **infer from `VoiceMatch`** (`2cbaa7be…`):
- Same `colors.background`, minimal chrome, large touch targets
- Reuse match-screen button/label styles from `@/theme`
- Blueprint: "Which rook, a-file or f-file?" + same normalizer pipeline
- Flag `// TODO(stitch): DisambiguationOverlay`

## Visual (Stitch)

- Action blue for info elements
- 3D-offset controls where applicable
- `colors.background` canvas

## Checklist

```
- [ ] Clock freeze UI matches Stitch "CLOCK FROZEN" badge
- [ ] Peek + Pause always visible during match
- [ ] Disambiguation re-enters same pipeline
- [ ] Stockfish WASM off main thread
```
