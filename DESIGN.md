# MindBoard Design System

> **Status:** Synced from Google Stitch on 2026-06-08.
> Project: **MindBoard: Blindfold Chess Academy** (`3837939560019732420`)
> Design system: **Playful Tactile Minimalism** (light mode, mobile)

## Source of Truth

| Data | Authoritative source | Status |
|------|---------------------|--------|
| Visual tokens (color, type, spacing, elevation) | Google Stitch → `apps/mobile/theme/tokens.ts` | **Synced** |
| Screen layouts & component styling | Google Stitch frames (see [Screen Map](#stitch-screen-map)) | **Synced** |
| UX behavior, flows, timing | `Product-Blueprint.md` | **Available** |
| Fixed pedagogical copy | `Product-Blueprint.md` (blueprint wins on conflicts) | **Available** |
| UI chrome copy | Stitch screens (where blueprint is silent) | **Synced** |

**Conflict resolution:** Blueprint wins on interaction logic, copy timing, and blindfold behavior. Stitch wins on visual style, tokens, and component appearance.

---

## Brand & Style (from Stitch)

**Playful Tactile Minimalism** — encouraging, energetic, game-first ed-tech aesthetic inspired by Duolingo (gamification, bold UI) and Ahead (soft transitions, minimalist prompts).

- Heavy rounded corners, bold 2pt strokes, 3D-offset "squishy" buttons
- Flat vibrant surfaces — no complex gradients
- Mascot-forward chess pieces with character/personality
- User feels rewarded, not judged

Tokens: `apps/mobile/theme/tokens.ts`

---

## Color Semantics (from Stitch)

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Success Green | `primaryContainer` | `#58cc02` | Correct states, primary CTAs, progress fill |
| Growth Green | `primary` | `#2b6c00` | Primary text on buttons, surface tint |
| Aha! Yellow | `secondaryContainer` | `#fec700` | Rewards, streaks, chips/badges, "Aha!" moments |
| Action Blue | `tertiaryContainer` | `#4abdff` | Navigation, focused inputs, secondary interactions |
| Danger | `error` | `#ba1a1a` | Blunders, errors (pair with text/icon) |
| Fog & Stone | `fogStone` / `outlineVariant` | `#afafae` / `#becbb1` | Invisible grid, fog overlay, neutral strokes |
| Canvas | `background` | `#faf9f8` | Default screen background |
| Card | `surfaceContainerLowest` | `#ffffff` | Content cards with 2pt `#e5e5e5` stroke |
| Recessed | `recessedBg` | `#f7f7f7` | Depth layers behind cards |
| Ink | `onSurface` / `contrastInk` | `#1a1c1b` / `#4b4b4b` | Text (use `#4b4b4b` on colored surfaces for WCAG AA) |

---

## Typography (from Stitch)

| Token | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| `displayLgMobile` | Plus Jakarta Sans | 28px | 800 | Screen titles ("Cognitive Heatmap") |
| `headlineMd` | Plus Jakarta Sans | 20px | 700 | Prompts ("Look closely. You have 5 seconds.") |
| `headlineLg` | Plus Jakarta Sans | 24px | 800 | Section headers |
| `bodyLg` | Be Vietnam Pro | 18px | 500 | Input text, emphasized body |
| `bodyMd` | Be Vietnam Pro | 16px | 400 | Explanatory copy, mascot tips |
| `labelBold` | Be Vietnam Pro | 14px | 700 | Badges, labels, legend items |

Headlines: tight tracking. Body: generous line height for lesson digestibility.

---

## Spacing & Layout (from Stitch)

4px baseline rhythm. One-handed mobile layout.

| Token | Value | Usage |
|-------|-------|-------|
| `marginMobile` | 20px | Screen horizontal margins |
| `gutter` / `md` | 16px | Card internal padding |
| `sectionGap` / `xl` | 32px | Between board and controls |
| `inputHeight` | 56px | Text inputs (2pt stroke) |
| `buttonOffset` | 4px | 3D press extrusion |
| `strokeWidth` | 2pt | Cards, inputs, containers |
| `progressBarHeight` | 12px | Pill-shaped progress bars |
| `layout.tabBarClearance` | 128px | Scroll padding-bottom on main-tab screens |

Board: fluid square, full width minus side margins. Squares: 4px rounded corners.

---

## Elevation & Motion (from Stitch)

No soft drop shadows. Use **tonal offsets and 3D extrusions**:

- Buttons/cards: 4px bottom border in darker shade; on press translate 4px down
- Active chess pieces: 2px vertical offset above square
- Cards: white + 2pt stroke, 16px radius, 4px bottom offset (no shadow)
- Focused inputs: stroke → Action Blue (`#4abdff`), offset more pronounced

---

## Stitch Screen Map

| Stitch frame | Screen ID | Blueprint phase | RN screen |
|--------------|-----------|-----------------|-----------|
| Animated Invisible Grid Hook | `a7e368689dde41bb8f4e006f32f4e854` | Phase 1 (0–2 min) | `HookBoard` |
| Active Recall Training Phase | `16b75139d1d14931a1d17f54ce051a0e` | Phase 2 | `DailyDrill` (session layout) |
| Interactive Active Recall Training | `f42d4f83e10a44df8c569ed060ad83a4` | Phase 2 | `DailyDrill` (progress chrome) |
| Animated Match Engine | `2cbaa7be4acd4190a3f95dae66d1b0bc` | Phase 3 | `VoiceMatch` |
| Animated Cognitive Heatmap Dashboard | `61ce6c33f6fe4350b176eb6cd2ddace6` | Phase 4 / onboarding fog | `CognitiveHeatmap` / `FogRevealScreen` |
| MindBoard Home (Enhanced Loop) | `b1eff5fd32e743e2a7f8a4b78a340318` | Phase 1 exit | `HomeDashboard` |
| Populated Game Analysis & Review | `48bde48ed59748cba0907d6a02705475` | Phase 4 | `ReplayScreen` (`ReplayMoveTimeline` + `ReplayControls`) |
| Product Strategy & Screen Plan | `48eea1d4614941f3b6c927d368d8b1f0` | Reference only | — |
| Mascot logo | `b6e58aa5efdd4cd994cd1d6a03da943a` | Brand asset (legacy) | — |
| MindBoard Standalone Icon | `4709d4e8656e42bebf74af7b36e3821a` | App / header icon | `MascotAvatar` |

### Blueprint states not in Stitch (implement anyway)

| Screen | Missing states |
|--------|----------------|
| `HookBoard` | invisible-prompt (post-vanish), success |
| `StoryCheck` | listening, yes/no prompt (blank screen) |
| `RewardPuzzle` | rapid puzzle ×2 |
| `MatchPrimer` | expectation copy → unlock HomeDashboard |
| `DisambiguationOverlay` | black screen, two massive targets |
| `VoiceMatch` | disambiguation prompt state |

### Screens without a Stitch frame (infer — do not invent)

When a screen or state has no Stitch frame (new screen, blueprint-only flow, or a state Stitch does not show), **do not invent a new visual language**. Compose from existing synced context:

1. **Tokens** — always `@/theme` (`tokens.ts`). Never new hex, fonts, or spacing values.
2. **Nearest sibling** — pick the closest Stitch screen by phase and UI role:

| New / missing screen | Infer from |
|---------------------|------------|
| `StoryCheck`, `RewardPuzzle` | `HookBoard` + `DailyDrill` (`PuzzleSessionLayout`, `SquareKeypad`/`YesNoZone`, progress chrome) |
| `MatchPrimer` | `HookBoard` (headline + `PrimaryButton` + `bodyMd` copy) |
| `DisambiguationOverlay` | `VoiceMatch` (minimal chrome, large touch targets, `colors.background`) |
| New training screen | `DailyDrill` + `TrainingHub` |
| New settings / profile | `CognitiveHeatmap` (card layout, legend chips) |
| New post-game view | `ReplayTimeline` |

3. **Reuse components** — `PrimaryButton`, `SquareKeypad`, `YesNoZone`, `Card`, `ProgressBar`, `MascotTip` per [Component Catalog](#component-catalog). Same 3D offset, 2pt stroke, 16px radius.
4. **Interaction from blueprint** — layout/copy timing from `Product-Blueprint.md`; only visual dressing is inferred.
5. **Flag for later** — `// TODO(stitch): <ScreenName>` on the file. Ship consistent UI now; replace when a Stitch frame exists.

**Do not:** create one-off palettes, new button styles, or spacing outside the 4px scale.

---

## Copy Deck

### Blueprint (verbatim — do not paraphrase)

| Context | Copy |
|---------|------|
| Hook timer | "Look closely. You have 5 seconds." |
| Hook prompt | "Which square is the White Rook on?" |
| Story prompt | "Is the Black King in check?" |
| Match primer | "Your first game will feel chaotic. You will lose track of the board. That is the point. Peek freely, let the app catch your mistakes, and your failures will build tomorrow's puzzles." |
| Disambiguation | "Which rook, a-file or f-file?" |
| Post-game | "Here is exactly what the board looked like when your mental map broke." |

### Stitch UI chrome (use when blueprint is silent)

| Context | Copy |
|---------|------|
| Hook subtitle | "Memorize the positions before the fog rolls in." |
| Peek affordance | "I forgot... need a peek?" |
| Voice prompt | "Your Move:" |
| Training header | "Story of the Position" |
| Mascot tip pattern | "Look at the long diagonal from a4! Imagine the lines of force." |
| Heatmap title | "Cognitive Heatmap" |
| Heatmap subtitle | "Your mental map of the board. Clear the fog to master the game." |
| Fog legend | "Fog: Unknown tactics" |
| Acquired legend | "Green: Concept Acquired" |
| Mastery legend | "Gold: Strategic Mastery" |

---

## Confirmed UX Requirements (blueprint)

These override Stitch visuals where they conflict:

| Pattern | Spec |
|---------|------|
| Invisible Grid | Board vanishes; no pieces after hook timer |
| Training | Tactile manual input — no voice. `SquareKeypad` (A–H / 1–8) for squares; `YesNoZone` (swipe/tap halves) for yes-no |
| Voice match | Voice-first; peek always available; no match clock |
| Disambiguation | Black screen, massive touch targets, voice OR tap |
| Fog math | `opacity = 1 - (interactions / threshold)` — center 15, edge 10, corner 5 |
| Onboarding fog | ~99% obscured after 4 questions |

---

## HomeDashboard Layout (Stitch: MindBoard Home Enhanced Loop)

Post-onboarding `/(main)/index`. Habit validation + fog heatmap + closed-loop CTAs.

| Zone (top → bottom) | Component | Data |
|---------------------|-----------|------|
| Header | `AppHeader` (bordered) | Mascot + MindBoard + settings |
| Stats | `HabitHeader` | Bolt streak + Board Mapped % (primary) |
| Hero | Title + subtitle | "Cognitive Heatmap" + body copy |
| Hero board | `InteractiveHeatmap` (`showLabels={false}`) | Centered compact card with 8×8 fog grid |
| Primary CTA | `DailyMatrixCard` | "Today's Matrix: N Positions" + peek loop badge; "Completed Today" when drill done |
| Secondary CTA | `VoiceMatchCard` | "Start Blindfold Match" row + chevron |
| Navigation | Expo tabs | Home · Training · Match · Analysis (active tab green 3D pill); Settings via header gear |

---

## Chess Representation

All board UIs share `apps/mobile/components/chess/boardUtils.ts`. FEN parsing via chess.js only.

### Orientation & geometry

- **White at bottom** (rank 1), black at top (rank 8) — standard white POV
- **displayRank** 0 = rank 8 (top), 7 = rank 1 (bottom); **file** 0 = `a`
- **a1 is a dark square** — `isLightSquare(file, displayRank)`: `(file + displayRank) % 2 === 0` → light
- `squareFromIndex(file, displayRank)` → `Square` (`a1`–`h8`)

### Notation correlation

Every layer uses the same square names. Agent reference: `.cursor/skills/chess-ui/notation.md`.

| Layer | How square `e4` is expressed |
|-------|------------------------------|
| Algebraic | `'e4'` (`Square` type) |
| Grid index | file `4` (e-file), displayRank `4` → rank `8-4=4` |
| `parseBoard` | `board[4][4]` → piece at e4 |
| FEN | rank 4 field in FEN string (8th row of placement) |
| User input | `normalizeSquare('E4')` → `'e4'` |
| Heatmap / peek | `squaresTouched`, `PeekEvent.square`, `HeatmapCell.square` |

**Semantic rule:** file = vertical column (a–h), rank = horizontal row from White's side (1–8). `e4` is the king-side center square — not "file 4" or "rank 4" as interchangeable indices.

**Verify puzzles:** `chess.get(expected)` matches prompt; `squaresTouched` lists every square the exercise involves.

### Square colors

| Context | Light square | Dark square |
|---------|--------------|-------------|
| Visible board (`ChessBoard`) | `colors.surfaceContainerLow` | `colors.outlineVariant` |
| Invisible grid | `colors.recessedBg` | `colors.fogStone` |
| Heatmap (`InteractiveHeatmap`) | same mapping + `FogOverlay` opacity |

Board border: 2pt `colors.cardStroke`. Square corners: `radius.boardSquare` (4px).

### File & rank labels

| Edge | Labels | Style |
|------|--------|-------|
| Bottom | `a` `b` `c` `d` `e` `f` `g` `h` | `typography.labelBold`, `colors.onSurfaceVariant` |
| Left | `8` `7` `6` `5` `4` `3` `2` `1` (top → bottom) | same |

Required on `ChessBoard` and `InteractiveHeatmap`. Optional on `InvisibleGrid`.

### Shared primitives

| Component | Path |
|-----------|------|
| `BoardGrid` | `components/chess/BoardGrid.tsx` |
| `BoardLabels` | `components/chess/BoardLabels.tsx` (`RankLabels`, `FileLabels`) |
| `boardColors` | `components/chess/boardColors.ts` |
| `useBoardDimensions` | `components/chess/useBoardDimensions.ts` |
| `ChessPiece` | `components/chess/pieces/ChessPiece.tsx` |

Reuse `BoardGrid` for any 8×8 UI — do not duplicate grid loops.

### Pieces (Stitch: mascot vectors)

- SVG via `ChessPiece` — **no Unicode glyphs** (`♙♘♗♖♕♔`) or emoji
- Simplified mascot style per Stitch; 2px hover offset on active piece

---

## Icons — No Emoji

**No emoji characters anywhere in the UI** — not in buttons, tips, labels, or placeholders.

| Need | Use instead |
|------|-------------|
| Lightbulb (tip) | `LightbulbIcon` in `components/ui/icons/` |
| Peek / visibility | `PeekIcon` (SVG) |
| Mic, pause | SVG icons via `react-native-svg` or `@expo/vector-icons` |
| Chess pieces | `components/chess/pieces/*.tsx` |

Shared icons live in `components/ui/icons/`. Reuse — do not inline emoji as temporary icons.

---

## Component Catalog

| Component | Stitch spec | Blueprint constraint |
|-----------|-------------|---------------------|
| `PrimaryButton` | 3D-offset, Plus Jakarta Bold, 16px radius | — |
| `ScrollAnswerCue` | Tappable card row (white, 2pt stroke) + green chevron badge; press scrolls controls into view | Rendered by `PuzzleSessionLayout` only when answer controls overflow the viewport |
| `SquareKeypad` | Selection display + A–H / 1–8 key rows (56px) + Submit | `square` puzzles; replaces native keyboard |
| `YesNoZone` | Split tap halves (No/red ← \| → Yes/green) + swipe; directional haptic | `yes-no` puzzles; replaces native keyboard |
| `AnswerFlashOverlay` | Non-interactive green/red color wash | Answer feedback (`useAnswerFlash`) |
| `ProgressBar` | 12px pill, green fill, white shine | — |
| `Card` | White, 2pt `#e5e5e5` stroke, 16px radius, 4px offset | — |
| `HeroCopy` | Title + optional subtitle; `display` (centered) / `section` (left) | Home, TrainingHub, FogReveal headers |
| `PlaceholderScreen` | Centered mascot/icon + badge + copy | Analysis + Settings stubs |
| `ChessBoard` | Labels, 4px square radius, SVG mascot pieces | Visible: hook, replay, post-game only |
| `InvisibleGrid` | Same geometry, fog/stone neutrals | No pieces |
| `DisambiguationOverlay` | Black/minimal screen, large targets | Voice match only |
| `FogOverlay` | Stone grey opacity per square | Uses fog math |
| `CognitiveHeatmap` | Clarity %, mastery count, legend | Proportional fog |
| `MascotTip` | Chip with `LightbulbIcon` (SVG) + `bodyMd` copy | Optional only; never auto-reveal puzzle answers |
| `MatchEloSlider` | Opponent Elo slider (300–3190, step 50) + tier label | `MatchSetupScreen` |
| `MatchColorPicker` | White / Black segmented choice | `MatchSetupScreen` |
| `MatchSetupHero` | Fog grid + blindfold icon hero | `MatchSetupScreen` |
| `MatchSetupScreen` | Blindfold match prep — covered board preview, Elo slider, Start | `/(main)/match` |
| `MatchStatusBar` | Card: VS ENGINE + Elo, one-line status (your move / thinking / illegal move / result) | `VoiceMatchScreen`; status tone: neutral/action/alert/success |
| `MatchControlBar` | Mic + Peek + Cover (slashed-eye) circular controls | `VoiceMatchScreen` |
| `BoardCover` | Solid panel hiding grid and coordinate labels | `BlindfoldBoard` when fully covered |
| `MatchSecondaryActions` | Resign text action | `VoiceMatchScreen` (untimed match) |
| `MoveDisambiguation` | Ambiguous move picker (SAN + label) | `VoiceMatchScreen` |
| `MatchMovePanel` | Recessed card: engine row + your move input grouped together | `VoiceMatchScreen` |
| `DevMoveInput` | SAN field + Play button (`card` or `embedded` in `MatchMovePanel`) | `VoiceMatchScreen` until STT lands |
| `PeekButton` | Yellow chip, `LightbulbIcon` (SVG) + label — no emoji | Rendered by `PuzzleSessionLayout` under the board (answer phase); reveal lands where the user taps |
| `ProgressChrome` | Level/position label + percent + `ProgressBar` | Onboarding flow + DailyDrill (merged chrome) |
| `PuzzleSessionLayout` | SafeArea + scroll + header + memorize-prompt + board + controls slot; owns `ScrollAnswerCue` + `PeekButton` placement (`onPeek` prop) | Shared shell: Hook/Story/Reward + DailyDrill |
| `AppHeader` | Mascot avatar + MindBoard title + settings | Onboarding + home |
| `BoardFrame` | 3D card wrapper for boards/heatmap | Chess + heatmap |
| `MascotAvatar` | Standalone Icon (`4709d4e8`) in green circle frame | `AppHeader` |
| `HabitHeader` | Bolt streak + Board Mapped % | HomeDashboard |
| `InteractiveHeatmap` | Hero 8×8 + `FogOverlay` + tap tooltips | Home + FogReveal |
| `SquareTooltip` | Micro-tooltip on square tap | HomeDashboard |
| `DailyMatrixCard` | Primary CTA + closed-loop badge; `completedToday` disables button | HomeDashboard + TrainingHub |
| `VoiceMatchCard` | Blindfold match row + slashed-eye icon | HomeDashboard |
| `BottomTabBar` | 4-tab nav: Home/Training/Match/Analysis; active green pill + 4px extrusion | `(main)/_layout` |
| Tab icons | `HomeTabIcon`, `TrainingTabIcon`, `MatchTabIcon` (blindfold), `AnalysisTabIcon` | Bottom tab bar |
| `BoltIcon` | Orange filled bolt for streak | `HabitHeader` |
| `HeatmapStats` | CLARITY %, MASTERY count | FogReveal + heatmap |
| `HeatmapLegend` | Three-state legend chips | FogReveal + heatmap |
| `MatchSummaryCard` | Saved match row — date, result, move/peek counts | MatchHistoryScreen |
| `ReplayControls` | Thumb-friendly previous/next stepper below board | ReplayScreen |
| `ReplayMoveTimeline` | Horizontal move chips; red dot on peek/illegal turns | ReplayScreen |
| `ReplayTurnNotice` | Error-styled banner when replaying a flagged move | ReplayScreen |
| `ReplayBackLink` | Chevron back to match list | ReplayScreen |

File paths: `apps/mobile/components/{ui,chess,match,heatmap,replay,home,onboarding,training}/`

Screens: `TrainingHubScreen` (`/(main)/training`), `DailyDrillScreen` (`/(main)/training/drill`), `VoiceMatchScreen` (`/(main)/match`), `MatchHistoryScreen` (`/(main)/analysis`), `ReplayScreen` (`/(main)/analysis/[matchId]`).

Icon assets: `components/ui/icons/`. Piece SVGs: `components/chess/pieces/`.

### Reuse & modularization

**Before building new UI:** search `apps/mobile/components/` and the catalog above. If a component exists, use it — do not duplicate markup or styles.

| Layer | Role | Example |
|-------|------|---------|
| `components/ui/` | Generic, cross-screen primitives | `PrimaryButton`, `Card`, `PromptText`, `HeroCopy`, `ProgressChrome`, `AnswerFlashOverlay` |
| `components/{chess,match,heatmap,replay,home,onboarding,training}/` | Domain-specific, reusable | `ChessBoard`, `FogOverlay`, `DailyMatrixCard`, `PuzzleSessionLayout`, `SquareKeypad`, `YesNoZone` |
| `screens/` | Route-level composition only | Import components; minimal layout logic |
| `hooks/` | Shared stateful logic | `useFogOpacity`, `useOnboardingStep` |

**Extract a new component when:**
- The same UI block appears on 2+ screens (or 2+ states on one screen)
- A screen file grows past ~150 lines of JSX
- Stitch shows a repeated pattern (progress bar + level label, mascot tip chip, 3D CTA)

**Do not extract when:** used once, trivial wrapper, or abstraction would obscure readability. Prefer reuse over premature splitting.

**Composition:** screens assemble catalog components. Pass data via props — no fetching inside presentational components.

**Doc maintenance:** when adding components or changing structure, update this catalog and `AGENTS.md` in the same task (see `doc-maintenance` skill).

---

## Accessibility

- WCAG 2.2 AA — Stitch uses `#4b4b4b` ink on colored surfaces
- Touch targets ≥44pt; inputs 56px height (fat-finger)
- Do not convey state by color alone — pair with text/icons (e.g. disambiguation prompt copy)
- VoiceOver/TalkBack on all interactives
- Support Reduce Motion: instant cut instead of board vanish animation
- Support Dynamic Type up to 1.3×

---

## Re-sync Workflow

1. Stitch MCP connected (`.cursor/stitch-mcp-proxy.mjs`)
2. `list_projects` → confirm project `3837939560019732420`
3. `list_design_systems` + `list_screens` → update this file and `tokens.ts`
4. Flag new gaps with `// TODO(stitch): <frame-name>`

Skill: `.cursor/skills/stitch-designs/SKILL.md`
