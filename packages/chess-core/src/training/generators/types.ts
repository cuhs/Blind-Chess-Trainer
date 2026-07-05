import type { AnswerType, Square } from '@mindboard/shared';

export interface GeneratedTrainingPuzzle {
  id: string;
  fen: string;
  moves: string[];
  prompt: string;
  inputPlaceholder?: string;
  subtitle?: string;
  answerType: AnswerType;
  expected: string;
  squaresTouched: Square[];
  /** When false, no memorize step and no board/peek — pure blind recall. */
  showBoard?: boolean;
  /** Spoken line for move puzzles — omits squares/captures that would spoil the answer. */
  narrationScript?: string;
}

export type GeneratorId =
  | 'coordinate_color'
  | 'coordinate_neighbor'
  | 'coordinate_knight_reach'
  | 'static_recall_2'
  | 'static_recall_4'
  | 'static_recall_6'
  | 'move_update_landing'
  | 'move_update_vacated'
  | 'move_update_capture'
  | 'shallow_calc_state'
  | 'shallow_calc_attacked'
  | 'chunk_castled'
  | 'chunk_fianchetto'
  | 'chunk_pawn_chain';
