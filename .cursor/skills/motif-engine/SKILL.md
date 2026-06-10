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
import { analyzePosition } from '@mindboard/chess-core';

const motif = analyzePosition(fen, previousFen?); // Motif | null
```

Orchestrator: influence map → linear / divergent / discovered detectors → `rankMotifs` (single winner).

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

## LLM templating (`MotifResult` — adapter in `apps/api/`)

```typescript
interface MotifResult {
  motif: 'pin' | 'discovered_attack' | 'overloaded_defender';
  attacker: string;   // SAN piece ref: "Bc4"
  target: string;
  pinned_to?: string;
  square?: string;
}
```

Piece refs (`Bc4`) are **SAN notation**. Engine uses `PieceMap` — convert at the API boundary only.

## Stitch Training Frames

- `16b75139d1d14931a1d17f54ce051a0e` — Active Recall Training Phase
- `f42d4f83e10a44df8c569ed060ad83a4` — Interactive Active Recall Training

## Boundary

```
FEN → analyzePosition() → Motif | null → LLM templating → question text
```

LLM never analyzes position. `null` → skip question.

## Checklist

```
- [ ] ≥5 positive + ≥3 negative FENs per motif
- [ ] ≥90% branch coverage
- [ ] Questions match Stitch geometry style, not engine lines
```

Edge cases: [reference.md](reference.md)
