import { describe, expect, it } from 'vitest';
import { mapPuzzleBankRow, type PuzzleBankRow } from './puzzleBank';

function row(overrides: Partial<PuzzleBankRow>): PuzzleBankRow {
  return {
    slug: 'drill-test',
    fen: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
    nlp_prompt: 'Test prompt',
    input_placeholder: null,
    subtitle: null,
    answer_type: 'square',
    expected_answer: 'e4',
    answer_square: 'e4',
    moves: [],
    squares_touched: ['e4', 'e1'],
    source: 'daily',
    ...overrides,
  };
}

describe('mapPuzzleBankRow', () => {
  it('maps square puzzles with squares_touched', () => {
    const puzzle = mapPuzzleBankRow(row({}));
    expect(puzzle?.squaresTouched).toEqual(['e4', 'e1']);
  });

  it('falls back to answer_square for yes-no rows with empty squares_touched', () => {
    const puzzle = mapPuzzleBankRow(
      row({
        slug: 'drill-story-memorize-check',
        answer_type: 'yes-no',
        expected_answer: 'yes',
        answer_square: 'e8',
        squares_touched: [],
        moves: ['Re7+'],
      }),
    );
    expect(puzzle).toMatchObject({
      id: 'drill-story-memorize-check',
      answerType: 'yes-no',
      expected: 'yes',
      squaresTouched: ['e8'],
    });
  });

  it('returns null when no heatmap squares are available', () => {
    expect(
      mapPuzzleBankRow(
        row({ squares_touched: [], answer_square: null }),
      ),
    ).toBeNull();
  });
});
