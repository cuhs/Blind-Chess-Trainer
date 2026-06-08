---
name: chess-ui
description: >-
  Chess board UI and notation semantics — how Square names, FEN, displayRank,
  and grid indices correlate. Use when building boards, heatmaps, puzzles,
  or any feature that maps piece positions to algebraic notation (e4, Nf3).
disable-model-invocation: false
---

# Chess UI

**Read [notation.md](notation.md) first** when working with squares, FEN, puzzles, or heatmap cells.

## Quick correlation

```
file 0–7        →  a–h
displayRank 0–7 →  rank 8–1 (top → bottom on screen)
square          →  squareFromIndex(file, displayRank)  e.g. (4, 4) → e4
FEN             →  parseBoard(fen)[displayRank][file]  →  PieceCode | null
user answer     →  normalizeSquare(input) === expected  (lowercase Square)
```

## Primitives (`apps/mobile/components/chess/`)

| File | Role |
|------|------|
| `boardUtils.ts` | `squareFromIndex`, `parseBoard`, `isLightSquare`, `forEachDisplaySquare` |
| `BoardGrid.tsx` | 8×8 layout — `renderSquare(file, displayRank)` |
| `BoardLabels.tsx` | `FILES`, `DISPLAY_RANKS` labels |
| `ChessBoard.tsx` | Visible board + pieces |
| `pieces/ChessPiece.tsx` | SVG by `PieceCode` |

## Puzzle / heatmap alignment

- `onboarding-puzzles.ts`: `fen` + `expected` + `squaresTouched` must agree — see notation.md verification habit
- `InteractiveHeatmap`: cell `square` = board label at that cell
- `PeekEvent.square`: same `Square` type

## Checklist

```
- [ ] Used squareFromIndex / forEachDisplaySquare — no ad-hoc index math
- [ ] displayRank vs chess rank: 8 - displayRank
- [ ] FEN verified with chess.js get(square)
- [ ] expected and squaresTouched match actual piece squares
- [ ] After convention changes → update notation.md + DESIGN.md
- [ ] Board UI changes → screenshot via `ios-simulator-testing` (file a–h, rank 8–1, square colors)
```

Full semantics: [notation.md](notation.md)
