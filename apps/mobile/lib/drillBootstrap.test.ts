import { describe, expect, it } from 'vitest';
import { resolveDrillBootstrap } from './drillBootstrap';

const PUZZLES = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
const TODAY = '2026-06-14';

describe('resolveDrillBootstrap', () => {
  it('resumes at index 0 for a fresh session', () => {
    expect(
      resolveDrillBootstrap({
        today: TODAY,
        lastDrillCompletedDate: null,
        drillProgress: null,
        puzzles: PUZZLES,
      }),
    ).toEqual({ kind: 'resume', puzzleIndex: 0 });
  });

  it('resumes after partial progress', () => {
    expect(
      resolveDrillBootstrap({
        today: TODAY,
        lastDrillCompletedDate: null,
        drillProgress: {
          dateKey: TODAY,
          completedPuzzleIds: ['a'],
        },
        puzzles: PUZZLES,
      }),
    ).toEqual({ kind: 'resume', puzzleIndex: 1 });
  });

  it('auto-completes when every puzzle is done but the gate is unset', () => {
    expect(
      resolveDrillBootstrap({
        today: TODAY,
        lastDrillCompletedDate: null,
        drillProgress: {
          dateKey: TODAY,
          completedPuzzleIds: ['a', 'b', 'c'],
        },
        puzzles: PUZZLES,
      }),
    ).toEqual({ kind: 'auto_complete' });
  });

  it('skips when the drill was already completed today', () => {
    expect(
      resolveDrillBootstrap({
        today: TODAY,
        lastDrillCompletedDate: TODAY,
        drillProgress: null,
        puzzles: PUZZLES,
      }),
    ).toEqual({ kind: 'skip' });
  });

  it('ignores stale progress from a previous day', () => {
    expect(
      resolveDrillBootstrap({
        today: TODAY,
        lastDrillCompletedDate: null,
        drillProgress: {
          dateKey: '2026-06-13',
          completedPuzzleIds: ['a', 'b'],
        },
        puzzles: PUZZLES,
      }),
    ).toEqual({ kind: 'resume', puzzleIndex: 0 });
  });
});
