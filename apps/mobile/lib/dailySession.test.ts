import { describe, expect, it } from 'vitest';
import type { TrainingPuzzle } from '@/data/training-puzzles';
import {
  DAILY_SESSION_SIZE,
  hashDateKey,
  selectDailyPuzzles,
} from './dailySession';

function puzzle(id: string, source?: 'daily' | 'peek'): TrainingPuzzle {
  return {
    id,
    fen: 'start',
    moves: [],
    prompt: 'test',
    answerType: 'square',
    expected: 'e4',
    squaresTouched: ['e4'],
    source,
  };
}

describe('hashDateKey', () => {
  it('is stable for the same date', () => {
    expect(hashDateKey('2026-06-12')).toBe(hashDateKey('2026-06-12'));
  });

  it('differs across dates', () => {
    expect(hashDateKey('2026-06-12')).not.toBe(hashDateKey('2026-06-13'));
  });
});

describe('selectDailyPuzzles', () => {
  it('returns empty for empty bank', () => {
    expect(selectDailyPuzzles([], '2026-06-12')).toEqual([]);
  });

  it('returns all puzzles when bank is smaller than session size', () => {
    const bank = [puzzle('a'), puzzle('b')];
    expect(selectDailyPuzzles(bank, '2026-06-12')).toHaveLength(2);
  });

  it('caps at DAILY_SESSION_SIZE', () => {
    const bank = Array.from({ length: 7 }, (_, i) => puzzle(`p${i}`));
    expect(selectDailyPuzzles(bank, '2026-06-12')).toHaveLength(
      DAILY_SESSION_SIZE,
    );
  });

  it('is deterministic for the same date', () => {
    const bank = Array.from({ length: 7 }, (_, i) => puzzle(`p${i}`));
    const a = selectDailyPuzzles(bank, '2026-06-12');
    const b = selectDailyPuzzles(bank, '2026-06-12');
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
  });

  it('rotates selection across dates', () => {
    const bank = Array.from({ length: 7 }, (_, i) => puzzle(`p${i}`));
    const day1 = selectDailyPuzzles(bank, '2026-06-12').map((p) => p.id);
    const day2 = selectDailyPuzzles(bank, '2026-06-13').map((p) => p.id);
    expect(day1).not.toEqual(day2);
  });

  it('prioritizes peek-sourced puzzles', () => {
    const bank = [
      puzzle('daily-1'),
      puzzle('daily-2'),
      puzzle('peek-1', 'peek'),
      puzzle('daily-3'),
      puzzle('peek-2', 'peek'),
    ];
    const session = selectDailyPuzzles(bank, '2026-06-12');
    expect(session[0].id).toBe('peek-1');
    expect(session[1].id).toBe('peek-2');
    expect(session).toHaveLength(DAILY_SESSION_SIZE);
  });

  it('limits peek puzzles to session size', () => {
    const bank = [
      puzzle('peek-1', 'peek'),
      puzzle('peek-2', 'peek'),
      puzzle('peek-3', 'peek'),
      puzzle('peek-4', 'peek'),
    ];
    expect(selectDailyPuzzles(bank, '2026-06-12')).toHaveLength(
      DAILY_SESSION_SIZE,
    );
  });
});
