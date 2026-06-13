import { describe, expect, it } from 'vitest';
import {
  completedIdsForToday,
  isAllDrillPuzzlesComplete,
  resumePuzzleIndex,
} from './drillProgress';

const PUZZLES = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('completedIdsForToday', () => {
  it('returns empty when progress is null', () => {
    expect(completedIdsForToday(null, '2026-06-13')).toEqual([]);
  });

  it('returns empty when dateKey does not match', () => {
    expect(
      completedIdsForToday(
        { dateKey: '2026-06-12', completedPuzzleIds: ['a'] },
        '2026-06-13',
      ),
    ).toEqual([]);
  });

  it('returns ids for matching dateKey', () => {
    expect(
      completedIdsForToday(
        { dateKey: '2026-06-13', completedPuzzleIds: ['a', 'b'] },
        '2026-06-13',
      ),
    ).toEqual(['a', 'b']);
  });
});

describe('resumePuzzleIndex', () => {
  it('starts at 0 with no progress', () => {
    expect(resumePuzzleIndex(PUZZLES, [])).toBe(0);
  });

  it('skips completed puzzles', () => {
    expect(resumePuzzleIndex(PUZZLES, ['a', 'b'])).toBe(2);
  });

  it('returns puzzle count when all are complete', () => {
    expect(resumePuzzleIndex(PUZZLES, ['a', 'b', 'c'])).toBe(3);
  });
});

describe('isAllDrillPuzzlesComplete', () => {
  it('is false with partial progress', () => {
    expect(isAllDrillPuzzlesComplete(PUZZLES, ['a'])).toBe(false);
  });

  it('is true when every puzzle id is completed', () => {
    expect(isAllDrillPuzzlesComplete(PUZZLES, ['a', 'b', 'c'])).toBe(true);
  });
});
