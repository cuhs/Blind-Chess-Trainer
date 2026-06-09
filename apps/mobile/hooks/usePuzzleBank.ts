import { useQuery } from '@tanstack/react-query';
import { DAILY_DRILL_PUZZLES, type TrainingPuzzle } from '@/data/training-puzzles';
import { supabase } from '@/lib/supabase';
import { useSupabaseUserId } from './useSupabaseUserId';
import { isSquare, type AnswerType, type Square } from '@mindboard/shared';

interface PuzzleBankRow {
  slug: string;
  fen: string;
  nlp_prompt: string;
  input_placeholder: string | null;
  subtitle: string | null;
  answer_type: string;
  expected_answer: string;
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

function toTrainingPuzzle(row: PuzzleBankRow): TrainingPuzzle | null {
  const squaresTouched = toSquares(row.squares_touched);
  if (squaresTouched.length === 0) return null;

  return {
    id: row.slug,
    fen: row.fen,
    moves: toStringArray(row.moves),
    prompt: row.nlp_prompt,
    inputPlaceholder: row.input_placeholder ?? undefined,
    subtitle: row.subtitle ?? undefined,
    answerType: toAnswerType(row.answer_type),
    expected: row.expected_answer,
    squaresTouched,
    source: toSource(row.source),
  };
}

export function usePuzzleBank() {
  const { data: userId } = useSupabaseUserId();

  const puzzleQuery = useQuery({
    queryKey: ['puzzle-bank', userId],
    enabled: Boolean(supabase && userId),
    queryFn: async () => {
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('puzzle_bank')
        .select(
          [
            'slug',
            'fen',
            'nlp_prompt',
            'input_placeholder',
            'subtitle',
            'answer_type',
            'expected_answer',
            'moves',
            'squares_touched',
            'source',
          ].join(', '),
        )
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return ((data ?? []) as unknown as PuzzleBankRow[])
        .map(toTrainingPuzzle)
        .filter((puzzle): puzzle is TrainingPuzzle => puzzle !== null);
    },
  });

  const remotePuzzles = puzzleQuery.data ?? [];
  const puzzles =
    remotePuzzles.length > 0 ? remotePuzzles : DAILY_DRILL_PUZZLES;

  return {
    puzzles,
    puzzleCount: puzzles.length,
    isLoading: puzzleQuery.isLoading,
    isUsingFallback: remotePuzzles.length === 0,
  };
}
