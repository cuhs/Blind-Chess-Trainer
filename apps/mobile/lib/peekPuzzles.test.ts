import { describe, expect, it } from 'vitest';
import type { PeekEvent } from '@mindboard/shared';
import { todayKey, yesterdayKey } from './dateKey';
import {
  peekEventDateKey,
  peekEventsForTodayDrill,
  trainingPuzzlesFromPeekEvents,
  weaknessSquareFromFen,
} from './peekPuzzles';
import { selectDailyPuzzles } from './dailySession';

const PIN_FEN = '8/8/4k3/3n4/2B5/8/8/4K3 w - - 0 1';

function peekEvent(timestamp: string): PeekEvent {
  return {
    fen: PIN_FEN,
    square: 'd5',
    timestamp,
  };
}

describe('peekEventDateKey', () => {
  it('uses local calendar day from ISO timestamp', () => {
    expect(peekEventDateKey('2026-06-12T18:30:00.000Z')).toBe(
      peekEventDateKey(new Date(2026, 5, 12, 12, 0, 0).toISOString()),
    );
  });
});

describe('peekEventsForTodayDrill', () => {
  it('prefers yesterday peeks over today', () => {
    const events = [
      peekEvent(`${todayKey()}T12:00:00.000Z`),
      peekEvent(`${yesterdayKey()}T12:00:00.000Z`),
    ];
    const selected = peekEventsForTodayDrill(events);
    expect(selected).toHaveLength(1);
    expect(peekEventDateKey(selected[0].timestamp)).toBe(yesterdayKey());
  });

  it('falls back to today when yesterday is empty', () => {
    const events = [peekEvent(`${todayKey()}T12:00:00.000Z`)];
    expect(peekEventsForTodayDrill(events)).toHaveLength(1);
  });
});

describe('weaknessSquareFromFen', () => {
  it('returns motif answer square for tactical positions', () => {
    expect(weaknessSquareFromFen(PIN_FEN)).toBe('d5');
  });
});

describe('trainingPuzzlesFromPeekEvents', () => {
  it('builds peek-sourced puzzles from match FENs', () => {
    const puzzles = trainingPuzzlesFromPeekEvents([
      peekEvent(`${todayKey()}T12:00:00.000Z`),
    ]);
    expect(puzzles).toHaveLength(1);
    expect(puzzles[0].source).toBe('peek');
    expect(puzzles[0].expected).toBe('d5');
    expect(puzzles[0].subtitle).toBe('From your blindfold match');
  });

  it('dedupes repeated peeks on the same FEN', () => {
    const puzzles = trainingPuzzlesFromPeekEvents([
      peekEvent(`${todayKey()}T12:00:00.000Z`),
      peekEvent(`${todayKey()}T12:05:00.000Z`),
    ]);
    expect(puzzles).toHaveLength(1);
  });

  it('dedupes repeated peeks on the same position with different move counters', () => {
    const puzzles = trainingPuzzlesFromPeekEvents([
      {
        fen: `${PIN_FEN.split(' ').slice(0, 4).join(' ')} 0 1`,
        square: 'd5',
        timestamp: `${todayKey()}T12:00:00.000Z`,
      },
      {
        fen: `${PIN_FEN.split(' ').slice(0, 4).join(' ')} 5 12`,
        square: 'd5',
        timestamp: `${todayKey()}T12:05:00.000Z`,
      },
    ]);
    expect(puzzles).toHaveLength(1);
  });
});

describe('peek puzzle daily integration', () => {
  it('mixes peek puzzles with bank puzzles in the daily session', () => {
    const peekPuzzles = trainingPuzzlesFromPeekEvents([
      peekEvent(`${todayKey()}T12:00:00.000Z`),
    ]);
    const bank = [
      {
        id: 'daily-1',
        fen: 'start',
        moves: [],
        prompt: 'daily',
        answerType: 'square' as const,
        expected: 'e4',
        squaresTouched: ['e4' as const],
        source: 'daily' as const,
      },
      {
        id: 'daily-2',
        fen: 'start',
        moves: [],
        prompt: 'daily',
        answerType: 'square' as const,
        expected: 'e4',
        squaresTouched: ['e4' as const],
        source: 'daily' as const,
      },
    ];

    const session = selectDailyPuzzles(
      [...peekPuzzles, ...bank],
      todayKey(),
    );
    expect(session.some((puzzle) => puzzle.source === 'peek')).toBe(true);
    expect(session.some((puzzle) => puzzle.source === 'daily')).toBe(true);
  });
});
