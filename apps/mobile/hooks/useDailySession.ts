import { useMemo } from 'react';
import { selectDailyPuzzles } from '@/lib/dailySession';
import { todayKey } from '@/lib/dateKey';
import { useGuestStore } from '@/stores/guestStore';
import { usePuzzleBank } from './usePuzzleBank';

export function useDailySession() {
  const bank = usePuzzleBank();
  const lastDrillCompletedDate = useGuestStore((s) => s.lastDrillCompletedDate);

  const puzzles = useMemo(
    () => selectDailyPuzzles(bank.puzzles, todayKey()),
    [bank.puzzles],
  );

  const puzzleCount = puzzles.length;
  const isCompletedToday = lastDrillCompletedDate === todayKey();

  return {
    puzzles,
    puzzleCount,
    sessionSize: puzzleCount,
    isCompletedToday,
    isNotConfigured: bank.isNotConfigured,
    isLoading: bank.isLoading,
    isError: bank.isError,
    error: bank.error,
  };
}
