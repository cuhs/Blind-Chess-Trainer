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
  prompt: 'Which square is the White Rook on?',
  subtitle: 'Memorize the positions before the fog rolls in.',
  answerType: 'square',
  expected: 'e4',
  squaresTouched: ['e4', 'e1'],
};

export const STORY_CHECK_PUZZLE: OnboardingPuzzle = {
  id: 'story-check',
  step: 'story-check',
  // Standard start → narration alone defines the position (no memorize step).
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  moves: ['e4', 'd5'],
  prompt: 'Is the Black King in check?',
  answerType: 'yes-no',
  expected: 'no',
  squaresTouched: ['e8', 'e4', 'd5'],
};

export const REWARD_PUZZLES: OnboardingPuzzle[] = [
  {
    id: 'reward-1',
    step: 'reward-1',
    fen: '8/8/8/8/8/4k3/8/4K2R w - - 0 1',
    prompt: 'Which square is the White King on?',
    answerType: 'square',
    expected: 'e1',
    squaresTouched: ['e1', 'e3'],
  },
  {
    id: 'reward-2',
    step: 'reward-2',
    fen: 'k7/8/8/8/4R3/8/8/6K1 w - - 0 1',
    prompt: 'Which square is the White Rook on?',
    answerType: 'square',
    expected: 'e4',
    squaresTouched: ['e4', 'a8', 'g1'],
  },
];

export function getRewardPuzzle(index: number): OnboardingPuzzle | undefined {
  return REWARD_PUZZLES[index - 1];
}
