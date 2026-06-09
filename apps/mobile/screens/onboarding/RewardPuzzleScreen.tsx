// TODO(stitch): RewardPuzzle — infer from StoryPuzzle
import { useState, useEffect } from 'react';
import { MoveInput } from '@/components/ui/MoveInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressChrome } from '@/components/ui/ProgressChrome';
import { PuzzleSessionLayout } from '@/components/training/PuzzleSessionLayout';
import { PeekButton } from '@/components/onboarding/PeekButton';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useTrainingAnswer } from '@/hooks/useTrainingAnswer';
import { useMemorizePhase } from '@/hooks/useMemorizePhase';
import { getRewardPuzzle } from '@/data/onboarding-puzzles';
import { getPuzzleDisplayFen } from '@/data/puzzleFen';
import type { OnboardingStep } from '@mindboard/shared';

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
    <PuzzleSessionLayout
      chrome={
        <ProgressChrome label={progressLabel()} percent={progressPercent()} />
      }
      isMemorizing={isMemorizing}
      prompt={puzzle.prompt}
      board={{
        boardKey: puzzle.id,
        fen: displayFen,
        peekVisible,
      }}
    >
      {canAnswer ? (
        <>
          <MoveInput
            onChangeText={setAnswer}
            onSubmitAnswer={handleSubmit}
            placeholder={puzzle.inputPlaceholder}
            value={answer}
          />
          <PrimaryButton label="Submit Answer" onPress={handleSubmit} />
          <PeekButton onPress={triggerPeek} />
        </>
      ) : null}
    </PuzzleSessionLayout>
  );
}
