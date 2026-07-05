import { describe, expect, it } from 'vitest';
import type { TrainingPuzzle } from '@/data/training-puzzles';
import {
  DAILY_SESSION_SIZE,
  MAX_PEEK_PUZZLES_PER_SESSION,
  hashDateKey,
  puzzlePromptCategory,
  selectDailyPuzzles,
  selectDailyGeneratedPuzzles,
  shuffleDeterministic,
} from './dailySession';

function puzzle(
  id: string,
  source?: 'daily' | 'peek',
  prompt = 'test',
): TrainingPuzzle {
  return {
    id,
    fen: 'start',
    moves: [],
    prompt,
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

describe('shuffleDeterministic', () => {
  it('is stable for the same seed', () => {
    const input = [1, 2, 3, 4, 5];
    expect(shuffleDeterministic(input, 42)).toEqual(
      shuffleDeterministic(input, 42),
    );
  });
});

describe('selectDailyPuzzles', () => {
  it('returns empty for empty bank', () => {
    const session = selectDailyPuzzles([], '2026-06-12');
    expect(session.length).toBeGreaterThan(0);
    expect(session.length).toBeLessThanOrEqual(DAILY_SESSION_SIZE);
  });

  it('fills to session size with generated puzzles when bank is small', () => {
    const bank = [puzzle('a'), puzzle('b')];
    expect(selectDailyPuzzles(bank, '2026-06-12')).toHaveLength(
      DAILY_SESSION_SIZE,
    );
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

  it('returns three generated puzzles for an empty bank', () => {
    const session = selectDailyPuzzles([], '2026-07-05');
    expect(session).toHaveLength(DAILY_SESSION_SIZE);
    expect(new Set(session.map((puzzle) => puzzle.id)).size).toBe(
      DAILY_SESSION_SIZE,
    );
    expect(session.every((puzzle) => puzzle.id.startsWith('gen-'))).toBe(true);
  });

  it('avoids reserved prompt buckets in generated-only selection', () => {
    const session = selectDailyGeneratedPuzzles(
      '2026-07-05',
      new Set(['pin']),
      2,
    );
    expect(session).toHaveLength(2);
    expect(session.every((puzzle) => !puzzle.id.includes('motif_pin'))).toBe(
      true,
    );
  });

  it('uses up to two peek puzzles and fills the rest from generated or bank', () => {
    const bank = [
      puzzle('daily-1'),
      puzzle('daily-2'),
      puzzle('daily-3'),
      puzzle('peek-1', 'peek'),
      puzzle('peek-2', 'peek'),
      puzzle('peek-3', 'peek'),
    ];
    const session = selectDailyPuzzles(bank, '2026-06-12');

    expect(session).toHaveLength(DAILY_SESSION_SIZE);
    expect(session.filter((p) => p.source === 'peek')).toHaveLength(
      MAX_PEEK_PUZZLES_PER_SESSION,
    );
    expect(session.filter((p) => p.source !== 'peek').length).toBeGreaterThan(
      0,
    );
  });

  it('uses one peek and fills remaining slots when only one peek is available', () => {
    const bank = [
      puzzle('daily-1'),
      puzzle('daily-2'),
      puzzle('daily-3'),
      puzzle('peek-1', 'peek'),
    ];
    const session = selectDailyPuzzles(bank, '2026-06-12');

    expect(session.filter((p) => p.source === 'peek')).toHaveLength(1);
    expect(session).toHaveLength(DAILY_SESSION_SIZE);
  });

  it('limits peek puzzles and fills with generated when bank is empty', () => {
    const bank = [
      puzzle('peek-1', 'peek'),
      puzzle('peek-2', 'peek'),
      puzzle('peek-3', 'peek'),
      puzzle('peek-4', 'peek'),
    ];
    const session = selectDailyPuzzles(bank, '2026-06-12');
    expect(session.filter((p) => p.source === 'peek')).toHaveLength(
      MAX_PEEK_PUZZLES_PER_SESSION,
    );
    expect(session).toHaveLength(DAILY_SESSION_SIZE);
  });

  it('spreads prompt categories when the bank has alternatives', () => {
    const bank = [
      puzzle('hang-1', undefined, 'What square is the undefended knight on?'),
      puzzle('hang-2', undefined, 'What square is the undefended rook on?'),
      puzzle('hang-3', undefined, 'What square is the undefended queen on?'),
      puzzle('pin-1', undefined, 'What square is the pinned knight on?'),
      puzzle('fork-1', undefined, 'What square is the knight fork on?'),
      puzzle('check-1', undefined, 'Is the Black King in check?'),
    ];
    const session = selectDailyPuzzles(bank, '2026-06-14');
    const categories = new Set(
      session.map((item) => puzzlePromptCategory(item.prompt)),
    );
    expect(categories.size).toBeGreaterThan(1);
  });
});
