import type { TrainingPuzzle } from '@/data/training-puzzles';

export const DAILY_SESSION_SIZE = 3;

/** Deterministic hash for rotating daily puzzle selection by calendar day. */
export function hashDateKey(dateKey: string): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Pick up to 3 puzzles for a calendar day: peek-sourced first, then a
 * deterministic rotation through daily puzzles.
 */
export function selectDailyPuzzles(
  all: TrainingPuzzle[],
  dateKey: string,
): TrainingPuzzle[] {
  if (all.length === 0) return [];

  const peek = all.filter((p) => p.source === 'peek');
  const daily = all
    .filter((p) => p.source !== 'peek')
    .sort((a, b) => a.id.localeCompare(b.id));

  const session: TrainingPuzzle[] = peek.slice(0, DAILY_SESSION_SIZE);

  if (daily.length === 0) {
    return session.slice(0, DAILY_SESSION_SIZE);
  }

  const start = hashDateKey(dateKey) % daily.length;
  let i = 0;
  while (session.length < DAILY_SESSION_SIZE && i < daily.length) {
    session.push(daily[(start + i) % daily.length]);
    i++;
  }

  return session.slice(0, DAILY_SESSION_SIZE);
}
