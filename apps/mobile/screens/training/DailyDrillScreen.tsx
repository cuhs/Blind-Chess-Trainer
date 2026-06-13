// TODO(stitch): Active Recall Training Phase + Interactive Active Recall Training frames
import { useState, useEffect, useCallback, type ReactNode } from 'react';
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
import { useGuestStore } from '@/stores/guestStore';
import { todayKey } from '@/lib/dateKey';

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

export function DailyDrillScreen() {
  const router = useRouter();
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
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
  const puzzleKey = puzzle?.id ?? `drill-${puzzleIndex}`;
  const {
    phase,
    peekVisible,
    isMemorizing,
    isListening,
    canAnswer,
    markSuccess,
    triggerPeek,
  } = usePuzzleSessionPhase(puzzleKey, {
    fen: puzzle?.fen ?? '',
    moves: puzzle?.moves ?? [],
  });
  const { submit } = useTrainingAnswer('training');
  const { flash, opacity, kind } = useAnswerFlash();
  const setLastDrillCompletedDate = useGuestStore(
    (s) => s.setLastDrillCompletedDate,
  );
  const setLastActiveDate = useGuestStore((s) => s.setLastActiveDate);

  const isLastPuzzle = puzzleIndex >= puzzleCount - 1;
  const progressPercent = sessionComplete
    ? 100
    : Math.round(((puzzleIndex + 1) / Math.max(puzzleCount, 1)) * 100);
  const progressLabel = sessionComplete
    ? 'Drill complete'
    : `Position ${puzzleIndex + 1} of ${puzzleCount}`;

  const completeDrill = useCallback(() => {
    const today = todayKey();
    setLastDrillCompletedDate(today);
    setLastActiveDate(today);
    setSessionComplete(true);

    // Nested under training stack — target home tab explicitly.
    router.replace('/(main)/' as never);
  }, [router, setLastActiveDate, setLastDrillCompletedDate]);

  useEffect(() => {
    if (puzzleCount === 0 || puzzleIndex < puzzleCount) return;
    setPuzzleIndex(0);
  }, [puzzleCount, puzzleIndex]);

  useEffect(() => {
    if (phase !== 'success') return;

    const timer = setTimeout(() => {
      if (isLastPuzzle) {
        completeDrill();
      } else {
        setPuzzleIndex((i) => i + 1);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [phase, isLastPuzzle, completeDrill]);

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

  const resolvedPrompt = sessionComplete
    ? 'Nice work — your heatmap just got sharper.'
    : phase === 'success'
      ? 'Correct!'
      : resolvedPuzzle.prompt;

  let controls: ReactNode = null;
  if (sessionComplete) {
    controls = (
      <PrimaryButton
        accessibilityLabel="Back to Home"
        label="Back to Home"
        onPress={completeDrill}
        uppercase={false}
      />
    );
  } else if (canAnswer) {
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
      isListening={isListening && !sessionComplete}
      isMemorizing={isMemorizing && !sessionComplete}
      prompt={resolvedPrompt}
      memorizeSubtitle={puzzle.subtitle}
      board={{
        boardKey: resolvedPuzzle.id,
        // Base position, not displayFen — for story puzzles the user must
        // apply the narrated moves mentally, even on peek.
        fen: resolvedPuzzle.fen,
        peekVisible,
        showBoard: (isMemorizing || peekVisible) && !sessionComplete,
      }}
      onPeek={canAnswer && !sessionComplete ? triggerPeek : undefined}
      flash={{ opacity, kind }}
    >
      {controls}
    </PuzzleSessionLayout>
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
