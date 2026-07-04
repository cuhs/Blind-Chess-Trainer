import type { ReplayStep } from '@mindboard/chess-core';
import type { Square } from '@mindboard/shared';
import { weaknessSquareFromFen } from './peekPuzzles';

export function weaknessSquaresForReplayStep(step: ReplayStep): Square[] {
  const merged = new Set<Square>(step.weaknessSquares ?? []);

  if (step.kind === 'illegal_attempt') {
    const motifSquare = weaknessSquareFromFen(step.fen);
    if (motifSquare) merged.add(motifSquare);
  }

  return [...merged];
}
