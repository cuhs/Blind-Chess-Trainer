import { describe, expect, it } from 'vitest';
import { verifyGeneratedPuzzle } from '../verify-puzzle';
import {
  buildShallowCalcAttackedPuzzle,
  buildShallowCalcStatePuzzle,
} from './shallow-calc';

describe('shallow calc generators', () => {
  it('piece-still-there puzzles ask about piece presence, not check', () => {
    for (const seed of ['0', '1', '2']) {
      const puzzle = buildShallowCalcStatePuzzle(seed);
      expect(puzzle.prompt.toLowerCase()).not.toContain('in check');
      expect(puzzle.prompt.toLowerCase()).toMatch(/still on/);
    }
  });

  it('procedural seeds pass verification', () => {
    for (const seed of ['0', '1', '2', '77']) {
      expect(
        verifyGeneratedPuzzle(buildShallowCalcAttackedPuzzle(seed), {
          generatorId: 'shallow_calc_attacked',
        }),
      ).toEqual([]);
      expect(
        verifyGeneratedPuzzle(buildShallowCalcStatePuzzle(seed), {
          generatorId: 'shallow_calc_state',
        }),
      ).toEqual([]);
    }
  });

  it('attacked-square puzzles derive yes/no from board state', () => {
    for (const seed of ['0', '1', '2']) {
      const puzzle = buildShallowCalcAttackedPuzzle(seed);
      expect(['yes', 'no']).toContain(puzzle.expected);
    }
  });
});
