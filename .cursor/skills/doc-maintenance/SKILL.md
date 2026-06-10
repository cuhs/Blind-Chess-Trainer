---
name: doc-maintenance
description: >-
  Keeps AGENTS.md, DESIGN.md, .cursor/rules, and .cursor/skills accurate when
  code changes invalidate them. Use after adding screens, components, packages,
  routes, conventions, or Stitch syncs; or when agent guidance contradicts the
  codebase.
disable-model-invocation: false
---

# Doc Maintenance

Run **before marking a task done** if the change touched architecture, UI structure, conventions, or agent-facing paths.

## Checklist

```
- [ ] 1. List what changed (files, screens, components, APIs, patterns)
- [ ] 2. Grep AGENTS.md, DESIGN.md, .cursor/ for stale references
- [ ] 3. Update affected docs (matrix below)
- [ ] 4. AGENTS.md rules/skills tables match files on disk
- [ ] 5. Rules stay concise; skills link to DESIGN.md for detail
```

## Update Matrix

| You changed… | Update these |
|--------------|--------------|
| `app/` routes or `(onboarding)`/`(main)` flow | `AGENTS.md`, `react-native-expo.mdc`, `onboarding-flow` skill |
| New `screens/` or `components/` | `DESIGN.md` catalog + file paths; domain skill if workflow-specific |
| `theme/tokens.ts` or Stitch frames | `DESIGN.md`, `stitch-designs` skill |
| `components/chess/*` (board, pieces, labels) | `DESIGN.md` § Chess, `chess-board.mdc`, `chess-ui` skill + `notation.md` |
| `boardUtils` index/FEN conventions | `chess-ui/notation.md`, `DESIGN.md` notation table |
| Mobile routes or onboarding flow | `ios-simulator-testing` skill P0 scenarios |
| New interactives without a11y labels | `design-system.mdc`, grep `accessibilityLabel` |
| `components/ui/icons/*` | `DESIGN.md` § Icons, `design-system.mdc` |
| New `packages/*` | `AGENTS.md` structure, scoped rule, `AGENTS.md` commands |
| `apps/api/` or `supabase/` | `backend-api.mdc`, `heatmap-analytics` if schema |
| `packages/chess-core/src/motifs/` | `motif-engine.mdc`, `motif-engine` skill, `chess-logic.mdc` |
| `packages/voice-pipeline/` | `voice-pipeline.mdc`, `voice-match` skill |
| New always-on constraint | `mindboard-core.mdc` + `AGENTS.md` constraints |
| Removed feature | Delete stale rows from all tables; don't leave dead references |

## Stale Signal Examples

- `AGENTS.md` lists a screen/component that no longer exists
- Rule `globs` don't cover new directories
- Skill references old component names (`ChessBoard` props, hook names)
- `DESIGN.md` catalog missing `BoardGrid`, `ChessPiece`, etc.
- Docs say "pending Stitch sync" but tokens are populated

## Principles

- **Same PR/task** as the code change
- **Minimal diff** — fix what's wrong, don't rewrite unrelated sections
- **Single source of detail:** `DESIGN.md` for UI; rules are short pointers
- **Tables must match disk** — `ls .cursor/rules` and `ls .cursor/skills`

## After Stitch Re-sync

Also run `stitch-designs` workflow, then verify `doc-maintenance` checklist.
