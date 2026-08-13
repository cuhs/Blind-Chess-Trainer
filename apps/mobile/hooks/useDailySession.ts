import { useMemo } from 'react';
import { selectDailyPuzzles } from '@/lib/dailySession';
import {
  mergeBankWithPeekPuzzles,
  peekEventsForTodayDrill,
  trainingPuzzlesFromPeekEvents,
} from '@/lib/peekPuzzles';
import { todayKey } from '@/lib/dateKey';
import { useGuestStore } from '@/stores/guestStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { usePuzzleBank } from './usePuzzleBank';

export function useDailySession() {
  const bank = usePuzzleBank({ enabled: isSupabaseConfigured });
  const peekEvents = useGuestStore((s) => s.peekEvents);
  const lastDrillCompletedDate = useGuestStore((s) => s.lastDrillCompletedDate);

  const peekPuzzles = useMemo(
    () =>
      trainingPuzzlesFromPeekEvents(peekEventsForTodayDrill(peekEvents)),
    [peekEvents],
  );

  const puzzles = useMemo(() => {
    const merged = mergeBankWithPeekPuzzles(bank.puzzles, peekPuzzles);
    return selectDailyPuzzles(merged, todayKey());
  }, [bank.puzzles, peekPuzzles]);

  const peekPuzzleCount = useMemo(
    () => puzzles.filter((puzzle) => puzzle.source === 'peek').length,
    [puzzles],
  );

  return {
    puzzles,
    puzzleCount: puzzles.length,
    peekPuzzleCount,
    sessionSize: puzzles.length,
    isCompletedToday: lastDrillCompletedDate === todayKey(),
    isLoading: bank.isLoading,
    isError: bank.isError && puzzles.length === 0,
    error: bank.isError && puzzles.length === 0 ? bank.error : null,
  };
}
