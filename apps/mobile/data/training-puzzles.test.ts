import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { validateAnswer } from '@mindboard/chess-core';
import { DAILY_DRILL_PUZZLES } from './training-puzzles';
import { getTrainingDisplayFen } from './puzzleFen';
import type { TrainingPuzzle } from './training-puzzles';

function pieceOnSquare(fen: string, square: string): string | null {
  const chess = new Chess(fen);
  const piece = chess.get(square as never);
  if (!piece) return null;
  return `${piece.color}${piece.type}`;
}

function assertSquareAnswer(puzzle: TrainingPuzzle) {
  const fen = getTrainingDisplayFen(puzzle);
  const expected = puzzle.expected.toLowerCase();
  const actual = pieceOnSquare(fen, expected);

  expect(actual).not.toBeNull();
  expect(validateAnswer(puzzle.answerType, expected, expected, fen)).toBe(true);
}

function withTurn(fen: string, turn: 'w' | 'b'): string {
  const parts = fen.split(' ');
  parts[1] = turn;
  return parts.join(' ');
}

function assertAbsolutePin(puzzle: TrainingPuzzle) {
  const chess = new Chess(withTurn(puzzle.fen, 'b'));
  expect(chess.inCheck()).toBe(false);

  chess.remove('d5' as never);
  const exposedFen = chess.fen();
  expect(new Chess(exposedFen).inCheck()).toBe(true);
}

describe('training-puzzles', () => {
  it('exports exactly 3 daily drill puzzles', () => {
    expect(DAILY_DRILL_PUZZLES).toHaveLength(3);
  });

  it('pinned knight is on d5', () => {
    const puzzle = DAILY_DRILL_PUZZLES[0];
    assertSquareAnswer(puzzle);
    expect(pieceOnSquare(puzzle.fen, 'd5')).toBe('bn');
    expect(pieceOnSquare(puzzle.fen, 'c4')).toBe('wb');
    expect(pieceOnSquare(puzzle.fen, 'e6')).toBe('bk');
    assertAbsolutePin(puzzle);
  });

  it('story check answer matches position after moves', () => {
    const puzzle = DAILY_DRILL_PUZZLES[1];
    const fen = getTrainingDisplayFen(puzzle);
    expect(
      validateAnswer(
        puzzle.answerType,
        puzzle.expected,
        puzzle.expected,
        puzzle.fen,
        puzzle.moves,
      ),
    ).toBe(true);
    expect(pieceOnSquare(fen, 'e8')).toBe('bk');
  });

  it('pinning bishop is on c4', () => {
    const puzzle = DAILY_DRILL_PUZZLES[2];
    assertSquareAnswer(puzzle);
    expect(pieceOnSquare(puzzle.fen, 'c4')).toBe('wb');
    expect(pieceOnSquare(puzzle.fen, 'd5')).toBe('bn');
    expect(pieceOnSquare(puzzle.fen, 'e6')).toBe('bk');
    assertAbsolutePin(puzzle);
  });
});
