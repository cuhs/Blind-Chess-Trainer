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
HookBoard → StoryCheck → RewardPuzzle ×2 → FogReveal → MatchPrimer → HomeDashboard
```

Routes: `/(onboarding)/hook` → `story-check` → `reward/1` → `reward/2` → `fog-reveal` → `match-primer` → `/(main)` (replace, no back stack).

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

## Puzzle data (`onboarding-puzzles.ts`)

Each puzzle: `fen`, `expected`, `squaresTouched` must describe the **same** squares.

| Puzzle | Key square | Verify |
|--------|------------|--------|
| Hook | Rook **e4** | FEN rank 4 has `R` on e-file; `expected: 'e4'` |
| Story | King **e8**, moves touch **f3**, **d5** | `applyMoves` then `inCheck()` |
| Reward 1 | King **e1** | FEN rank 1 |
| Reward 2 | Rook **e4** | FEN rank 4 |

See `chess-ui/notation.md` for index ↔ square correlation.

## Blueprint Copy (verbatim)

- Square prompt: "Type the square the White Rook is on."
- Story: "Is the Black King in check? Type Yes or No."
- Match primer: full paragraph in `Product-Blueprint.md`

## Visual Spec (Stitch)

- `MoveInput` 56px, `PrimaryButton` 3D-offset green
- Progress bar: 12px pill, green fill
- `ChessBoard`: file/rank labels, correct square colors, **SVG mascot pieces** (see `chess-ui` skill)
- `PeekButton`: `PeekIcon` SVG — no emoji

## Simulator verification (`ios-simulator-testing`)

After hook/onboarding changes:

```
- [ ] expo start --ios running
- [ ] launch_app com.mindboard.app (cold start if testing full flow)
- [ ] Hook: ui_find_element "Chess board" → wait → type e4 → submit
- [ ] screenshot at board-visible and invisible-grid states
- [ ] Full flow P0 scenarios 1–5 in ios-simulator-testing skill
```

## Checklist

```
- [ ] Board visible 5s only, then invisible grid
- [ ] Text input only — no voice
- [ ] expo-haptics on correct answers
- [ ] FogReveal ~99% fog using FogOverlay + stone neutrals
- [ ] accessibilityLabel on Submit, inputs, board (MCP-testable)
```
