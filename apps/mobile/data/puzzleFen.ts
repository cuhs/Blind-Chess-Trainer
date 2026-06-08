import { applyMoves } from '@mindboard/chess-core';
import type { OnboardingPuzzle } from './onboarding-puzzles';
import type { TrainingPuzzle } from './training-puzzles';

type PuzzleWithMoves = Pick<OnboardingPuzzle | TrainingPuzzle, 'fen' | 'moves'>;

function resolveDisplayFen(puzzle: PuzzleWithMoves): string {
  if (puzzle.moves && puzzle.moves.length > 0) {
    return applyMoves(puzzle.fen, puzzle.moves);
  }
  return puzzle.fen;
}

export function getPuzzleDisplayFen(puzzle: OnboardingPuzzle): string {
  return resolveDisplayFen(puzzle);
}

export function getTrainingDisplayFen(puzzle: TrainingPuzzle): string {
  return resolveDisplayFen(puzzle);
}
