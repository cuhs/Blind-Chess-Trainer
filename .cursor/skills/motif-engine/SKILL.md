---
name: motif-engine
description: >-
  Builds deterministic motif detection on chess.js. Training puzzles use
  Stitch Story of the Position UI but motifs come from TypeScript only.
  Use when implementing detection, tests, or puzzle generation API.
disable-model-invocation: false
---

# Motif Engine

Pure TypeScript in `packages/chess-core/src/motifs/`. No LLM calls. Powers Stitch training screens' **questions** — not their visuals.

## Public API

```typescript
import {
  analyzePosition,
  motifToResult,
  buildPuzzleFromMotif,
  resolveTrainingPuzzle,
} from '@mindboard/chess-core';

const motif = analyzePosition(fen, previousFen?); // Motif | null
const result = motif ? motifToResult(motif) : null;
const draft = motif ? buildPuzzleFromMotif(motif) : null;
const resolved = resolveTrainingPuzzle(trainingPuzzle); // mobile DailyDrill
```

Orchestrator: influence map → linear / divergent / discovered detectors → `rankMotifs` (single winner).

Forks and non-check discovered attacks filter through `isSquareTacticallyThreatened` (undefended, underdefended, or royal fork / value-winning fork). See `reference.md` § Fork Edge Cases.

## Engine output (`BaseMotif` + `PieceMap`)

```typescript
interface PieceMap {
  square: Square;
  type: PieceSymbol;
  color: Color;
}

// Example: PinMotif
{
  type: 'pin',
  fen: string,
  forcingWeight: 90,
  pinKind: 'absolute' | 'relative',
  attacker: PieceMap,
  pinnedPiece: PieceMap,
  kingBehind: PieceMap,
}
```

## Deterministic templating (`MotifResult` + `PuzzleDraft`)

Adapter: `src/motifs/adapters.ts` (`motifToResult`, `pieceToSanRef`).
Questions: `src/motifs/questions.ts` (`buildPuzzleFromMotif`).
Mobile resolve: `src/motifs/resolve-training-puzzle.ts` — engine prompt when `expected` matches; curated alternate prompts (e.g. bishop square on a pin) stay in `puzzle_bank`.

```typescript
interface MotifResult {
  motif: MotifType;
  attacker: string;   // SAN piece ref: "Bc4"
  target: string;
  pinned_to?: string;
  square?: string;
}
```

Piece refs (`Bc4`) are **SAN notation**. Engine uses `PieceMap` — convert in adapters only.

Future LLM templating may reuse `MotifResult` in `apps/api/`; chess-core stays deterministic.

## Stitch Training Frames

- `16b75139d1d14931a1d17f54ce051a0e` — Active Recall Training Phase
- `f42d4f83e10a44df8c569ed060ad83a4` — Interactive Active Recall Training

DailyDrill implements Story-of-the-Position UX (both Stitch training frames). No separate `StoryPuzzle` route — see `training-flow` skill.

## Boundary

```
FEN → analyzePosition() → Motif | null → buildPuzzleFromMotif() → question text
```

LLM never analyzes position. `null` → use static `puzzle_bank` prompt.

## Seed validation

Fixtures: `src/motifs/fixtures/puzzle-bank-fixtures.json`.
Run: `cd packages/chess-core && npm run validate:puzzles`.

## Checklist

```
- [x] ≥5 positive + ≥3 negative FENs per motif
- [x] Adapter + deterministic question builder
- [ ] ≥90% branch coverage (run test:coverage)
- [x] Questions match Stitch geometry style, not engine lines
```

Edge cases: [reference.md](reference.md)
