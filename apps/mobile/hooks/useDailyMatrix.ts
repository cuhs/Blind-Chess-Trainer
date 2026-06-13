import { useDailySession } from './useDailySession';

export function useDailyMatrix() {
  const { puzzleCount, peekPuzzleCount, isCompletedToday } = useDailySession();

  const loopBadge =
    peekPuzzleCount > 0 ? 'Includes puzzles from your matches' : null;

  return { puzzleCount, loopBadge, isCompletedToday };
}
