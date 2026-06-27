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

## Pipeline

```
Mic → expo-speech-recognition (on-device when supported)
  → resolveVoiceTranscript (@mindboard/voice-pipeline)
      → normalizeSpokenMove → resolveMove fast path
      → resolveNoisyTranscript (chess-core voice/) fuzzy legal-move match
  → resolveMove | resolveDisambiguationVoice legality gate → apply | disambiguate
```

## Fuzzy matcher guardrails (`resolveNoisyTranscript`)

Levenshtein on short strings is dangerous (`"eight three"` can sit near both `e3` and `a3`). The resolver:

- Scores with **ratio** `edits / maxLen`, not raw edit count; confidence = `1 - ratio`
- Rejects when two different legal moves have near-identical ratios (wrong move > no match)
- Applies a **stricter ratio cap** (0.25) when the winning phrase is ≤4 chars (`e3`, `a 3`)
- Mobile adds a second gate: auto-submit only when `confidence >= HIGH_CONFIDENCE` (0.72)

Regression tests: `packages/chess-core/src/voice/resolver.test.ts` → `short-string collisions`.

## Packages & hooks

| Piece | Location |
|-------|----------|
| STT adapter | `apps/mobile/hooks/useMatchSpeech.ts` |
| Transcript prep, STT bias, `resolveVoiceTranscript` orchestrator | `packages/voice-pipeline` |
| Fuzzy legal-move matcher (`resolveNoisyTranscript`, phonetics) | `packages/chess-core/src/voice/` |
| Move normalizer / legality | `packages/chess-core` (`match-move.ts`) |
| Session orchestration | `useMatchSession` → `submitPlayerMove` |

`useMatchSpeech` requests microphone permission, prefers `requiresOnDeviceRecognition` when supported, uses `buildContextualStrings(fen, disambiguation)` (≤100 strings) and `maxAlternatives: 5`, resolves via `resolveVoiceTranscript`, and auto-submits only when `matched && confidence >= HIGH_CONFIDENCE`; otherwise fills the field and shows "Check move and tap Play". Typed Play still routes through `submitPlayerMove` → `resolveMove`.

## Native dependency

`expo-speech-recognition` config plugin in `apps/mobile/app.json`. **Both** keys must be present in `ios.infoPlist` (and `ios/MindBoard/Info.plist` if the native project is checked in):

- `NSMicrophoneUsageDescription`
- `NSSpeechRecognitionUsageDescription` — **required**; missing this key crashes on first mic tap

After adding or upgrading, rebuild the dev client:

```bash
cd apps/mobile && npm run ios:build
```

Expo Go does **not** include this native module.

## UI (current)

- `MatchMoveInput` — unified row: SAN field + mic (tap toggle / hold-to-speak) + Play
- `MatchControlBar` — Peek + Cover only (no mic)
- `DisambiguationOverlay` — fullscreen modal, large tap targets, live voice input + errors
- `voiceListenMode` in guest store (`auto` default, `manual` in Settings)

Listen modes:
- **auto** — mic arms on your turn; tap mic to cancel/re-arm
- **manual** — tap mic to arm/disarm
- **hold** — press and hold mic (any mode) to speak, release to submit

## Checklist

```
- [x] Peek + Cover always visible during match
- [x] Disambiguation re-enters same pipeline (voice via submitPlayerMove)
- [x] On-device STT wired to match move submission
- [x] Native Stockfish 17 on iOS via `@og-nav/expo-stockfish` (requires dev build, not Expo Go)
- [ ] Stockfish off main thread (runs on JS thread today; worker TBD)
```

## Tests

```bash
cd packages/chess-core && npm test
cd packages/voice-pipeline && npm test
```

## Next (deferred)

- Cloud STT / LLM text resolver fallback
- Local Whisper + position grammar (wchess-style)
