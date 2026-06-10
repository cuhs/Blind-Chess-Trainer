// TODO(stitch): StoryCheck — infer from HookBoard + DailyDrill
import { useEffect } from 'react';
import { YesNoZone } from '@/components/training/YesNoZone';
import { ProgressChrome } from '@/components/ui/ProgressChrome';
import { PuzzleSessionLayout } from '@/components/training/PuzzleSessionLayout';
import { PeekButton } from '@/components/onboarding/PeekButton';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useTrainingAnswer } from '@/hooks/useTrainingAnswer';
import { usePuzzleSessionPhase } from '@/hooks/usePuzzleSessionPhase';
import { useAnswerFlash } from '@/hooks/useAnswerFlash';
import { STORY_CHECK_PUZZLE } from '@/data/onboarding-puzzles';

export function StoryCheckScreen() {
  const { advance, progressLabel, progressPercent } =
    useOnboardingNavigation('story-check');
  const { submit } = useTrainingAnswer();
  const { flash, opacity, kind } = useAnswerFlash();
  const {
    phase,
    peekVisible,
    isMemorizing,
    isListening,
    canAnswer,
    markSuccess,
    triggerPeek,
  } = usePuzzleSessionPhase(STORY_CHECK_PUZZLE.id, {
    fen: STORY_CHECK_PUZZLE.fen,
    moves: STORY_CHECK_PUZZLE.moves ?? [],
  });

  useEffect(() => {
    if (phase === 'success') {
      const timer = setTimeout(() => advance(), 600);
      return () => clearTimeout(timer);
    }
  }, [phase, advance]);

  const handleAnswer = async (value: 'yes' | 'no') => {
    const correct = await submit(value, {
      stepId: STORY_CHECK_PUZZLE.id,
      answerType: STORY_CHECK_PUZZLE.answerType,
      expected: STORY_CHECK_PUZZLE.expected,
      fen: STORY_CHECK_PUZZLE.fen,
      moves: STORY_CHECK_PUZZLE.moves,
      squaresTouched: STORY_CHECK_PUZZLE.squaresTouched,
    });
    flash(correct ? 'success' : 'error');
    if (correct) {
      markSuccess();
    }
  };

  return (
    <PuzzleSessionLayout
      chrome={
        <ProgressChrome label={progressLabel()} percent={progressPercent()} />
      }
      isListening={isListening}
      isMemorizing={isMemorizing}
      prompt={STORY_CHECK_PUZZLE.prompt}
      memorizeSubtitle={STORY_CHECK_PUZZLE.subtitle}
      board={{
        boardKey: STORY_CHECK_PUZZLE.id,
        fen: STORY_CHECK_PUZZLE.fen,
        peekVisible,
        showBoard: isMemorizing || peekVisible,
      }}
      flash={{ opacity, kind }}
    >
      {canAnswer ? (
        <>
          <YesNoZone onAnswer={handleAnswer} />
          <PeekButton onPress={triggerPeek} />
        </>
      ) : null}
    </PuzzleSessionLayout>
  );
}
