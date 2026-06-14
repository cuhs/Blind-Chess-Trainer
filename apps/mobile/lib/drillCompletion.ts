import type { DrillProgress } from './drillProgress';
import { nextStreakDays } from './streak';

export interface DrillCompletionInput {
  lastActiveDate: string | null;
  streakDays: number;
  lastDrillCompletedDate: string | null;
  drillProgress: DrillProgress | null;
}

/** Atomic streak bump + daily drill gate + progress clear. */
export function applyDailyDrillCompletion(
  state: DrillCompletionInput,
  date: string,
): DrillCompletionInput {
  const streak = nextStreakDays(
    state.lastActiveDate,
    state.streakDays,
    date,
  );
  return {
    ...streak,
    lastDrillCompletedDate: date,
    drillProgress: null,
  };
}

/** Streak bump + gate only — does not clear in-progress puzzle ids. */
export function applyDrillCompletedDate(
  state: Pick<DrillCompletionInput, 'lastActiveDate' | 'streakDays'>,
  date: string,
): Pick<DrillCompletionInput, 'streakDays' | 'lastActiveDate' | 'lastDrillCompletedDate'> {
  const streak = nextStreakDays(
    state.lastActiveDate,
    state.streakDays,
    date,
  );
  return {
    ...streak,
    lastDrillCompletedDate: date,
  };
}
