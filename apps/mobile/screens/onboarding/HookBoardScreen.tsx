// Stitch frame: a7e368689dde41bb8f4e006f32f4e854
import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { PuzzleBoard } from '@/components/chess/PuzzleBoard';
import { PromptText } from '@/components/ui/PromptText';
import { MoveInput } from '@/components/ui/MoveInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { OnboardingChrome } from '@/components/onboarding/OnboardingChrome';
import { PeekButton } from '@/components/onboarding/PeekButton';
import { useMemorizePhase } from '@/hooks/useMemorizePhase';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useTrainingAnswer } from '@/hooks/useTrainingAnswer';
import { HOOK_PUZZLE } from '@/data/onboarding-puzzles';

export function HookBoardScreen() {
  const [answer, setAnswer] = useState('');
  const { advance, progressLabel, progressPercent } =
    useOnboardingNavigation('hook');
  const { submit } = useTrainingAnswer();
  const { phase, peekVisible, isMemorizing, canAnswer, markSuccess, triggerPeek } =
    useMemorizePhase(HOOK_PUZZLE.id);

  useEffect(() => {
    if (phase === 'success') {
      const timer = setTimeout(() => advance(), 600);
      return () => clearTimeout(timer);
    }
  }, [phase, advance]);

  const handleSubmit = async () => {
    const correct = await submit(answer, {
      stepId: HOOK_PUZZLE.id,
      answerType: HOOK_PUZZLE.answerType,
      expected: HOOK_PUZZLE.expected,
      squaresTouched: HOOK_PUZZLE.squaresTouched,
    });
    if (correct) {
      markSuccess();
    }
  };

  const prompt = isMemorizing
    ? 'Look closely. You have 5 seconds.'
    : HOOK_PUZZLE.prompt;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <OnboardingChrome
          label={progressLabel()}
          percent={progressPercent()}
        />

        <PromptText subtitle={isMemorizing ? HOOK_PUZZLE.subtitle : undefined}>
          {prompt}
        </PromptText>

        <View style={styles.boardWrap}>
          <PuzzleBoard
            boardKey={HOOK_PUZZLE.id}
            fen={HOOK_PUZZLE.fen}
            isMemorizing={isMemorizing}
            peekVisible={peekVisible}
          />
        </View>

        {canAnswer ? (
          <>
            <MoveInput
              onChangeText={setAnswer}
              onSubmitAnswer={handleSubmit}
              value={answer}
            />
            <PrimaryButton label="Submit Answer" onPress={handleSubmit} />
            <PeekButton onPress={triggerPeek} />
          </>
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
});
