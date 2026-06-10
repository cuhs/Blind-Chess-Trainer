import { useMemo } from 'react';
import { resolveTrainingPuzzle } from '@mindboard/chess-core';
import type { TrainingPuzzle } from '@/data/training-puzzles';

export function useResolvedPuzzle(puzzle: TrainingPuzzle | undefined) {
  return useMemo(
    () => (puzzle ? resolveTrainingPuzzle(puzzle) : undefined),
    [puzzle],
  );
}
