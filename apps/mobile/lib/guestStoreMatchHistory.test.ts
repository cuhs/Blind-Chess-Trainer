import { describe, expect, it } from 'vitest';
import { appendMatchRecord } from '@mindboard/chess-core';
import type { MatchRecord } from '@mindboard/shared';

const START_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function sampleRecord(id: string): MatchRecord {
  return {
    id,
    startedAt: '2026-06-19T10:00:00.000Z',
    finishedAt: '2026-06-19T10:10:00.000Z',
    startFen: START_FEN,
    finalFen: START_FEN,
    playerColor: 'w',
    engineElo: 800,
    result: 'win',
    resigned: false,
    events: [],
  };
}

/** Mirrors guestStore.addMatchRecord dedupe + cap behavior. */
function persistMatchRecord(
  history: MatchRecord[],
  record: MatchRecord,
): MatchRecord[] {
  if (history.some((existing) => existing.id === record.id)) {
    return history;
  }
  return appendMatchRecord(history, record);
}

describe('offline match persistence', () => {
  it('should append a new match record for replay', () => {
    const record = sampleRecord('match-a');
    expect(persistMatchRecord([], record)).toEqual([record]);
  });

  it('should ignore duplicate match ids when finalizing twice', () => {
    const record = sampleRecord('match-a');
    const once = persistMatchRecord([], record);
    const twice = persistMatchRecord(once, record);
    expect(twice).toHaveLength(1);
  });
});
