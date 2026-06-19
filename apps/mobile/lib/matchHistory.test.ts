import { describe, expect, it } from 'vitest';
import type { MatchRecord } from '@mindboard/shared';
import {
  formatMatchDate,
  formatMatchResult,
  formatPlayerColor,
} from './matchHistory';

const record: MatchRecord = {
  id: 'match-1',
  startedAt: '2026-06-19T10:00:00.000Z',
  finishedAt: '2026-06-19T10:10:00.000Z',
  startFen: 'start',
  finalFen: 'final',
  playerColor: 'b',
  engineElo: 1200,
  result: 'loss',
  resigned: true,
  events: [],
};

describe('matchHistory formatting', () => {
  it('should format result labels for list cards', () => {
    expect(formatMatchResult(record)).toBe('Resigned');
    expect(formatPlayerColor('w')).toBe('White');
    expect(formatMatchDate('2026-06-19T10:10:00.000Z')).toContain('Jun');
  });
});
