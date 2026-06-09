import { useQuery } from '@tanstack/react-query';
import type { TrainingPuzzle } from '@/data/training-puzzles';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
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

const EMPTY_PUZZLES: TrainingPuzzle[] = [];

export function usePuzzleBank() {
  const authQuery = useSupabaseUserId();
  const userId = authQuery.data ?? null;

  const authPending =
    isSupabaseConfigured &&
    !authQuery.isError &&
    (authQuery.isFetching || (authQuery.isPending && userId === null));

  const puzzleQuery = useQuery({
    queryKey: ['puzzle-bank', userId],
    enabled: Boolean(supabase && userId),
    queryFn: async (): Promise<TrainingPuzzle[]> => {
      if (!supabase) return EMPTY_PUZZLES;

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

      const rows = (Array.isArray(data) ? data : []) as unknown as PuzzleBankRow[];
      return rows
        .map((row) => toTrainingPuzzle(row))
        .filter((puzzle): puzzle is TrainingPuzzle => puzzle !== null);
    },
  });

  const puzzles = Array.isArray(puzzleQuery.data) ? puzzleQuery.data : EMPTY_PUZZLES;
  const puzzlePending = Boolean(supabase && userId) && puzzleQuery.isFetching;

  return {
    puzzles,
    puzzleCount: puzzles.length,
    isNotConfigured: !isSupabaseConfigured,
    isLoading: isSupabaseConfigured && (authPending || puzzlePending),
    isError: Boolean(authQuery.isError || puzzleQuery.isError),
    error: puzzleQuery.error ?? authQuery.error ?? null,
  };
}
