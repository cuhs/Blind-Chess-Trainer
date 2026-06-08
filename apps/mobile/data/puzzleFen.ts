import { applyMoves } from '@mindboard/chess-core';
import type { OnboardingPuzzle } from './onboarding-puzzles';

export function getPuzzleDisplayFen(puzzle: OnboardingPuzzle): string {
  if (puzzle.moves && puzzle.moves.length > 0) {
    return applyMoves(puzzle.fen, puzzle.moves);
  }
  return puzzle.fen;
}
