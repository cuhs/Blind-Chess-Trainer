import { describe, it, expect } from 'vitest';
import {
  getAttackSquares,
  scanBoard,
  squareToCoords,
  coordsToSquare,
  pieceValue,
} from './primitives';

describe('primitives', () => {
  it('should map coordinates and squares consistently', () => {
    expect(squareToCoords('e4')).toEqual({ file: 4, rank: 3 });
    expect(coordsToSquare(4, 3)).toBe('e4');
    expect(coordsToSquare(8, 3)).toBeNull();
  });

  it('should return null for an invalid FEN when scanning the board', () => {
    expect(scanBoard('not-a-fen')).toBeNull();
  });

  it('should compute rook attacks through empty squares and stop on blockers', () => {
    const board = scanBoard('4k3/4r3/8/8/4R3/8/8/4K3 w - - 0 1')!;
    const rook = board.e4!;
    const attacks = getAttackSquares(rook, board);

    expect(attacks).toContain('e7');
    expect(attacks).toContain('e1');
    expect(attacks).not.toContain('e8');
  });

  it('should compute bishop diagonal attacks', () => {
    const board = scanBoard('4k3/8/8/8/4B3/8/8/4K3 w - - 0 1')!;
    const bishop = board.e4!;
    const attacks = getAttackSquares(bishop, board);

    expect(attacks).toContain('d5');
    expect(attacks).toContain('f5');
    expect(attacks).toContain('h7');
    expect(attacks).not.toContain('e5');
  });

  it('should compute knight leap attacks', () => {
    const board = scanBoard('4k3/8/8/8/4N3/8/8/4K3 w - - 0 1')!;
    const knight = board.e4!;
    const attacks = getAttackSquares(knight, board);

    expect(attacks).toEqual(
      expect.arrayContaining(['c5', 'd6', 'f6', 'g5', 'g3', 'f2', 'd2', 'c3']),
    );
    expect(attacks).toHaveLength(8);
  });

  it('should compute pawn diagonal attacks only', () => {
    const board = scanBoard('4k3/8/8/8/4P3/8/8/4K3 w - - 0 1')!;
    const pawn = board.e4!;
    const attacks = getAttackSquares(pawn, board);

    expect(attacks).toEqual(['d5', 'f5']);
  });

  it('should assign standard piece values for tie-breaks', () => {
    expect(pieceValue('p')).toBe(1);
    expect(pieceValue('q')).toBe(9);
    expect(pieceValue('k')).toBe(100);
  });
});
