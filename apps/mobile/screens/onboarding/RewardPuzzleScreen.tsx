// TODO(stitch): RewardPuzzle — infer from StoryPuzzle
import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { PuzzleBoard } from '@/components/chess/PuzzleBoard';
import { PromptText } from '@/components/ui/PromptText';
import { MoveInput } from '@/components/ui/MoveInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { OnboardingChrome } from '@/components/onboarding/OnboardingChrome';
import { PeekButton } from '@/components/onboarding/PeekButton';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useTrainingAnswer } from '@/hooks/useTrainingAnswer';
import { useMemorizePhase } from '@/hooks/useMemorizePhase';
import { getRewardPuzzle } from '@/data/onboarding-puzzles';
import { getPuzzleDisplayFen } from '@/data/puzzleFen';
import type { OnboardingStep } from '@mindboard/shared';

const MEMORIZE_PROMPT = 'Look closely. You have 5 seconds.';

interface RewardPuzzleScreenProps {
  index: number;
}

export function RewardPuzzleScreen({ index }: RewardPuzzleScreenProps) {
  const [answer, setAnswer] = useState('');
  const step: OnboardingStep = index === 1 ? 'reward-1' : 'reward-2';
  const puzzle = getRewardPuzzle(index);
  const { phase, peekVisible, isMemorizing, canAnswer, markSuccess, triggerPeek } =
    useMemorizePhase(puzzle?.id ?? step);
  const { advance, progressLabel, progressPercent } =
    useOnboardingNavigation(step);
  const { submit } = useTrainingAnswer();

  useEffect(() => {
    if (phase === 'success') {
      const timer = setTimeout(() => advance(), 600);
      return () => clearTimeout(timer);
    }
  }, [phase, advance]);

  if (!puzzle) return null;

  const displayFen = getPuzzleDisplayFen(puzzle);

  const handleSubmit = async () => {
    const correct = await submit(answer, {
      stepId: puzzle.id,
      answerType: puzzle.answerType,
      expected: puzzle.expected,
      fen: puzzle.fen,
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

        <OnboardingChrome
          label={progressLabel()}
          percent={progressPercent()}
        />

        <PromptText
          highlight={isMemorizing ? '5' : undefined}
          variant={isMemorizing ? 'hero' : 'default'}
        >
          {isMemorizing ? MEMORIZE_PROMPT : puzzle.prompt}
        </PromptText>

        <View style={styles.boardWrap}>
          <PuzzleBoard
            boardKey={puzzle.id}
            fen={displayFen}
            isMemorizing={isMemorizing}
            peekVisible={peekVisible}
          />
        </View>

        {canAnswer ? (
          <View style={styles.controls}>
            <MoveInput
              onChangeText={setAnswer}
              onSubmitAnswer={handleSubmit}
              placeholder={puzzle.inputPlaceholder}
              value={answer}
            />
            <PrimaryButton label="Submit Answer" onPress={handleSubmit} />
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
