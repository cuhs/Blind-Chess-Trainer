# MindBoard — Agent Guide

Blind-Chess-Trainer is the repo for **MindBoard**, a cognitive blindfold chess platform.

## Documentation Map

| Doc | Purpose |
|-----|---------|
| `Product-Blueprint.md` | Product vision, phases, interaction logic, pedagogical copy |
| `DESIGN.md` | Design system — **synced from Stitch** (tokens, screens, components) |
| `apps/mobile/theme/tokens.ts` | Machine-readable design tokens |
| `AGENTS.md` | This file — architecture, constraints, tooling |
| `.cursor/rules/` | Auto-applied coding standards |
| `.cursor/skills/` | Domain workflows invoked by task |

**Before UI work:** read `DESIGN.md` + import from `@/theme`. **Before architecture:** read `Product-Blueprint.md`.

## Stitch Project

| Field | Value |
|-------|-------|
| Project | MindBoard: Blindfold Chess Academy |
| Project ID | `3837939560019732420` |
| Design system | Playful Tactile Minimalism |
| Device | Mobile (390×884 logical) |
| Color mode | Light |
| Fonts | Plus Jakarta Sans (headlines), Be Vietnam Pro (body) |

MCP: `.cursor/mcp.json` → `.cursor/stitch-mcp-proxy.mjs` (14 tools enabled).

## Core Philosophy

Closed-loop system: text training → voice matches → failures → custom puzzles → heatmap clears → repeat. No gatekeeping — peek, clock freeze, and haptic fallback are features.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native + Expo (Expo Router) |
| Chess | chess.js |
| Engine | Stockfish WASM (client-side) |
| Backend | Supabase + Express.js |
| Motifs | Deterministic TypeScript microservice |
| Voice | On-device STT → regex normalizer → legality filter |
| LLM | Templating only (JSON → questions) |
| Designs | Google Stitch → `apps/mobile/theme/tokens.ts` (**synced**) |

## Planned Structure

```
apps/mobile/
  theme/tokens.ts     # Stitch design tokens (synced)
  components/         # See DESIGN.md catalog
  screens/            # Mapped to Stitch frames
apps/api/             # Express gateway
packages/chess-core/
packages/motif-engine/
packages/voice-pipeline/
packages/heatmap/
packages/shared/
supabase/migrations/
```

## Stitch → Screen Mapping

| Stitch frame | RN screen | Phase |
|--------------|-----------|-------|
| Animated Invisible Grid Hook | `HookBoard` | 1 |
| Active Recall Training Phase | `StoryPuzzle` | 2 |
| Interactive Active Recall Training | `DailyDrill` | 2 |
| Animated Match Engine | `VoiceMatch` | 3 |
| Animated Cognitive Heatmap Dashboard | `CognitiveHeatmap` | 4 |
| Populated Game Analysis & Review | `ReplayTimeline` | 4 |

Blueprint-only screens (no Stitch frame): `StoryCheck`, `RewardPuzzle`, `MatchPrimer`, `DisambiguationOverlay`. **Infer visuals** from nearest sibling Stitch screen + `@/theme` — never invent new design language. See `DESIGN.md` § Screens without a Stitch frame.

## Build Order

1. Onboarding — `HookBoard` (Stitch: Invisible Grid Hook)
2. Training — `StoryPuzzle`, `DailyDrill`
3. Voice match — `VoiceMatch` + `DisambiguationOverlay`
4. Post-game — `ReplayTimeline`, `CognitiveHeatmap`
5. Infrastructure — Supabase, Express, motif engine

## Skills

| Skill | When |
|-------|------|
| `stitch-designs` | Re-sync Stitch → DESIGN.md + tokens.ts |
| `onboarding-flow` | Phase 1 screens |
| `motif-engine` | Tactical detection + tests |
| `voice-match` | STT pipeline, clock freeze |
| `heatmap-analytics` | Fog, peek, replay, drilling |

## Rules

| Rule | Scope |
|------|-------|
| `mindboard-core` | Always |
| `design-system` | `apps/mobile/**` |
| `design-stitch` | `apps/mobile/**` |
| `typescript-standards` | `**/*.{ts,tsx}` |
| `testing` | `**/*.{test,spec}.{ts,tsx}` |
| `react-native-expo` | `apps/mobile/**` |
| `chess-logic` | `packages/chess-core/**` |
| `motif-engine` | `packages/motif-engine/**` |
| `voice-pipeline` | `packages/voice-pipeline/**` |
| `backend-api` | `apps/api/**`, `supabase/**` |

## Non-Negotiable Constraints

- **Motifs:** TypeScript on chess.js → JSON. LLM templates questions only.
- **Voice:** Clock freezes on ambiguous/illegal input. Disambiguation re-enters same pipeline.
- **Training:** text only. **Matches:** voice-first.
- **Fog:** `opacity = 1 - (interactions / threshold)` — center 15, edge 10, corner 5.
- **Design:** Import tokens from `@/theme` — no inline hex. Blueprint wins on interaction; Stitch wins on visuals.
- **Components:** Search `components/` and `DESIGN.md` catalog before new UI. Reuse primitives; extract shared blocks when they repeat or screens grow large. `screens/` compose only.
- **Testing:** Motif engine ≥90% branch coverage; table-driven normalizer tests.

## Commands

```bash
cd apps/mobile && npx expo start
cd apps/api && npm run dev
cd packages/motif-engine && npm test
npx @_davideast/stitch-mcp doctor   # verify Stitch API
supabase start
```

## Commits

```
feat(mobile): implement HookBoard from Stitch frame a7e36868
feat(mobile): add tokens.ts from Playful Tactile Minimalism
fix(voice-pipeline): map homophone "night" to knight
```
