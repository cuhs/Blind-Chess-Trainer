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
  /** Spread bucket for daily session composition (pin, fork, check, …). */
  promptCategory?: string;
  /** When false, skip board memorize/peek — answer from mental grid only. */
  showBoard?: boolean;
  /** Custom TTS script when SAN would leak the answer (move-tracking drills). */
  narrationScript?: string;
}
