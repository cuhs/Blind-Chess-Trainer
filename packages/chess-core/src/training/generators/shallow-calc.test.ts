import { describe, expect, it } from 'vitest';
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

  it('attacked-square puzzles derive answers from board state', () => {
    const afterE4 = buildShallowCalcAttackedPuzzle('0');
    expect(afterE4.expected).toBe('yes');

    const quiet = buildShallowCalcAttackedPuzzle('1');
    expect(quiet.expected).toBe('no');

    const bishopAims = buildShallowCalcAttackedPuzzle('2');
    expect(bishopAims.expected).toBe('yes');
  });

  it('piece-still-there expected answers match board state', () => {
    expect(buildShallowCalcStatePuzzle('0').expected).toBe('yes');
    expect(buildShallowCalcStatePuzzle('1').expected).toBe('yes');
    expect(buildShallowCalcStatePuzzle('2').expected).toBe('no');
  });
});
