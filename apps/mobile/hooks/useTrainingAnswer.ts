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

type AnswerContext = 'onboarding' | 'training';

export function useTrainingAnswer(context: AnswerContext = 'onboarding') {
  const recordAnswer = useGuestStore((s) => s.recordAnswer);
  const recordTrainingAnswer = useGuestStore((s) => s.recordTrainingAnswer);
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

    const answer = {
      stepId: options.stepId,
      userAnswer: userInput,
      correct,
      squaresTouched: options.squaresTouched,
    };

    if (context === 'training') {
      recordTrainingAnswer(answer);
    } else {
      recordAnswer(answer);
    }

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
