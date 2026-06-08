import type { AnswerType, Square } from '@mindboard/shared';

export interface OnboardingPuzzle {
  id: string;
  step: 'hook' | 'story-check' | 'reward-1' | 'reward-2';
  fen: string;
  moves?: string[];
  prompt: string;
  inputPlaceholder?: string;
  subtitle?: string;
  answerType: AnswerType;
  expected: string;
  squaresTouched: Square[];
}

export const HOOK_PUZZLE: OnboardingPuzzle = {
  id: 'hook-rook',
  step: 'hook',
  fen: '8/8/8/8/4R3/8/8/4k2K w - - 0 1',
  prompt: 'Type the square the White Rook is on.',
  subtitle: 'Memorize the positions before the fog rolls in.',
  answerType: 'square',
  expected: 'e4',
  squaresTouched: ['e4', 'e1'],
};

export const STORY_CHECK_PUZZLE: OnboardingPuzzle = {
  id: 'story-check',
  step: 'story-check',
  fen: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
  moves: ['Nf3', 'd5'],
  prompt: 'Is the Black King in check? Type Yes or No.',
  inputPlaceholder: 'e.g. Yes',
  subtitle: 'White plays Nf3, Black plays d5...',
  answerType: 'yes-no',
  expected: 'no',
  squaresTouched: ['e8', 'f3', 'd5'],
};

export const REWARD_PUZZLES: OnboardingPuzzle[] = [
  {
    id: 'reward-1',
    step: 'reward-1',
    fen: '8/8/8/8/8/4k3/8/4K2R w - - 0 1',
    prompt: 'Type the square the White King is on.',
    answerType: 'square',
    expected: 'e1',
    squaresTouched: ['e1', 'e3'],
  },
  {
    id: 'reward-2',
    step: 'reward-2',
    fen: 'k7/8/8/8/4R3/8/8/6K1 w - - 0 1',
    prompt: 'Type the square the White Rook is on.',
    answerType: 'square',
    expected: 'e4',
    squaresTouched: ['e4', 'a8', 'g1'],
  },
];

export function getRewardPuzzle(index: number): OnboardingPuzzle | undefined {
  return REWARD_PUZZLES[index - 1];
}
