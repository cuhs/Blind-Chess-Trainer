import * as Haptics from 'expo-haptics';
import { validateAnswer } from '@mindboard/chess-core';
import type { AnswerType, Square } from '@mindboard/shared';
import { useGuestStore } from '@/stores/guestStore';

interface TrainingAnswerOptions {
  stepId: string;
  answerType: AnswerType;
  expected: string;
  fen?: string;
  moves?: string[];
  squaresTouched: Square[];
}

export function useTrainingAnswer() {
  const recordAnswer = useGuestStore((s) => s.recordAnswer);
  const recordSquareInteractions = useGuestStore((s) => s.recordSquareInteractions);

  const submit = async (
    userInput: string,
    options: TrainingAnswerOptions,
  ): Promise<boolean> => {
    const correct = validateAnswer(
      options.answerType,
      userInput,
      options.expected,
      options.fen,
      options.moves,
    );

    recordAnswer({
      stepId: options.stepId,
      userAnswer: userInput,
      correct,
      squaresTouched: options.squaresTouched,
    });

    if (correct) {
      recordSquareInteractions(options.squaresTouched);
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
    }

    return correct;
  };

  return { submit };
}
