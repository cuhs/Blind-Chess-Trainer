// TODO(stitch): StoryCheck — infer from HookBoard + StoryPuzzle
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
import { STORY_CHECK_PUZZLE } from '@/data/onboarding-puzzles';
import { getPuzzleDisplayFen } from '@/data/puzzleFen';

const MEMORIZE_PROMPT = 'Look closely. You have 5 seconds.';

export function StoryCheckScreen() {
  const [answer, setAnswer] = useState('');
  const { advance, progressLabel, progressPercent } =
    useOnboardingNavigation('story-check');
  const { submit } = useTrainingAnswer();
  const { phase, peekVisible, isMemorizing, canAnswer, markSuccess, triggerPeek } =
    useMemorizePhase(STORY_CHECK_PUZZLE.id);
  const displayFen = getPuzzleDisplayFen(STORY_CHECK_PUZZLE);

  useEffect(() => {
    if (phase === 'success') {
      const timer = setTimeout(() => advance(), 600);
      return () => clearTimeout(timer);
    }
  }, [phase, advance]);

  const handleSubmit = async () => {
    const correct = await submit(answer, {
      stepId: STORY_CHECK_PUZZLE.id,
      answerType: STORY_CHECK_PUZZLE.answerType,
      expected: STORY_CHECK_PUZZLE.expected,
      fen: STORY_CHECK_PUZZLE.fen,
      moves: STORY_CHECK_PUZZLE.moves,
      squaresTouched: STORY_CHECK_PUZZLE.squaresTouched,
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
          subtitle={
            isMemorizing
              ? STORY_CHECK_PUZZLE.subtitle
              : undefined
          }
          variant={isMemorizing ? 'hero' : 'default'}
        >
          {isMemorizing ? MEMORIZE_PROMPT : STORY_CHECK_PUZZLE.prompt}
        </PromptText>

        <View style={styles.boardWrap}>
          <PuzzleBoard
            boardKey={STORY_CHECK_PUZZLE.id}
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
              placeholder={STORY_CHECK_PUZZLE.inputPlaceholder}
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
