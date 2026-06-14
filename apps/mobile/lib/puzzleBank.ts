import type { TrainingPuzzle } from '@/data/training-puzzles';
import { isSquare, type AnswerType, type Square } from '@mindboard/shared';

export interface PuzzleBankRow {
  slug: string;
  fen: string;
  nlp_prompt: string;
  input_placeholder: string | null;
  subtitle: string | null;
  answer_type: string;
  expected_answer: string;
  answer_square: string | null;
  moves: unknown;
  squares_touched: unknown;
  source: string;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function toAnswerType(value: string): AnswerType {
  return value === 'yes-no' ? 'yes-no' : 'square';
}

function toSource(value: string): TrainingPuzzle['source'] {
  return value === 'peek' ? 'peek' : 'daily';
}

function toSquares(value: unknown): Square[] {
  return toStringArray(value).filter(isSquare);
}

export function mapPuzzleBankRow(row: PuzzleBankRow): TrainingPuzzle | null {
  const squaresTouched = toSquares(row.squares_touched);
  const heatmapSquares =
    squaresTouched.length > 0
      ? squaresTouched
      : row.answer_square && isSquare(row.answer_square)
        ? [row.answer_square]
        : [];
  if (heatmapSquares.length === 0) return null;

  return {
    id: row.slug,
    fen: row.fen,
    moves: toStringArray(row.moves),
    prompt: row.nlp_prompt,
    inputPlaceholder: row.input_placeholder ?? undefined,
    subtitle: row.subtitle ?? undefined,
    answerType: toAnswerType(row.answer_type),
    expected: row.expected_answer,
    squaresTouched: heatmapSquares,
    source: toSource(row.source),
  };
}
