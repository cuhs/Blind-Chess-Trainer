import { describe, expect, it } from 'vitest';
import {
  buildMoveUpdateCapturePuzzle,
  buildMoveUpdateLandingPuzzle,
  buildMoveUpdateVacatedPuzzle,
} from './move-update';

describe('move update generators', () => {
  it('uses spoiler-free narration scripts', () => {
    const landing = buildMoveUpdateLandingPuzzle('0');
    expect(landing.narrationScript).toBe('White develops the kingside knight.');
    expect(landing.narrationScript?.toLowerCase()).not.toContain('f3');

    const capture = buildMoveUpdateCapturePuzzle('1');
    expect(capture.narrationScript?.toLowerCase()).not.toContain('takes');
    expect(capture.narrationScript?.toLowerCase()).not.toContain('capture');
  });

  it('prompts do not leak departure or landing squares', () => {
    for (const seed of ['0', '1', '2']) {
      const landing = buildMoveUpdateLandingPuzzle(seed);
      const vacated = buildMoveUpdateVacatedPuzzle(seed);
      expect(landing.prompt.toLowerCase()).not.toContain(landing.expected);
      expect(vacated.prompt.toLowerCase()).not.toContain(vacated.expected);
      expect(vacated.prompt.toLowerCase()).not.toContain('g1');
    }
  });

  it('capture puzzles have yes or no answers', () => {
    for (const seed of ['0', '1', '2']) {
      const puzzle = buildMoveUpdateCapturePuzzle(seed);
      expect(['yes', 'no']).toContain(puzzle.expected);
    }
  });
});
