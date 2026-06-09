// Stitch frame: a7e368689dde41bb8f4e006f32f4e854
import { useState, useEffect } from 'react';
import { MoveInput } from '@/components/ui/MoveInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressChrome } from '@/components/ui/ProgressChrome';
import { PuzzleSessionLayout } from '@/components/training/PuzzleSessionLayout';
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

  return (
    <PuzzleSessionLayout
      chrome={
        <ProgressChrome label={progressLabel()} percent={progressPercent()} />
      }
      isMemorizing={isMemorizing}
      prompt={HOOK_PUZZLE.prompt}
      memorizeSubtitle={HOOK_PUZZLE.subtitle}
      board={{
        boardKey: HOOK_PUZZLE.id,
        fen: HOOK_PUZZLE.fen,
        peekVisible,
      }}
    >
      {canAnswer ? (
        <>
          <MoveInput
            onChangeText={setAnswer}
            onSubmitAnswer={handleSubmit}
            placeholder={HOOK_PUZZLE.inputPlaceholder}
            value={answer}
          />
          <PrimaryButton label="Submit Answer" onPress={handleSubmit} />
          <PeekButton onPress={triggerPeek} />
        </>
      ) : null}
    </PuzzleSessionLayout>
  );
}
