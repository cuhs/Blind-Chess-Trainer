---
name: voice-match
description: >-
  Implements voice match engine using Stitch Animated Match Engine frame.
  Use when building VoiceMatch, DisambiguationOverlay, or STT pipeline.
disable-model-invocation: false
---

# Voice Match Engine

## Stitch Frame

`2cbaa7be4acd4190a3f95dae66d1b0bc` — **Animated Match Engine**

## Stitch UI Elements

- "Your Move:" voice prompt area
- Mic button, Peek button (`visibility`), Cover board button (slashed eye — hides grid + coordinates)
- Minimal/chrome-free match surface

## Pipeline (unchanged)

```
STT → normalizeMove() → validateMove(chess.js) → apply | disambiguate
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
- [x] Peek + Cover always visible during match
- [ ] Disambiguation re-enters same pipeline
- [ ] On-device STT wired to match move submission (replaces DevMoveInput)
- [x] Native Stockfish 17 on iOS via `@og-nav/expo-stockfish` (requires dev build, not Expo Go)
- [ ] Stockfish off main thread (runs on JS thread today; worker TBD)
```
