import { describe, expect, it } from 'vitest';
import {
  applyDailyDrillCompletion,
  applyDrillCompletedDate,
} from './drillCompletion';

describe('applyDailyDrillCompletion', () => {
  it('bumps streak, sets gate date, and clears drill progress in one transition', () => {
    const result = applyDailyDrillCompletion(
      {
        lastActiveDate: '2026-06-13',
        streakDays: 4,
        lastDrillCompletedDate: null,
        drillProgress: {
          dateKey: '2026-06-14',
          completedPuzzleIds: ['a', 'b', 'c'],
        },
      },
      '2026-06-14',
    );

    expect(result).toEqual({
      streakDays: 5,
      lastActiveDate: '2026-06-14',
      lastDrillCompletedDate: '2026-06-14',
      drillProgress: null,
    });
  });

  it('is idempotent for streak when date already recorded', () => {
    const result = applyDailyDrillCompletion(
      {
        lastActiveDate: '2026-06-14',
        streakDays: 3,
        lastDrillCompletedDate: null,
        drillProgress: { dateKey: '2026-06-14', completedPuzzleIds: ['a'] },
      },
      '2026-06-14',
    );

    expect(result.streakDays).toBe(3);
    expect(result.lastActiveDate).toBe('2026-06-14');
    expect(result.drillProgress).toBeNull();
  });
});

describe('applyDrillCompletedDate', () => {
  it('bumps streak and sets gate without clearing progress', () => {
    const progress = {
      dateKey: '2026-06-14',
      completedPuzzleIds: ['a'],
    };
    const result = applyDrillCompletedDate(
      { lastActiveDate: '2026-06-13', streakDays: 2 },
      '2026-06-14',
    );

    expect(result).toEqual({
      streakDays: 3,
      lastActiveDate: '2026-06-14',
      lastDrillCompletedDate: '2026-06-14',
    });
    expect(progress.completedPuzzleIds).toEqual(['a']);
  });
});
