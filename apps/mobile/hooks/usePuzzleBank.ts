import { useQuery } from '@tanstack/react-query';
import type { TrainingPuzzle } from '@/data/training-puzzles';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { mapPuzzleBankRows, type PuzzleBankRow } from '@/lib/puzzleBank';
import { useSupabaseUserId } from './useSupabaseUserId';

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
            'answer_square',
            'moves',
            'squares_touched',
            'source',
          ].join(', '),
        )
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const rows = (Array.isArray(data) ? data : []) as unknown as PuzzleBankRow[];
      return mapPuzzleBankRows(rows);
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
