import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { validateAnswer } from '@mindboard/chess-core';
import {
  HOOK_PUZZLE,
  STORY_CHECK_PUZZLE,
  REWARD_PUZZLES,
} from './onboarding-puzzles';
import { getPuzzleDisplayFen } from './puzzleFen';
import type { OnboardingPuzzle } from './onboarding-puzzles';

function pieceOnSquare(fen: string, square: string): string | null {
  const chess = new Chess(fen);
  const piece = chess.get(square as never);
  if (!piece) return null;
  return `${piece.color}${piece.type}`;
}

function assertSquareAnswer(puzzle: OnboardingPuzzle) {
  const fen = getPuzzleDisplayFen(puzzle);
  const expected = puzzle.expected.toLowerCase();
  const actual = pieceOnSquare(fen, expected);

  expect(actual).not.toBeNull();
  if (puzzle.prompt.toLowerCase().includes('rook')) {
    expect(actual).toBe('wr');
  }
  if (puzzle.prompt.toLowerCase().includes('king')) {
    expect(actual?.endsWith('k')).toBe(true);
  }
  expect(validateAnswer(puzzle.answerType, expected, expected, fen)).toBe(true);
}

describe('onboarding-puzzles', () => {
  it('hook rook is on e4', () => {
    assertSquareAnswer(HOOK_PUZZLE);
    expect(pieceOnSquare(HOOK_PUZZLE.fen, 'e4')).toBe('wr');
  });

  it('reward-1 white king is on e1', () => {
    assertSquareAnswer(REWARD_PUZZLES[0]);
    expect(pieceOnSquare(REWARD_PUZZLES[0].fen, 'e1')).toBe('wk');
  });

  it('reward-2 white rook is on e4', () => {
    assertSquareAnswer(REWARD_PUZZLES[1]);
    expect(pieceOnSquare(REWARD_PUZZLES[1].fen, 'e4')).toBe('wr');
    expect(pieceOnSquare(REWARD_PUZZLES[1].fen, 'e1')).toBeNull();
  });

  it('story check answer matches position after moves', () => {
    const fen = getPuzzleDisplayFen(STORY_CHECK_PUZZLE);
    expect(
      validateAnswer(
        'yes-no',
        STORY_CHECK_PUZZLE.expected,
        STORY_CHECK_PUZZLE.expected,
        STORY_CHECK_PUZZLE.fen,
        STORY_CHECK_PUZZLE.moves,
      ),
    ).toBe(true);
    expect(pieceOnSquare(fen, 'e8')).toBe('bk');
  });
});
