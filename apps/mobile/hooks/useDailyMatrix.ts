import { useDailySession } from './useDailySession';

export function useDailyMatrix() {
  const { puzzleCount, peekPuzzleCount, isCompletedToday } = useDailySession();

  const loopBadge =
    peekPuzzleCount > 0
      ? peekPuzzleCount === 1
        ? '1 position from your match peeks'
        : `${peekPuzzleCount} positions from your match peeks`
      : null;

  return { puzzleCount, loopBadge, peekPuzzleCount, isCompletedToday };
}
