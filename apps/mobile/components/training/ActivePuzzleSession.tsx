import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import { SquareKeypad } from '@/components/training/SquareKeypad';
import { YesNoZone } from '@/components/training/YesNoZone';
import { ProgressChrome } from '@/components/ui/ProgressChrome';
import { MatchPeekBadge } from '@/components/training/MatchPeekBadge';
import { PuzzleSessionLayout } from '@/components/training/PuzzleSessionLayout';
import { useTrainingAnswer } from '@/hooks/useTrainingAnswer';
import { usePuzzleSessionPhase } from '@/hooks/usePuzzleSessionPhase';
import { useAnswerFlash } from '@/hooks/useAnswerFlash';
import { getTrainingDisplayFen } from '@/data/puzzleFen';
import type { TrainingPuzzle } from '@/data/training-puzzles';
import type { useResolvedPuzzle } from '@/hooks/useResolvedPuzzle';

interface ActivePuzzleSessionProps {
  puzzle: TrainingPuzzle;
  resolvedPuzzle: NonNullable<ReturnType<typeof useResolvedPuzzle>>;
  puzzleIndex: number;
  puzzleCount: number;
  progressLabelPrefix?: string;
  onPuzzleSuccess: (puzzleId: string) => void;
  onPeek?: () => void;
}

export function ActivePuzzleSession({
  puzzle,
  resolvedPuzzle,
  puzzleIndex,
  puzzleCount,
  progressLabelPrefix = 'Position',
  onPuzzleSuccess,
  onPeek,
}: ActivePuzzleSessionProps) {
  const hideBoardArea = puzzle.showBoard === false;
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
    showBoard: !hideBoardArea,
    narrationStripCheck: /in check\?/i.test(resolvedPuzzle.prompt),
    narrationScript: puzzle.narrationScript,
  });
  const { submit } = useTrainingAnswer('training');
  const { flash, opacity, kind } = useAnswerFlash();

  const progressPercent = Math.round(
    ((puzzleIndex + 1) / Math.max(puzzleCount, 1)) * 100,
  );
  const progressLabel = `${progressLabelPrefix} ${puzzleIndex + 1} of ${puzzleCount}`;

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

  const handlePeekPress = () => {
    onPeek?.();
    triggerPeek();
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
        hideBoardArea,
        showBoard: hideBoardArea ? false : isMemorizing || peekVisible,
      }}
      onPeek={hideBoardArea ? undefined : canAnswer ? handlePeekPress : undefined}
      flash={{ opacity, kind }}
    >
      {controls}
    </PuzzleSessionLayout>
  );
}

/** Spacer for screens that need a full-screen container around the session. */
export function PuzzleSessionContainer({ children }: { children: ReactNode }) {
  return <View style={{ flex: 1 }}>{children}</View>;
}
