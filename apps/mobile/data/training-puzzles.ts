import type { AnswerType, Square } from '@mindboard/shared';

export interface TrainingPuzzle {
  id: string;
  fen: string;
  moves: string[];
  prompt: string;
  inputPlaceholder?: string;
  subtitle?: string;
  answerType: AnswerType;
  expected: string;
  squaresTouched: Square[];
  source?: 'daily' | 'peek';
}
