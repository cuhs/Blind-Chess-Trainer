import { describe, expect, it } from 'vitest';
import { validateCurriculumPuzzles } from '../validate-curriculum-puzzles';
import {
  buildStaticRecall2Puzzle,
  buildStaticRecall4Puzzle,
  buildStaticRecall6Puzzle,
  countPiecesOnBoard,
} from './static-recall';

function promptLeaksAnswer(prompt: string, expected: string): boolean {
  return prompt.toLowerCase().includes(expected.toLowerCase());
}

describe('static recall generators', () => {
  it('simple endgame fixtures have three pieces', () => {
    for (const seed of ['0:0', '0:1', '1:0']) {
      const puzzle = buildStaticRecall2Puzzle(seed);
      expect(countPiecesOnBoard(puzzle.fen)).toBe(3);
    }
  });

  it('four-piece fixtures have exactly four pieces', () => {
    for (const seed of ['0:0', '0:1', '0:2']) {
      const puzzle = buildStaticRecall4Puzzle(seed);
      expect(countPiecesOnBoard(puzzle.fen)).toBe(4);
    }
  });

  it('six-piece fixtures have exactly six pieces', () => {
    for (const seed of ['0:0', '0:1', '0:2']) {
      const puzzle = buildStaticRecall6Puzzle(seed);
      expect(countPiecesOnBoard(puzzle.fen)).toBe(6);
    }
  });

  it('every static-recall answer matches a piece on the board', () => {
    const seeds = [
      ...['0:0', '0:1', '1:0'].map((s) => ['static_recall_2', s] as const),
      ...['0:0', '0:1', '0:2'].map((s) => ['static_recall_4', s] as const),
      ...['0:0', '0:1', '0:2'].map((s) => ['static_recall_6', s] as const),
    ];
    for (const [kind, seed] of seeds) {
      const puzzle =
        kind === 'static_recall_2'
          ? buildStaticRecall2Puzzle(seed)
          : kind === 'static_recall_4'
            ? buildStaticRecall4Puzzle(seed)
            : buildStaticRecall6Puzzle(seed);
      const issues = validateCurriculumPuzzles().filter(
        (issue) => issue.puzzleRef === `${kind}/${seed}`,
      );
      expect(issues).toEqual([]);
      expect(puzzle.expected).toMatch(/^[a-h][1-8]$/);
    }
  });
});
