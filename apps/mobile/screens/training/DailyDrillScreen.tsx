import { useRouter } from 'expo-router';
import { ActivePuzzleSession } from '@/components/training/ActivePuzzleSession';
import { ScreenState } from '@/components/ui/ScreenState';
import { useDailySession } from '@/hooks/useDailySession';
import { useResolvedPuzzle } from '@/hooks/useResolvedPuzzle';
import { useTrainingSessionController } from '@/hooks/useTrainingSessionController';

export function DailyDrillScreen() {
  const router = useRouter();
  const {
    puzzles,
    puzzleCount,
    isCompletedToday,
    isLoading,
    isError,
    isNotConfigured,
    error,
  } = useDailySession();
  const { puzzleIndex, handlePuzzleSuccess, isBootstrapping } =
    useTrainingSessionController({
      kind: 'daily',
      puzzles,
      puzzleCount,
      isLoading,
      isCompletedToday,
    });
  const puzzle = puzzles[puzzleIndex];
  const resolvedPuzzle = useResolvedPuzzle(puzzle);

  if (isNotConfigured) {
    return (
      <ScreenState
        actionLabel="Go back"
        message="Sign-in and puzzle sync are not set up on this device yet."
        onAction={() => router.back()}
        title="Training unavailable"
      />
    );
  }

  if (isCompletedToday) {
    return (
      <ScreenState
        actionLabel="Back to Home"
        message="You finished today's puzzles. Come back tomorrow."
        onAction={() => router.back()}
        title="Matrix cleared"
      />
    );
  }

  if (isLoading || isBootstrapping) {
    return <ScreenState message="Loading today's puzzles..." />;
  }

  if (isError || !puzzle || !resolvedPuzzle) {
    const devHint =
      __DEV__ && error instanceof Error ? `\n\n(${error.message})` : '';
    return (
      <ScreenState
        actionLabel="Go back"
        message={`Could not load today's puzzles. Check your connection and try again.${devHint}`}
        onAction={() => router.back()}
        title="Could not load puzzles"
      />
    );
  }

  return (
    <ActivePuzzleSession
      puzzle={puzzle}
      resolvedPuzzle={resolvedPuzzle}
      puzzleIndex={puzzleIndex}
      puzzleCount={puzzleCount}
      onPuzzleSuccess={handlePuzzleSuccess}
    />
  );
}
