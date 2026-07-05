import { useMemo } from 'react';
import { selectDailyPuzzles } from '@/lib/dailySession';
import {
  mergeBankWithPeekPuzzles,
  peekEventsForTodayDrill,
  trainingPuzzlesFromPeekEvents,
} from '@/lib/peekPuzzles';
import { todayKey } from '@/lib/dateKey';
import { useGuestStore } from '@/stores/guestStore';
import { usePuzzleBank } from './usePuzzleBank';

export function useDailySession() {
  const bank = usePuzzleBank();
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

  const puzzleCount = puzzles.length;
  const isCompletedToday = lastDrillCompletedDate === todayKey();

  return {
    puzzles,
    puzzleCount,
    peekPuzzleCount,
    sessionSize: puzzleCount,
    isCompletedToday,
    isNotConfigured: false,
    isLoading: bank.isLoading,
    isError: bank.isError,
    error: bank.error,
  };
}
