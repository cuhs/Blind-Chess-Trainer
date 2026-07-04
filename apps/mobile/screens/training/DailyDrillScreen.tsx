// TODO(stitch): Active Recall Training Phase + Interactive Active Recall Training frames
import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { SquareKeypad } from '@/components/training/SquareKeypad';
import { YesNoZone } from '@/components/training/YesNoZone';
import { ProgressChrome } from '@/components/ui/ProgressChrome';
import { ScreenState } from '@/components/ui/ScreenState';
import { MatchPeekBadge } from '@/components/training/MatchPeekBadge';
import { PuzzleSessionLayout } from '@/components/training/PuzzleSessionLayout';
import { useTrainingAnswer } from '@/hooks/useTrainingAnswer';
import { usePuzzleSessionPhase } from '@/hooks/usePuzzleSessionPhase';
import { useAnswerFlash } from '@/hooks/useAnswerFlash';
import { useDailySession } from '@/hooks/useDailySession';
import { useDrillSessionController } from '@/hooks/useDrillSessionController';
import { useResolvedPuzzle } from '@/hooks/useResolvedPuzzle';
import { getTrainingDisplayFen } from '@/data/puzzleFen';
import type { TrainingPuzzle } from '@/data/training-puzzles';

interface ActiveDrillSessionProps {
  puzzle: TrainingPuzzle;
  resolvedPuzzle: NonNullable<ReturnType<typeof useResolvedPuzzle>>;
  puzzleIndex: number;
  puzzleCount: number;
  onPuzzleSuccess: (puzzleId: string) => void;
}

function ActiveDrillSession({
  puzzle,
  resolvedPuzzle,
  puzzleIndex,
  puzzleCount,
  onPuzzleSuccess,
}: ActiveDrillSessionProps) {
  const {
    phase,
    peekVisible,
    isMemorizing,
    isListening,
    canAnswer,
    markSuccess,
    triggerPeek,
  } = usePuzzleSessionPhase(resolvedPuzzle.id, {
    fen: puzzle.fen,
    moves: puzzle.moves,
  });
  const { submit } = useTrainingAnswer('training');
  const { flash, opacity, kind } = useAnswerFlash();

  const progressPercent = Math.round(
    ((puzzleIndex + 1) / Math.max(puzzleCount, 1)) * 100,
  );
  const progressLabel = `Position ${puzzleIndex + 1} of ${puzzleCount}`;

  useEffect(() => {
    if (phase !== 'success') return;

    const timer = setTimeout(() => {
      onPuzzleSuccess(resolvedPuzzle.id);
    }, 600);

    return () => clearTimeout(timer);
  }, [phase, onPuzzleSuccess, resolvedPuzzle.id]);

  const handleSubmit = async (value: string) => {
    const correct = await submit(value, {
      stepId: resolvedPuzzle.id,
      answerType: resolvedPuzzle.answerType,
      expected: resolvedPuzzle.expected,
      fen: resolvedPuzzle.fen,
      moves: resolvedPuzzle.moves,
      squaresTouched: resolvedPuzzle.squaresTouched,
    });
    flash(correct ? 'success' : 'error');
    if (correct) {
      markSuccess();
    }
  };

  const resolvedPrompt =
    phase === 'success' ? 'Correct!' : resolvedPuzzle.prompt;
  const memorizeFen = resolvedPuzzle.fen;
  const peekFen =
    puzzle.moves.length > 0
      ? getTrainingDisplayFen(puzzle)
      : resolvedPuzzle.fen;
  const boardFen = isMemorizing ? memorizeFen : peekFen;

  let controls: ReactNode = null;
  if (canAnswer) {
    controls =
      resolvedPuzzle.answerType === 'yes-no' ? (
        <YesNoZone onAnswer={(value) => handleSubmit(value)} />
      ) : (
        <SquareKeypad onSubmit={handleSubmit} resetKey={resolvedPuzzle.id} />
      );
  }

  return (
    <PuzzleSessionLayout
      chrome={
        <>
          {puzzle.source === 'peek' ? <MatchPeekBadge /> : null}
          <ProgressChrome
            accessibilityLabel={`Training progress: ${progressLabel}`}
            label={progressLabel}
            percent={progressPercent}
          />
        </>
      }
      isListening={isListening}
      isMemorizing={isMemorizing}
      prompt={resolvedPrompt}
      memorizeSubtitle={
        puzzle.source === 'peek' ? 'From your match' : puzzle.subtitle
      }
      board={{
        boardKey: resolvedPuzzle.id,
        fen: boardFen,
        peekVisible,
        showBoard: isMemorizing || peekVisible,
      }}
      onPeek={canAnswer ? triggerPeek : undefined}
      flash={{ opacity, kind }}
    >
      {controls}
    </PuzzleSessionLayout>
  );
}

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
    useDrillSessionController({
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
    <ActiveDrillSession
      puzzle={puzzle}
      resolvedPuzzle={resolvedPuzzle}
      puzzleIndex={puzzleIndex}
      puzzleCount={puzzleCount}
      onPuzzleSuccess={handlePuzzleSuccess}
    />
  );
}
