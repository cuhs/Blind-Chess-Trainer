import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import type { NodeStarRating } from '@mindboard/shared';
import type { TrainingPuzzle } from '@/data/training-puzzles';
import { resolveDrillBootstrap } from '@/lib/drillBootstrap';
import { todayKey } from '@/lib/dateKey';
import {
  completedIdsForNode,
  starsForSession,
} from '@/lib/trainingProgress';
import { resumePuzzleIndex } from '@/lib/drillProgress';
import { useGuestStore } from '@/stores/guestStore';

type SessionMode =
  | {
      kind: 'daily';
      puzzles: TrainingPuzzle[];
      puzzleCount: number;
      isLoading: boolean;
      isCompletedToday: boolean;
    }
  | {
      kind: 'node';
      nodeId: string;
      puzzles: TrainingPuzzle[];
      puzzleCount: number;
      isLoading: boolean;
      passThreshold: number;
    };

export function useTrainingSessionController(mode: SessionMode) {
  const router = useRouter();
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [peekCount, setPeekCount] = useState(0);
  const sessionBootstrapped = useRef(false);
  const wasCompletedToday = useRef(false);
  const correctCountRef = useRef(0);

  const drillProgress = useGuestStore((s) => s.drillProgress);
  const lastDrillCompletedDate = useGuestStore((s) => s.lastDrillCompletedDate);
  const completeDailyDrill = useGuestStore((s) => s.completeDailyDrill);
  const recordDrillPuzzleComplete = useGuestStore(
    (s) => s.recordDrillPuzzleComplete,
  );
  const nodeSessionProgress = useGuestStore((s) => s.nodeSessionProgress);
  const recordNodePuzzleComplete = useGuestStore(
    (s) => s.recordNodePuzzleComplete,
  );
  const completeTrainingNode = useGuestStore((s) => s.completeTrainingNode);
  const clearNodeSessionProgress = useGuestStore(
    (s) => s.clearNodeSessionProgress,
  );
  const setActiveTrainingNode = useGuestStore((s) => s.setActiveTrainingNode);

  const finishDailyDrill = useCallback(() => {
    completeDailyDrill(todayKey());
    router.replace('/(main)/' as never);
  }, [completeDailyDrill, router]);

  const finishNodeSession = useCallback(() => {
    if (mode.kind !== 'node') return;
    const stars = starsForSession(
      correctCountRef.current,
      mode.puzzleCount,
      peekCount,
    ) as NodeStarRating;
    if (correctCountRef.current >= mode.passThreshold) {
      completeTrainingNode(mode.nodeId, stars);
    } else {
      clearNodeSessionProgress();
    }
    router.back();
  }, [
    mode,
    peekCount,
    completeTrainingNode,
    clearNodeSessionProgress,
    router,
  ]);

  useEffect(() => {
    if (mode.kind !== 'daily') return;
    if (wasCompletedToday.current && !mode.isCompletedToday) {
      sessionBootstrapped.current = false;
      setIsBootstrapping(true);
    }
    wasCompletedToday.current = mode.isCompletedToday;
  }, [mode]);

  useEffect(() => {
    if (sessionBootstrapped.current || mode.isLoading) return;

    if (mode.puzzles.length === 0) {
      setIsBootstrapping(false);
      return;
    }

    sessionBootstrapped.current = true;
    correctCountRef.current = 0;
    setPeekCount(0);

    if (mode.kind === 'daily') {
      const today = todayKey();
      const result = resolveDrillBootstrap({
        today,
        lastDrillCompletedDate,
        drillProgress,
        puzzles: mode.puzzles,
      });

      if (result.kind === 'auto_complete') {
        finishDailyDrill();
        return;
      }

      if (result.kind === 'resume') {
        setPuzzleIndex(result.puzzleIndex);
        correctCountRef.current = result.puzzleIndex;
      }
    } else {
      setActiveTrainingNode(mode.nodeId);
      const completedIds = completedIdsForNode(
        nodeSessionProgress,
        mode.nodeId,
      );
      setPuzzleIndex(resumePuzzleIndex(mode.puzzles, completedIds));
      correctCountRef.current = completedIds.length;
    }

    setIsBootstrapping(false);
  }, [
    mode,
    drillProgress,
    lastDrillCompletedDate,
    nodeSessionProgress,
    finishDailyDrill,
    setActiveTrainingNode,
  ]);

  const handlePuzzleSuccess = useCallback(
    (puzzleId: string) => {
      correctCountRef.current += 1;

      if (mode.kind === 'daily') {
        recordDrillPuzzleComplete(puzzleId);
        const isLastPuzzle = puzzleIndex >= mode.puzzleCount - 1;
        if (isLastPuzzle) {
          finishDailyDrill();
        } else {
          setPuzzleIndex((index) => index + 1);
        }
        return;
      }

      recordNodePuzzleComplete(mode.nodeId, puzzleId);
      const isLastPuzzle = puzzleIndex >= mode.puzzleCount - 1;
      if (isLastPuzzle) {
        finishNodeSession();
      } else {
        setPuzzleIndex((index) => index + 1);
      }
    },
    [
      mode,
      puzzleIndex,
      recordDrillPuzzleComplete,
      recordNodePuzzleComplete,
      finishDailyDrill,
      finishNodeSession,
    ],
  );

  const handlePeek = useCallback(() => {
    setPeekCount((count) => count + 1);
  }, []);

  return {
    puzzleIndex,
    handlePuzzleSuccess,
    handlePeek,
    isBootstrapping,
  };
}
