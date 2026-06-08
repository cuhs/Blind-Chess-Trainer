---
name: ios-simulator-testing
description: >-
  Verifies MindBoard mobile UI on the iOS Simulator via ios-simulator MCP.
  Use after mobile UI changes, onboarding flows, chess board updates, or
  when validating accessibility labels, navigation, and visual fidelity.
disable-model-invocation: false
---

# iOS Simulator Testing

MCP server: `ios-simulator` in `.cursor/mcp.json`. Bundle ID: `com.mindboard.app` (`apps/mobile/app.json`).

## Test Pyramid (MindBoard)

| Layer | When | Tool |
|-------|------|------|
| Unit | Logic, chess, fog math | Vitest in `packages/*` |
| Integration | Normalizer, validate | Vitest + fixtures |
| Simulator UI | Screens, flows, a11y, visuals | **ios-simulator MCP** |

Run unit tests **before** simulator. Simulator does not replace chess-core/motif tests.

## Setup

### idb prerequisite

ios-simulator MCP shells out to `idb`. Install both parts:

```bash
# Companion (manual install if brew fails)
mkdir -p ~/.local/opt/idb-companion
curl -fsSL -o /tmp/idb-companion.tar.gz \
  https://github.com/facebook/idb/releases/download/v1.1.8/idb-companion.universal.tar.gz
tar -xzf /tmp/idb-companion.tar.gz -C /tmp
cp -R /tmp/idb-companion.universal/{bin,Frameworks} ~/.local/opt/idb-companion/
ln -sf ~/.local/opt/idb-companion/bin/idb_companion ~/.local/bin/idb_companion

# Client — use Python 3.12 (3.14 breaks fb-idb asyncio)
brew install pipx
pipx install fb-idb --python python3.12
pipx ensurepath
```

`.cursor/mcp.json` sets `PATH` to include `~/.local/bin` for the `ios-simulator` server. Restart MCP after install.

Verify: `idb list-targets` shows booted simulators.

```bash
# Terminal 1 — start app (required)
cd apps/mobile && npx expo start --ios
```

```
- [ ] 1. open_simulator (if not visible)
- [ ] 2. get_booted_sim_id → save udid for tool calls
- [ ] 3. App running in simulator (Expo dev build or Expo Go with project loaded)
- [ ] 4. launch_app bundle_id: com.mindboard.app (if cold start / reset onboarding)
```

For fresh onboarding: clear guest storage or reinstall — onboarding only shows once unless store reset.

## Core Workflow

```
1. ui_describe_all        → read accessibility tree
2. ui_find_element        → locate by accessibilityLabel (preferred)
3. ui_tap / ui_type       → interact
4. screenshot             → visual evidence + Stitch comparison
5. Repeat per test step
```

**Prefer `ui_find_element` + tap coordinates from element frame** over blind x/y taps.

### Key tools

| Tool | Use |
|------|-----|
| `ui_describe_all` | Full screen a11y tree — start here |
| `ui_find_element` | Search `accessibilityLabel` / `accessibilityRole` |
| `ui_tap` | Tap x,y (from find_element bounds center) |
| `ui_type` | Text input (ASCII only, max 500 chars) |
| `ui_swipe` | Scroll heatmap / replay timeline |
| `screenshot` | Save PNG to `output_path` for regression |
| `record_video` | Multi-step flow capture |
| `launch_app` | Cold start with `terminate_running: true` |

## MindBoard Test Scenarios

### P0 — run after mobile UI changes

| # | Flow | Steps | Assert |
|---|------|-------|--------|
| 1 | Hook | Wait 5s board → type `e4` → submit | Advances; haptic/feedback |
| 2 | Story | Type `no` → submit | Correct advances |
| 3 | Reward 1 | Type `e1` | Advances |
| 4 | Fog reveal | View only | Heatmap ~99% fog, legend visible |
| 5 | Home | After match primer | HabitHeader, heatmap, CTAs |

### P1 — component verification

| # | Screen | Assert via screenshot + a11y |
|---|--------|------------------------------|
| 6 | Hook board | File a–h, rank 8–1 labels; SVG pieces |
| 7 | Home heatmap | Tap square → tooltip; tab bar works |
| 8 | Invisible grid | No pieces after hook timer |

### Search strings (accessibility)

Use labels defined in components — grep `accessibilityLabel` before testing:

- `"Chess board"`, `"Invisible grid"`
- `"Submit"`, `"Continue"` (match `PrimaryButton` labels)
- `"Move input"` or prompt text from `PromptText`
- Tab labels: `"Home"`, `"Training"`, `"Match"`, `"Settings"`

If `ui_find_element` fails, fix missing `accessibilityLabel` — do not rely on pixel-only taps.

## Best Practices

1. **Unit tests first** — `npm test` in affected packages
2. **Describe before tap** — `ui_describe_all` prevents wrong-target taps
3. **Screenshot each milestone** — hook, fog reveal, home; compare to Stitch frames
4. **One scenario per task** — don't combine unrelated flows without reset
5. **Verify chess notation** — typed `e4` on hook must match board rook square (see `chess-ui/notation.md`)
6. **No emoji in UI** — screenshot confirms SVG icons render
7. **Report failures** with screenshot + a11y tree snippet

## Do Not

- Skip unit tests because simulator "looks fine"
- Tap without reading accessibility tree on new screens
- Assume Expo is running — start it explicitly
- Commit simulator screenshots to repo unless user requests test artifacts

## After UI Changes

Update `onboarding-flow` or domain skill if test steps changed. Add new `accessibilityLabel`s when adding interactives.
