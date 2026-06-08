# Chess Notation & Position Semantics

MindBoard uses **standard algebraic notation** and **white-at-bottom** orientation everywhere. When code, copy, or heatmap data reference a square, they must mean the same cell.

## Square names (algebraic)

A square = **file letter** + **rank number** → e.g. `e4`

| Part | Range | Meaning |
|------|-------|---------|
| File | `a`–`h` | Column left → right from White's view (`a` = queenside) |
| Rank | `1`–`8` | Row bottom → top from White's view (`1` = White's back rank) |

**Semantic anchors (white POV):**
- `a1` — bottom-left, dark square, White's queenside rook home
- `h1` — bottom-right, light square, White's kingside rook home
- `a8` — top-left, light square, Black's queenside rook home
- `h8` — top-right, dark square, Black's kingside rook home
- `e4` — king-side center (not "file 4" or "rank 4" alone)

Type: `Square` in `@mindboard/shared` — lowercase two-char string (`'e4'`).

## Screen grid ↔ notation

`boardUtils.ts` uses **displayRank** (not chess rank directly):

```
squareFromIndex(file, displayRank) → `${FILES[file]}${8 - displayRank}`
```

| Index | Maps to |
|-------|---------|
| `file` 0–7 | `a`–`h` |
| `displayRank` 0 | rank **8** (top of screen) |
| `displayRank` 7 | rank **1** (bottom of screen) |

`parseBoard(fen)` returns `board[displayRank][file]` — same indexing as `BoardGrid`.

`isLightSquare(file, displayRank)`: `(file + displayRank) % 2 === 0` → light. **a1** = file 0, displayRank 7 → dark.

Use `forEachDisplaySquare()` when iterating — never hardcode index-to-square math in components.

## FEN ↔ squares

FEN piece placement reads **rank 8 first**, then 7 … down to 1 — matches `displayRank` 0 → 7.

Example: `8/8/8/8/4R3/8/8/4k2K w - - 0 1` (hook puzzle)

| FEN row | Squares of interest |
|---------|---------------------|
| `4R3` (rank 4) | White rook on **e4** |
| `4k2K` (rank 1) | Black king **e1**, White king **h1** |

Read FEN with chess.js — do not hand-count squares from the string in UI code.

## Piece codes (`PieceCode`)

`${color}${type}` from `parseBoard`:

| Code | Piece |
|------|-------|
| `wp` `wn` `wb` `wr` `wq` `wk` | White pawn … king |
| `bp` `bn` `bb` `br` `bq` `bk` | Black pawn … king |

Render via `ChessPiece` — not related to square name (a piece *on* `e4` is located at square `e4`).

## Move notation (SAN)

Used in `moves[]` for story puzzles and voice pipeline:

| Form | Meaning |
|------|---------|
| `e4` | Pawn to e4 |
| `Nf3` | Knight to f3 |
| `Bxc4` | Bishop captures on c4 |
| `O-O` | Kingside castle |

**Square vs move:** training answers use **square** (`e4`) or **yes/no** — not full SAN unless the puzzle expects it. Voice match uses SAN/coordinates after normalizer.

Apply moves with chess.js: `applyMoves(fen, ['Nf3', 'd5'])` → new FEN → query `inCheck()` etc.

## User input normalization

`normalizeSquare()` in `@mindboard/chess-core`: accepts `E4`, ` e4 ` → `'e4'`. Invalid strings fail validation.

For puzzles, `expected` is always lowercase `Square`. `squaresTouched` lists every square relevant to the mental exercise (heatmap + fog).

## Heatmap & peek correlation

- `HeatmapCell.square` / `squaresTouched` — same `Square` type as board labels
- Tapping `e4` on `InteractiveHeatmap` = `e4` on `ChessBoard` = FEN square `e4`
- `PeekEvent` records `{ fen, square }` — square is where the user's mental map broke

Fog thresholds vary by **square zone** (center/edge/corner) — zone derives from the square name, not grid index.

## Common agent mistakes

| Wrong | Right |
|-------|-------|
| Treat `file` index 4 as "rank 4" | File 4 = **e-file**; rank comes from `8 - displayRank` |
| Assume row index = chess rank | Row 0 = rank 8; row 7 = rank 1 |
| Invent square from pixel/tap without `squareFromIndex` | Always derive via `boardUtils` or chess.js |
| Mix uppercase `E4` in storage | Store/compare lowercase `e4`; normalize on input |
| Place piece on `e4` in FEN but label `d4` | FEN, labels, prompts, and `expected` must agree — verify with chess.js |

## Verification habit

When adding a puzzle or board state:

1. Load FEN in chess.js
2. `chess.get('e4')` (or target square) — confirm piece/color
3. Cross-check `parseBoard` row/col via `squareFromIndex`
4. Align `prompt`, `expected`, and `squaresTouched` to the same square names
