// TODO(stitch): DailyDrill — infer from StoryPuzzle + Interactive Active Recall Training
import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { PuzzleBoard } from '@/components/chess/PuzzleBoard';
import { PromptText } from '@/components/ui/PromptText';
import { MoveInput } from '@/components/ui/MoveInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { TrainingChrome } from '@/components/training/TrainingChrome';
import { PeekButton } from '@/components/onboarding/PeekButton';
import { useTrainingAnswer } from '@/hooks/useTrainingAnswer';
import { useMemorizePhase } from '@/hooks/useMemorizePhase';
import {
  getDailyDrillCount,
  getDailyDrillPuzzle,
} from '@/data/training-puzzles';
import { getTrainingDisplayFen } from '@/data/puzzleFen';
import { useGuestStore } from '@/stores/guestStore';

const MEMORIZE_PROMPT = 'Look closely. You have 5 seconds.';
const DRILL_COUNT = getDailyDrillCount();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DailyDrillScreen() {
  const router = useRouter();
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [sessionComplete, setSessionComplete] = useState(false);
  const puzzle = getDailyDrillPuzzle(puzzleIndex);
  const { phase, peekVisible, isMemorizing, canAnswer, markSuccess, triggerPeek } =
    useMemorizePhase(puzzle?.id ?? `drill-${puzzleIndex}`);
  const { submit } = useTrainingAnswer('training');
  const setLastDrillCompletedDate = useGuestStore(
    (s) => s.setLastDrillCompletedDate,
  );
  const setLastActiveDate = useGuestStore((s) => s.setLastActiveDate);

  const isLastPuzzle = puzzleIndex >= DRILL_COUNT - 1;
  const progressPercent = sessionComplete
    ? 100
    : Math.round(((puzzleIndex + 1) / DRILL_COUNT) * 100);
  const progressLabel = sessionComplete
    ? 'Drill complete'
    : `Position ${puzzleIndex + 1} of ${DRILL_COUNT}`;

  const completeDrill = useCallback(() => {
    const today = todayKey();
    setLastDrillCompletedDate(today);
    setLastActiveDate(today);
    setSessionComplete(true);

    // Nested under training stack — target home tab explicitly.
    router.replace('/(main)/' as never);
  }, [router, setLastActiveDate, setLastDrillCompletedDate]);

  useEffect(() => {
    if (phase !== 'success') return;

    const timer = setTimeout(() => {
      if (isLastPuzzle) {
        completeDrill();
      } else {
        setPuzzleIndex((i) => i + 1);
        setAnswer('');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [phase, isLastPuzzle, completeDrill]);

  if (!puzzle) return null;

  const displayFen = getTrainingDisplayFen(puzzle);

  const handleSubmit = async () => {
    const correct = await submit(answer, {
      stepId: puzzle.id,
      answerType: puzzle.answerType,
      expected: puzzle.expected,
      fen: puzzle.fen,
      moves: puzzle.moves,
      squaresTouched: puzzle.squaresTouched,
    });
    if (correct) {
      markSuccess();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <AppHeader showSettings={false} />

        <TrainingChrome label={progressLabel} percent={progressPercent} />

        <PromptText
          highlight={isMemorizing ? '5' : undefined}
          subtitle={isMemorizing ? puzzle.subtitle : undefined}
          variant={isMemorizing ? 'hero' : 'default'}
        >
          {sessionComplete
            ? 'Nice work — your heatmap just got sharper.'
            : isMemorizing
              ? MEMORIZE_PROMPT
              : phase === 'success'
                ? 'Correct!'
                : puzzle.prompt}
        </PromptText>

        <View style={styles.boardWrap}>
          <PuzzleBoard
            boardKey={puzzle.id}
            fen={displayFen}
            isMemorizing={isMemorizing && !sessionComplete}
            peekVisible={peekVisible}
          />
        </View>

        {sessionComplete ? (
          <View style={styles.controls}>
            <PrimaryButton
              accessibilityLabel="Back to Home"
              label="Back to Home"
              onPress={completeDrill}
              uppercase={false}
            />
          </View>
        ) : canAnswer ? (
          <View style={styles.controls}>
            <MoveInput
              onChangeText={setAnswer}
              onSubmitAnswer={handleSubmit}
              placeholder={puzzle.inputPlaceholder}
              value={answer}
            />
            <PrimaryButton
              accessibilityLabel="Submit Answer"
              label="Submit Answer"
              onPress={handleSubmit}
            />
            <PeekButton onPress={triggerPeek} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.xl,
  },
  boardWrap: {
    alignItems: 'center',
    marginBottom: spacing.sectionGap,
  },
  controls: {
    gap: spacing.md,
  },
});
