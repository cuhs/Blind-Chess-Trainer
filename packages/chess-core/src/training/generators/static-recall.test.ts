import { describe, expect, it } from 'vitest';
import { verifyGeneratedPuzzle } from '../verify-puzzle';
import {
  buildStaticRecall2Puzzle,
  buildStaticRecall4Puzzle,
  buildStaticRecall6Puzzle,
  countPiecesOnBoard,
} from './static-recall';

describe('static recall generators', () => {
  it('simple endgame fixtures have three pieces', () => {
    for (const seed of ['0', '1', '2', '0:0', 'seed-a']) {
      const puzzle = buildStaticRecall2Puzzle(seed);
      expect(countPiecesOnBoard(puzzle.fen)).toBe(3);
    }
  });

  it('four-piece fixtures have exactly four pieces', () => {
    for (const seed of ['0', '1', '2']) {
      const puzzle = buildStaticRecall4Puzzle(seed);
      expect(countPiecesOnBoard(puzzle.fen)).toBe(4);
    }
  });

  it('six-piece fixtures have exactly six pieces', () => {
    for (const seed of ['0', '1', '2']) {
      const puzzle = buildStaticRecall6Puzzle(seed);
      expect(countPiecesOnBoard(puzzle.fen)).toBe(6);
    }
  });

  it('every static-recall answer passes verification', () => {
    const seeds = [
      ...['0', '1', '2'].map((s) => ['static_recall_2', s] as const),
      ...['0', '1', '2'].map((s) => ['static_recall_4', s] as const),
      ...['0', '1', '2'].map((s) => ['static_recall_6', s] as const),
    ];
    for (const [kind, seed] of seeds) {
      const puzzle =
        kind === 'static_recall_2'
          ? buildStaticRecall2Puzzle(seed)
          : kind === 'static_recall_4'
            ? buildStaticRecall4Puzzle(seed)
            : buildStaticRecall6Puzzle(seed);
      expect(verifyGeneratedPuzzle(puzzle, { generatorId: kind })).toEqual([]);
      expect(puzzle.expected).toMatch(/^[a-h][1-8]$/);
    }
  });
});
