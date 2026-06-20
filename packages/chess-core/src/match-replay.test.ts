import { describe, expect, it } from 'vitest';
import type { MatchRecord } from '@mindboard/shared';
import {
  buildMatchReplaySteps,
  buildMoveReplayData,
  countMatchMoves,
  countMatchPeeks,
  findMatchRecord,
  sortMatchHistoryNewestFirst,
} from './match-replay';

const START_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function sampleRecord(overrides: Partial<MatchRecord> = {}): MatchRecord {
  return {
    id: 'match-1',
    startedAt: '2026-06-19T10:00:00.000Z',
    finishedAt: '2026-06-19T10:10:00.000Z',
    startFen: START_FEN,
    finalFen: START_FEN,
    playerColor: 'w',
    engineElo: 800,
    result: 'win',
    resigned: false,
    events: [],
    ...overrides,
  };
}

describe('match replay helpers', () => {
  it('should build a replay timeline from match events', () => {
    const record = sampleRecord({
      events: [
        {
          kind: 'move',
          ply: 1,
          color: 'w',
          san: 'e4',
          fenAfter: 'after-e4',
          timestamp: 't1',
        },
        {
          kind: 'peek',
          fen: 'after-e4',
          square: 'e4',
          timestamp: 't2',
        },
        {
          kind: 'illegal_attempt',
          input: 'Qh9',
          reason: 'Illegal move',
          fen: 'after-e4',
          timestamp: 't3',
        },
        {
          kind: 'resign',
          fen: 'after-e4',
          timestamp: 't4',
        },
      ],
    });

    const steps = buildMatchReplaySteps(record);

    expect(steps.map((step) => step.kind)).toEqual([
      'start',
      'move',
      'peek',
      'illegal_attempt',
      'resign',
    ]);
    expect(steps[0]?.fen).toBe(START_FEN);
    expect(steps[1]?.fen).toBe('after-e4');
    expect(steps[2]?.title).toBe('Peek e4');
    expect(steps[3]?.title).toBe('Illegal: Qh9');
  });

  it('should find a record by id and sort history newest first', () => {
    const older = sampleRecord({
      id: 'older',
      finishedAt: '2026-06-18T10:00:00.000Z',
    });
    const newer = sampleRecord({
      id: 'newer',
      finishedAt: '2026-06-19T12:00:00.000Z',
    });

    expect(findMatchRecord([older, newer], 'newer')).toEqual(newer);
    expect(sortMatchHistoryNewestFirst([older, newer]).map((r) => r.id)).toEqual([
      'newer',
      'older',
    ]);
  });

  it('should count moves and peeks for list summaries', () => {
    const record = sampleRecord({
      events: [
        {
          kind: 'move',
          ply: 1,
          color: 'w',
          san: 'e4',
          fenAfter: 'after-e4',
          timestamp: 't1',
        },
        { kind: 'peek', fen: START_FEN, square: 'd4', timestamp: 't2' },
        { kind: 'peek', fen: START_FEN, square: 'e4', timestamp: 't3' },
      ],
    });

    expect(countMatchMoves(record)).toBe(1);
    expect(countMatchPeeks(record)).toBe(2);
  });

  it('should build move-centric replay positions and flag peek/illegal turns', () => {
    const record = sampleRecord({
      events: [
        {
          kind: 'move',
          ply: 1,
          color: 'w',
          san: 'e4',
          fenAfter: 'after-e4',
          timestamp: 't1',
        },
        {
          kind: 'peek',
          fen: 'after-e4',
          square: 'e4',
          timestamp: 't2',
        },
        {
          kind: 'illegal_attempt',
          input: 'Qh9',
          reason: 'Illegal move',
          fen: 'after-e4',
          timestamp: 't3',
        },
        {
          kind: 'move',
          ply: 2,
          color: 'b',
          san: 'e5',
          fenAfter: 'after-e5',
          timestamp: 't4',
        },
      ],
    });

    const replay = buildMoveReplayData(record);

    expect(replay.positions.map((position) => position.fen)).toEqual([
      START_FEN,
      'after-e4',
      'after-e5',
    ]);
    expect(replay.moves).toEqual([
      {
        moveNumber: 1,
        ply: 1,
        san: 'e4',
        positionIndex: 1,
        flagged: false,
      },
      {
        moveNumber: 2,
        ply: 2,
        san: 'e5',
        positionIndex: 2,
        flagged: true,
        turnFlags: { hadPeek: true, hadIllegal: true },
      },
    ]);
  });
});
