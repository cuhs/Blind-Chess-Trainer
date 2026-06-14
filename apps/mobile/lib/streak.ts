import { previousDayKey } from './dateKey';

/** Next streak after a habit day (drill cleared or match finished). */
export function nextStreakDays(
  lastActiveDate: string | null,
  currentStreak: number,
  activityDate: string,
): { streakDays: number; lastActiveDate: string } {
  if (lastActiveDate === activityDate) {
    return { streakDays: currentStreak, lastActiveDate: activityDate };
  }

  const streakDays =
    lastActiveDate === previousDayKey(activityDate)
      ? currentStreak + 1
      : 1;

  return { streakDays, lastActiveDate: activityDate };
}
