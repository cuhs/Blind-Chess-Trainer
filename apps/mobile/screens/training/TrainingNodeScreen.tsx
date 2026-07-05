import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivePuzzleSession } from '@/components/training/ActivePuzzleSession';
import { ScreenState } from '@/components/ui/ScreenState';
import { useNodePuzzles } from '@/hooks/useNodePuzzles';
import { useResolvedPuzzle } from '@/hooks/useResolvedPuzzle';
import { useTrainingSessionController } from '@/hooks/useTrainingSessionController';
import { isNodeUnlocked } from '@/lib/trainingProgress';
import { resolveTrainingNode } from '@/lib/trainingNode';
import { useGuestStore } from '@/stores/guestStore';

export function TrainingNodeScreen() {
  const router = useRouter();
  const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
  const trainingProgress = useGuestStore((s) => s.trainingProgress);
  const node = nodeId ? resolveTrainingNode(nodeId) : null;

  const {
    puzzles,
    puzzleCount,
    isLoading,
    isError,
    error,
  } = useNodePuzzles(nodeId);

  const unlocked = nodeId
    ? isNodeUnlocked(nodeId, trainingProgress)
    : false;

  const { puzzleIndex, handlePuzzleSuccess, handlePeek, isBootstrapping } =
    useTrainingSessionController(
      node && nodeId
        ? {
            kind: 'node',
            nodeId,
            puzzles,
            puzzleCount,
            isLoading,
            passThreshold: node.passThreshold,
          }
        : {
            kind: 'node',
            nodeId: nodeId ?? '',
            puzzles: [],
            puzzleCount: 0,
            isLoading: true,
            passThreshold: 2,
          },
    );

  const puzzle = puzzles[puzzleIndex];
  const resolvedPuzzle = useResolvedPuzzle(puzzle);

  if (!nodeId || !node) {
    return (
      <ScreenState
        actionLabel="Go back"
        message="This training level could not be found."
        onAction={() => router.back()}
        title="Unknown level"
      />
    );
  }

  if (!unlocked) {
    return (
      <ScreenState
        actionLabel="Back to Training"
        message="Complete the previous level to unlock this one."
        onAction={() => router.back()}
        title="Level locked"
      />
    );
  }

  if (isLoading || isBootstrapping) {
    return <ScreenState message={`Loading ${node.title}...`} />;
  }

  if (isError || !puzzle || !resolvedPuzzle || puzzleCount === 0) {
    const devHint =
      __DEV__ && error instanceof Error ? `\n\n(${error.message})` : '';
    return (
      <ScreenState
        actionLabel="Go back"
        message={`Could not load puzzles for this level.${devHint}`}
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
      progressLabelPrefix="Puzzle"
      onPuzzleSuccess={handlePuzzleSuccess}
      onPeek={handlePeek}
    />
  );
}
