import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import type { TrainingPuzzle } from '@/data/training-puzzles';
import { resolveDrillBootstrap } from '@/lib/drillBootstrap';
import { todayKey } from '@/lib/dateKey';
import { useGuestStore } from '@/stores/guestStore';

interface UseDrillSessionControllerInput {
  puzzles: TrainingPuzzle[];
  puzzleCount: number;
  isLoading: boolean;
  isCompletedToday: boolean;
}

export function useDrillSessionController({
  puzzles,
  puzzleCount,
  isLoading,
  isCompletedToday,
}: UseDrillSessionControllerInput) {
  const router = useRouter();
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const sessionBootstrapped = useRef(false);
  const wasCompletedToday = useRef(false);

  const drillProgress = useGuestStore((s) => s.drillProgress);
  const lastDrillCompletedDate = useGuestStore((s) => s.lastDrillCompletedDate);
  const completeDailyDrill = useGuestStore((s) => s.completeDailyDrill);
  const recordDrillPuzzleComplete = useGuestStore(
    (s) => s.recordDrillPuzzleComplete,
  );

  const finishDrill = useCallback(() => {
    completeDailyDrill(todayKey());
    router.replace('/(main)/' as never);
  }, [completeDailyDrill, router]);

  useEffect(() => {
    if (wasCompletedToday.current && !isCompletedToday) {
      sessionBootstrapped.current = false;
      setIsBootstrapping(true);
    }
    wasCompletedToday.current = isCompletedToday;
  }, [isCompletedToday]);

  useEffect(() => {
    if (sessionBootstrapped.current || isLoading) return;

    if (puzzles.length === 0) {
      setIsBootstrapping(false);
      return;
    }

    sessionBootstrapped.current = true;
    const today = todayKey();
    const result = resolveDrillBootstrap({
      today,
      lastDrillCompletedDate,
      drillProgress,
      puzzles,
    });

    if (result.kind === 'auto_complete') {
      finishDrill();
      return;
    }

    if (result.kind === 'resume') {
      setPuzzleIndex(result.puzzleIndex);
    }

    setIsBootstrapping(false);
  }, [
    isLoading,
    puzzles,
    drillProgress,
    lastDrillCompletedDate,
    finishDrill,
  ]);

  const handlePuzzleSuccess = useCallback(
    (puzzleId: string) => {
      recordDrillPuzzleComplete(puzzleId);
      const isLastPuzzle = puzzleIndex >= puzzleCount - 1;
      if (isLastPuzzle) {
        finishDrill();
      } else {
        setPuzzleIndex((index) => index + 1);
      }
    },
    [puzzleIndex, puzzleCount, recordDrillPuzzleComplete, finishDrill],
  );

  return {
    puzzleIndex,
    handlePuzzleSuccess,
    isBootstrapping,
  };
}
