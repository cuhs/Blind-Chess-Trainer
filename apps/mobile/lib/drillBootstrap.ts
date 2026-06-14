import type { DrillProgress } from './drillProgress';
import {
  completedIdsForToday,
  isAllDrillPuzzlesComplete,
  resumePuzzleIndex,
} from './drillProgress';

export type DrillBootstrapResult =
  | { kind: 'skip' }
  | { kind: 'auto_complete' }
  | { kind: 'resume'; puzzleIndex: number };

export interface DrillBootstrapInput {
  today: string;
  lastDrillCompletedDate: string | null;
  drillProgress: DrillProgress | null;
  puzzles: { id: string }[];
}

export function resolveDrillBootstrap({
  today,
  lastDrillCompletedDate,
  drillProgress,
  puzzles,
}: DrillBootstrapInput): DrillBootstrapResult {
  if (lastDrillCompletedDate === today) {
    return { kind: 'skip' };
  }

  if (puzzles.length === 0) {
    return { kind: 'resume', puzzleIndex: 0 };
  }

  const completedIds = completedIdsForToday(drillProgress, today);

  if (
    isAllDrillPuzzlesComplete(puzzles, completedIds) &&
    lastDrillCompletedDate !== today
  ) {
    return { kind: 'auto_complete' };
  }

  const puzzleIndex = Math.min(
    resumePuzzleIndex(puzzles, completedIds),
    puzzles.length - 1,
  );

  return { kind: 'resume', puzzleIndex };
}
