import { describe, expect, it } from 'vitest';
import {
  appendMatchRecord,
  createMatchRecorder,
  MAX_MATCH_HISTORY,
  type MatchRecorder,
} from './match-recorder';
import type { MatchRecord } from '@mindboard/shared';

const START_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function makeRecorder(overrides: Partial<Parameters<typeof createMatchRecorder>[0]> = {}) {
  return createMatchRecorder({
    id: 'match-1',
    startedAt: '2026-06-19T10:00:00.000Z',
    startFen: START_FEN,
    playerColor: 'w',
    engineElo: 800,
    ...overrides,
  });
}

function sampleRecord(id: string): MatchRecord {
  return {
    id,
    startedAt: '2026-06-19T10:00:00.000Z',
    finishedAt: '2026-06-19T10:10:00.000Z',
    startFen: START_FEN,
    finalFen: START_FEN,
    playerColor: 'w',
    engineElo: 800,
    result: 'loss',
    resigned: false,
    events: [],
  };
}

function finalize(
  recorder: MatchRecorder,
  overrides: Partial<{
    result: 'win' | 'loss' | 'draw';
    resigned: boolean;
    finalFen: string;
    finishedAt: string;
  }> = {},
) {
  return recorder.finalize({
    result: 'win',
    resigned: false,
    finalFen: START_FEN,
    finishedAt: '2026-06-19T10:10:00.000Z',
    ...overrides,
  });
}

describe('MatchRecorder', () => {
  it('records moves with monotonic ply numbers', () => {
    const recorder = makeRecorder();
    recorder.recordMove('e4', 'w', 'fen-after-e4', '2026-06-19T10:01:00.000Z');
    recorder.recordMove('e5', 'b', 'fen-after-e5', '2026-06-19T10:01:05.000Z');

    expect(recorder.getEvents()).toEqual([
      {
        kind: 'move',
        ply: 1,
        color: 'w',
        san: 'e4',
        fenAfter: 'fen-after-e4',
        timestamp: '2026-06-19T10:01:00.000Z',
      },
      {
        kind: 'move',
        ply: 2,
        color: 'b',
        san: 'e5',
        fenAfter: 'fen-after-e5',
        timestamp: '2026-06-19T10:01:05.000Z',
      },
    ]);
  });

  it('records peeks, illegal attempts, and disambiguation', () => {
    const recorder = makeRecorder();
    recorder.recordPeek(START_FEN, 'e4', '2026-06-19T10:00:30.000Z');
    recorder.recordIllegalAttempt(
      'Qh9',
      'Illegal move',
      START_FEN,
      '2026-06-19T10:00:45.000Z',
    );
    recorder.recordDisambiguation(
      'Nd2',
      'Which knight?',
      [
        { san: 'Nbd2', label: 'b-file knight' },
        { san: 'Nfd2', label: 'f-file knight' },
      ],
      START_FEN,
      '2026-06-19T10:00:50.000Z',
    );
    recorder.recordDisambiguationCancelled(
      START_FEN,
      '2026-06-19T10:00:55.000Z',
    );

    const kinds = recorder.getEvents().map((event) => event.kind);
    expect(kinds).toEqual([
      'peek',
      'illegal_attempt',
      'disambiguation',
      'disambiguation_cancelled',
    ]);
  });

  it('records resign before finalize', () => {
    const recorder = makeRecorder();
    recorder.recordResign(START_FEN, '2026-06-19T10:05:00.000Z');
    const record = finalize(recorder, { result: 'loss', resigned: true });

    expect(record.resigned).toBe(true);
    expect(record.result).toBe('loss');
    expect(record.events.at(-1)).toEqual({
      kind: 'resign',
      fen: START_FEN,
      timestamp: '2026-06-19T10:05:00.000Z',
    });
  });

  it('finalizes into an immutable snapshot', () => {
    const recorder = makeRecorder();
    recorder.recordMove('e4', 'w', 'fen-after-e4', '2026-06-19T10:01:00.000Z');
    const record = finalize(recorder);

    expect(record).toMatchObject({
      id: 'match-1',
      startedAt: '2026-06-19T10:00:00.000Z',
      finishedAt: '2026-06-19T10:10:00.000Z',
      startFen: START_FEN,
      finalFen: START_FEN,
      playerColor: 'w',
      engineElo: 800,
      result: 'win',
      resigned: false,
    });
    expect(record.events).toHaveLength(1);

    expect(() =>
      recorder.recordPeek(START_FEN, 'd4', '2026-06-19T10:11:00.000Z'),
    ).toThrow('Cannot record events after match is finalized');
  });

  it('returns the same record when finalize is called twice', () => {
    const recorder = makeRecorder();
    const first = finalize(recorder);
    const second = finalize(recorder);
    expect(second).toBe(first);
  });

  it('preserves event order for a full mini-game log', () => {
    const recorder = makeRecorder({ playerColor: 'b' });
    recorder.recordMove('e4', 'w', 'after-e4', 't1');
    recorder.recordPeek('after-e4', 'e4', 't2');
    recorder.recordIllegalAttempt('Nf9', 'Illegal move', 'after-e4', 't3');
    recorder.recordDisambiguation(
      'Nd2',
      'Which knight?',
      [{ san: 'Nbd2', label: 'b-file' }],
      'after-e4',
      't4',
    );
    recorder.recordMove('Nf6', 'b', 'after-nf6', 't5');
    recorder.recordMove('d4', 'w', 'after-d4', 't6');

    const record = finalize(recorder, {
      result: 'draw',
      finalFen: 'after-d4',
    });

    expect(record.events.map((event) => event.kind)).toEqual([
      'move',
      'peek',
      'illegal_attempt',
      'disambiguation',
      'move',
      'move',
    ]);
    expect(record.finalFen).toBe('after-d4');
    expect(record.result).toBe('draw');
  });
});

describe('appendMatchRecord', () => {
  it('appends and caps history at MAX_MATCH_HISTORY', () => {
    const history = Array.from({ length: MAX_MATCH_HISTORY }, (_, index) =>
      sampleRecord(`old-${index}`),
    );
    const next = appendMatchRecord(history, sampleRecord('new'));

    expect(next).toHaveLength(MAX_MATCH_HISTORY);
    expect(next[0]?.id).toBe('old-1');
    expect(next.at(-1)?.id).toBe('new');
  });

  it('keeps short history unchanged except for the new tail', () => {
    const history = [sampleRecord('a'), sampleRecord('b')];
    const next = appendMatchRecord(history, sampleRecord('c'));
    expect(next.map((record) => record.id)).toEqual(['a', 'b', 'c']);
  });
});
