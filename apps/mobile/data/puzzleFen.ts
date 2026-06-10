import { applyMoves } from '@mindboard/chess-core';
import type { OnboardingPuzzle } from './onboarding-puzzles';
import type { TrainingPuzzle } from './training-puzzles';

const STANDARD_START_PLACEMENT =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

/**
 * Audio (story) puzzles starting from the standard position skip the board
 * memorize step — every player knows the start. Custom positions must be
 * shown first or the narrated moves have no context.
 */
export function isStandardStartFen(fen: string): boolean {
  return fen.trim().split(/\s+/)[0] === STANDARD_START_PLACEMENT;
}

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
