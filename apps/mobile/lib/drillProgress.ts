export interface DrillProgress {
  dateKey: string;
  completedPuzzleIds: string[];
}

export function completedIdsForToday(
  progress: DrillProgress | null,
  today: string,
): string[] {
  if (!progress || progress.dateKey !== today) return [];
  return progress.completedPuzzleIds;
}

/** Index of the next unsolved puzzle; equals puzzle count when all are done. */
export function resumePuzzleIndex(
  puzzles: { id: string }[],
  completedIds: string[],
): number {
  if (puzzles.length === 0) return 0;
  const idx = puzzles.findIndex((puzzle) => !completedIds.includes(puzzle.id));
  return idx === -1 ? puzzles.length : idx;
}

export function isAllDrillPuzzlesComplete(
  puzzles: { id: string }[],
  completedIds: string[],
): boolean {
  return (
    puzzles.length > 0 &&
    puzzles.every((puzzle) => completedIds.includes(puzzle.id))
  );
}
