import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import {
  isLightSquare,
  squareFromIndex,
  parseBoard,
} from './boardUtils';

describe('isLightSquare', () => {
  it('a1 is dark', () => {
    expect(isLightSquare(0, 7)).toBe(false);
  });

  it('a2 is light', () => {
    expect(isLightSquare(0, 6)).toBe(true);
  });

  it('e4 is light', () => {
    expect(isLightSquare(4, 4)).toBe(true);
  });
});

describe('squareFromIndex', () => {
  it('maps bottom-left to a1', () => {
    expect(squareFromIndex(0, 7)).toBe('a1');
  });

  it('maps top-left to a8', () => {
    expect(squareFromIndex(0, 0)).toBe('a8');
  });

  it('maps e4 correctly', () => {
    expect(squareFromIndex(4, 4)).toBe('e4');
  });
});

describe('parseBoard', () => {
  it('places white rook on e4 for hook FEN', () => {
    const fen = '8/8/8/8/4R3/8/8/4k2K w - - 0 1';
    const board = parseBoard(fen);
    const chess = new Chess(fen);

    expect(chess.get('e4')?.type).toBe('r');
    expect(chess.get('e4')?.color).toBe('w');
    expect(board[4][4]).toBe('wr');
  });

  it('renders rank 8 at display index 0 (white at bottom)', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const board = parseBoard(fen);
    expect(board[0][0]).toBe('br');
    expect(board[7][0]).toBe('wr');
  });
});
