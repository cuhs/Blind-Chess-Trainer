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

export const DAILY_DRILL_PUZZLES: TrainingPuzzle[] = [
  {
    id: 'drill-pin-knight',
    fen: '8/8/4k3/3n4/2B5/8/8/4K3 w - - 0 1',
    moves: [],
    prompt: 'What square is the pinned knight on?',
    inputPlaceholder: 'e.g. a8',
    answerType: 'square',
    expected: 'd5',
    squaresTouched: ['d5', 'c4', 'e6'],
    source: 'daily',
  },
  {
    id: 'drill-story-check',
    fen: 'rnbqkbnr/pppp1ppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1',
    moves: ['Nf3', 'Nc6', 'Bc4', 'Nf6'],
    prompt: 'Is the Black King in check? Type Yes or No.',
    inputPlaceholder: 'e.g. Yes',
    subtitle: 'White plays Nf3, Black plays Nc6, White plays Bc4, Black plays Nf6...',
    answerType: 'yes-no',
    expected: 'no',
    squaresTouched: ['e8', 'c4', 'f6', 'f3'],
    source: 'daily',
  },
  {
    id: 'drill-pin-bishop',
    fen: '8/8/4k3/3n4/2B5/8/8/4K3 w - - 0 1',
    moves: [],
    prompt: 'What square is the pinning bishop on?',
    inputPlaceholder: 'e.g. a8',
    answerType: 'square',
    expected: 'c4',
    squaresTouched: ['c4', 'd5', 'e6'],
    source: 'daily',
  },
];

export function getDailyDrillPuzzle(index: number): TrainingPuzzle | undefined {
  return DAILY_DRILL_PUZZLES[index];
}

export function getDailyDrillCount(): number {
  return DAILY_DRILL_PUZZLES.length;
}
