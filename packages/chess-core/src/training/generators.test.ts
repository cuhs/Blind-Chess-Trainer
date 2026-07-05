import { describe, expect, it } from 'vitest';
import { buildTrainingPuzzleSpec } from './generators';

describe('training generators', () => {
  it('builds coordinate color puzzles without board', () => {
    const puzzle = buildTrainingPuzzleSpec('coordinate_color', 'e4');
    expect(puzzle.answerType).toBe('yes-no');
    expect(puzzle.expected).toBe('yes');
    expect(puzzle.squaresTouched).toContain('e4');
    expect(puzzle.showBoard).toBe(false);
  });

  it('builds coordinate neighbor puzzles', () => {
    const puzzle = buildTrainingPuzzleSpec('coordinate_neighbor', 'e4:rank');
    expect(puzzle.expected).toBe('e5');
  });

  it('builds move update landing puzzles', () => {
    const puzzle = buildTrainingPuzzleSpec('move_update_landing', '0');
    expect(puzzle.answerType).toBe('square');
    expect(puzzle.moves).toEqual(['Nf3']);
    expect(puzzle.expected).toBe('f3');
    expect(puzzle.prompt).toBe('Where did the piece land?');
  });

  it('builds static recall puzzles', () => {
    const puzzle = buildTrainingPuzzleSpec('static_recall_2', '0:0');
    expect(puzzle.answerType).toBe('square');
    expect(puzzle.prompt).not.toContain(puzzle.expected);
  });

  it('builds chunk puzzles', () => {
    const puzzle = buildTrainingPuzzleSpec('chunk_castled', '1');
    expect(puzzle.expected).toBe('yes');
  });
});
