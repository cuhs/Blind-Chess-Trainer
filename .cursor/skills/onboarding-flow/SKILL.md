---
name: onboarding-flow
description: >-
  Implements Phase 1 onboarding using Stitch Animated Invisible Grid Hook
  frame and blueprint interaction specs. Use when building HookBoard, guest
  mode, or the first 10-minute pre-account experience.
disable-model-invocation: false
---

# Onboarding Flow

## Stitch Frame

`a7e368689dde41bb8f4e006f32f4e854` — **Animated Invisible Grid Hook**

Fetch via `get_screen` before implementing. Visual: Playful Tactile Minimalism.

## Flow

```
HookBoard → StoryCheck → RewardPuzzle ×2 → FogReveal → MatchPrimer → Dashboard
```

| Min | Screen | Stitch? | Input |
|-----|--------|---------|-------|
| 0–2 | HookBoard | Yes | Text coord |
| 2–4 | StoryCheck | Infer from `HookBoard` + `StoryPuzzle` | Yes/No |
| 4–6 | RewardPuzzle ×2 | Infer from `StoryPuzzle` | Text |
| 6–8 | FogReveal | Partial (`61ce6c33` heatmap) | View |
| 8–10 | MatchPrimer | Infer from `HookBoard` | Tap |

## Stitch Copy (hook)

- "Look closely. You have 5 seconds."
- "Memorize the positions before the fog rolls in."
- Progress: "Level 1: The Hook 25%"
- Peek hint: "I forgot... need a peek?"

## Blueprint Copy (verbatim)

- Square prompt: "Type the square the White Rook is on."
- Story: "Is the Black King in check? Type Yes or No."
- Match primer: full paragraph in `Product-Blueprint.md`

## Visual Spec (Stitch)

- `MoveInput` 56px, `PrimaryButton` 3D-offset green
- Progress bar: 12px pill, green fill
- Mascot chess pieces on visible board phase

## Checklist

```
- [ ] Board visible 5s only, then invisible grid
- [ ] Text input only — no voice
- [ ] expo-haptics on correct answers
- [ ] FogReveal ~99% fog using FogOverlay + stone neutrals
```
