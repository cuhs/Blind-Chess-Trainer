import { describe, expect, it } from 'vitest';
import { nextStreakDays } from './streak';

describe('nextStreakDays', () => {
  it('extends the streak when activity is the day after last active', () => {
    expect(nextStreakDays('2026-06-13', 4, '2026-06-14')).toEqual({
      streakDays: 5,
      lastActiveDate: '2026-06-14',
    });
  });

  it('restarts at 1 after a gap', () => {
    expect(nextStreakDays('2026-06-10', 7, '2026-06-14')).toEqual({
      streakDays: 1,
      lastActiveDate: '2026-06-14',
    });
  });

  it('starts at 1 on first activity', () => {
    expect(nextStreakDays(null, 0, '2026-06-14')).toEqual({
      streakDays: 1,
      lastActiveDate: '2026-06-14',
    });
  });

  it('is idempotent for the same calendar day', () => {
    expect(nextStreakDays('2026-06-14', 3, '2026-06-14')).toEqual({
      streakDays: 3,
      lastActiveDate: '2026-06-14',
    });
  });
});
