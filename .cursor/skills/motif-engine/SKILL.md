---
name: motif-engine
description: >-
  Builds deterministic motif detection on chess.js. Training puzzles use
  Stitch Story of the Position UI but motifs come from TypeScript only.
  Use when implementing detection, tests, or puzzle generation API.
disable-model-invocation: false
---

# Motif Engine

Pure TypeScript. No LLM calls. Powers Stitch training screens' **questions** — not their visuals.

## Stitch Training Frames

- `16b75139d1d14931a1d17f54ce051a0e` — Active Recall Training Phase
- `f42d4f83e10a44df8c569ed060ad83a4` — Interactive Active Recall Training

Example Stitch question: "What piece is now pinned to the Black King?"
Mascot tip: "Look at the long diagonal from a4!"

## Schema

```typescript
interface MotifResult {
  motif: 'pin' | 'discovered_attack' | 'overloaded_defender';
  attacker: string;   // SAN piece ref: "Bc4" (piece on a square, not the square name)
  target: string;
  pinned_to?: string;
  square?: string;    // overloaded defender square: "f6"
}
```

Piece refs (`Bc4`) are **SAN notation** — bishop on c4. Square names (`e4`) are **locations**. See `chess-ui/notation.md`.

## Boundary

```
FEN → detectMotifs() → MotifResult[] → LLM templating → question text
```

LLM never analyzes position. Empty motifs → skip question.

## Checklist

```
- [ ] ≥5 positive + ≥3 negative FENs per motif
- [ ] ≥90% branch coverage
- [ ] Questions match Stitch geometry style, not engine lines
```

Edge cases: [reference.md](reference.md)
