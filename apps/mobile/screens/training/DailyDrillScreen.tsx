// TODO(stitch): Active Recall Training Phase + Interactive Active Recall Training frames
import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { SquareKeypad } from '@/components/training/SquareKeypad';
import { YesNoZone } from '@/components/training/YesNoZone';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressChrome } from '@/components/ui/ProgressChrome';
import { PuzzleSessionLayout } from '@/components/training/PuzzleSessionLayout';
import { useTrainingAnswer } from '@/hooks/useTrainingAnswer';
import { usePuzzleSessionPhase } from '@/hooks/usePuzzleSessionPhase';
import { useAnswerFlash } from '@/hooks/useAnswerFlash';
import { useDailySession } from '@/hooks/useDailySession';
import { useResolvedPuzzle } from '@/hooks/useResolvedPuzzle';
import type { TrainingPuzzle } from '@/data/training-puzzles';
import { useGuestStore } from '@/stores/guestStore';
import { todayKey } from '@/lib/dateKey';
import {
  completedIdsForToday,
  isAllDrillPuzzlesComplete,
  resumePuzzleIndex,
} from '@/lib/drillProgress';

interface DrillStateProps {
  title?: string;
  message: string;
  onBack?: () => void;
}

function DrillState({ title, message, onBack }: DrillStateProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.stateWrap}>
        {title ? <Text style={styles.stateTitle}>{title}</Text> : null}
        <Text style={styles.stateText}>{message}</Text>
        {onBack ? (
          <PrimaryButton
            accessibilityLabel="Back to Home"
            label="Back to Home"
            onPress={onBack}
            uppercase={false}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

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
        <ProgressChrome
          accessibilityLabel={`Training progress: ${progressLabel}`}
          label={progressLabel}
          percent={progressPercent}
        />
      }
      isListening={isListening}
      isMemorizing={isMemorizing}
      prompt={resolvedPrompt}
      memorizeSubtitle={puzzle.subtitle}
      board={{
        boardKey: resolvedPuzzle.id,
        // Base position, not displayFen — for story puzzles the user must
        // apply the narrated moves mentally, even on peek.
        fen: resolvedPuzzle.fen,
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
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const sessionBootstrapped = useRef(false);
  const wasCompletedToday = useRef(false);
  const {
    puzzles,
    puzzleCount,
    isCompletedToday,
    isLoading,
    isError,
    isNotConfigured,
    error,
  } = useDailySession();
  const puzzle = puzzles[puzzleIndex];
  const resolvedPuzzle = useResolvedPuzzle(puzzle);
  const drillProgress = useGuestStore((s) => s.drillProgress);
  const lastDrillCompletedDate = useGuestStore((s) => s.lastDrillCompletedDate);
  const setLastDrillCompletedDate = useGuestStore(
    (s) => s.setLastDrillCompletedDate,
  );
  const recordDrillPuzzleComplete = useGuestStore(
    (s) => s.recordDrillPuzzleComplete,
  );
  const clearDrillProgress = useGuestStore((s) => s.clearDrillProgress);

  const isLastPuzzle = puzzleIndex >= puzzleCount - 1;

  const completeDrill = useCallback(() => {
    setLastDrillCompletedDate(todayKey());
    clearDrillProgress();
    router.replace('/(main)/' as never);
  }, [router, setLastDrillCompletedDate, clearDrillProgress]);

  const handlePuzzleSuccess = useCallback(
    (puzzleId: string) => {
      recordDrillPuzzleComplete(puzzleId);
      if (isLastPuzzle) {
        completeDrill();
      } else {
        setPuzzleIndex((index) => index + 1);
      }
    },
    [isLastPuzzle, recordDrillPuzzleComplete, completeDrill],
  );

  useEffect(() => {
    if (wasCompletedToday.current && !isCompletedToday) {
      sessionBootstrapped.current = false;
    }
    wasCompletedToday.current = isCompletedToday;
  }, [isCompletedToday]);

  useEffect(() => {
    if (sessionBootstrapped.current || isLoading || puzzles.length === 0) return;

    const today = todayKey();
    if (lastDrillCompletedDate === today) {
      sessionBootstrapped.current = true;
      return;
    }

    sessionBootstrapped.current = true;
    const completedIds = completedIdsForToday(drillProgress, today);

    if (
      isAllDrillPuzzlesComplete(puzzles, completedIds) &&
      lastDrillCompletedDate !== today
    ) {
      completeDrill();
      return;
    }

    setPuzzleIndex(resumePuzzleIndex(puzzles, completedIds));
  }, [
    isLoading,
    puzzles,
    drillProgress,
    lastDrillCompletedDate,
    completeDrill,
  ]);

  useEffect(() => {
    if (puzzleCount === 0 || puzzleIndex < puzzleCount) return;
    setPuzzleIndex(0);
  }, [puzzleCount, puzzleIndex]);

  if (isNotConfigured) {
    return (
      <DrillState
        title="Supabase not configured"
        message="Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local (repo root or apps/mobile), then restart Expo."
        onBack={() => router.back()}
      />
    );
  }

  if (isCompletedToday) {
    return (
      <DrillState
        title="Matrix cleared"
        message="You finished today's puzzles. Come back tomorrow."
        onBack={() => router.back()}
      />
    );
  }

  if (isLoading) {
    return <DrillState message="Loading today's puzzles..." />;
  }

  if (isError || !puzzle || !resolvedPuzzle) {
    const devHint =
      __DEV__ && error instanceof Error ? `\n\n(${error.message})` : '';
    return (
      <DrillState
        title="Could not load puzzles"
        message={`Check EXPO_PUBLIC_SUPABASE_URL, anonymous auth, and that puzzle_bank is seeded on your cloud project.${devHint}`}
        onBack={() => router.back()}
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stateWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.md,
  },
  stateTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  stateText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
