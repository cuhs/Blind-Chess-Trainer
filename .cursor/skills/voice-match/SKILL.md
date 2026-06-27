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
  → normalizeSpokenMove + pickBestTranscript (@mindboard/voice-pipeline)
  → resolveMove | resolveDisambiguationVoice (chess-core) → apply | disambiguate
```

## Packages & hooks

| Piece | Location |
|-------|----------|
| STT adapter | `apps/mobile/hooks/useMatchSpeech.ts` |
| Transcript prep, dynamic STT bias, alternative scoring | `packages/voice-pipeline` |
| Move normalizer / legality | `packages/chess-core` (`match-move.ts`) |
| Session orchestration | `useMatchSession` → `submitPlayerMove` |

`useMatchSpeech` requests microphone permission, prefers `requiresOnDeviceRecognition` when supported, uses `buildContextualStrings(fen, disambiguation)` and `maxAlternatives: 5`, and submits final transcripts to `submitPlayerMove`. Disambiguation voice tries `resolveDisambiguationVoice` first, then falls through to `resolveMove`.

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
