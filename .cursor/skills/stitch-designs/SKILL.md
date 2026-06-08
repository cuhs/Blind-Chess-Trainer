---
name: stitch-designs
description: >-
  Syncs MindBoard UI from Google Stitch MCP into tokens.ts and DESIGN.md.
  Use when re-syncing designs, implementing screens, or verifying visual
  fidelity against Stitch frames in project 3837939560019732420.
disable-model-invocation: false
---

# Stitch Designs

## Project

- **ID:** `3837939560019732420`
- **Title:** MindBoard: Blindfold Chess Academy
- **System:** Playful Tactile Minimalism (light, mobile)

## Re-sync Workflow

```
- [ ] 1. list_projects — confirm MindBoard project
- [ ] 2. list_design_systems — extract theme tokens
- [ ] 3. list_screens — map frames to DESIGN.md Screen Map
- [ ] 4. Update apps/mobile/theme/tokens.ts
- [ ] 5. Update DESIGN.md Visual Tokens + Screen Map sections
- [ ] 6. get_screen for target frame before implementing
```

## Screen IDs

| RN screen | Stitch ID | Stitch title |
|-----------|-----------|--------------|
| HookBoard | `a7e368689dde41bb8f4e006f32f4e854` | Animated Invisible Grid Hook |
| StoryPuzzle | `16b75139d1d14931a1d17f54ce051a0e` | Active Recall Training Phase |
| DailyDrill | `f42d4f83e10a44df8c569ed060ad83a4` | Interactive Active Recall Training |
| VoiceMatch | `2cbaa7be4acd4190a3f95dae66d1b0bc` | Animated Match Engine |
| CognitiveHeatmap | `61ce6c33f6fe4350b176eb6cd2ddace6` | Animated Cognitive Heatmap Dashboard |
| ReplayTimeline | `48bde48ed59748cba0907d6a02705475` | Populated Game Analysis & Review |

## Key Tokens (current sync)

- Primary green: `#58cc02` / `#2b6c00`
- Aha yellow: `#fec700`
- Action blue: `#4abdff`
- Margins: 20px; card padding: 16px; section gap: 32px
- Input: 56px; button 3D offset: 4px; stroke: 2pt

## Authority

| Topic | Wins |
|-------|------|
| Colors, spacing, typography, 3D buttons | Stitch |
| Interaction, timing, fog math, blindfold rules | Product-Blueprint.md |
| Pedagogical copy (match primer, etc.) | Product-Blueprint.md |
| UI chrome copy | Stitch (see DESIGN.md Copy Deck) |

## Missing Stitch Frames — Infer, Don't Invent

No matching frame? **Do not block.** Compose from synced context:

1. Tokens only from `@/theme` — never new colors/fonts/spacing
2. Find nearest sibling screen (same phase, same UI role) — see DESIGN.md inference table
3. Reuse existing components from `apps/mobile/components/` — check catalog before creating new styled markup
4. `get_screen` on the sibling frame if layout is unclear
5. Interaction/copy from `Product-Blueprint.md`
6. Add `// TODO(stitch): <ScreenName>` — ship consistent UI now

Example: `MatchPrimer` → infer from `HookBoard` (headline + green 3D button + body copy).

## Fidelity Checklist

```
- [ ] Tokens from @/theme — no inline hex
- [ ] 3D button press (4px translate)
- [ ] 56px inputs, 2pt strokes, 16px card radius
- [ ] Blueprint states implemented even if Stitch shows one
- [ ] Missing frames: inferred from sibling + // TODO(stitch): <name>
```
