import { describe, it, expect } from 'vitest';
import { detectDiscoveredAttacks, squareBetween } from './discovered';

describe('detectDiscoveredAttacks', () => {
  it('should detect a discovered attack when a pawn moves off a bishop diagonal', () => {
    const previousFen = '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1';
    const currentFen = '4k3/6q1/8/2P5/8/8/1B6/4K3 w - - 0 1';
    const discoveries = detectDiscoveredAttacks(previousFen, currentFen);

    expect(discoveries).toContainEqual(
      expect.objectContaining({
        type: 'discovered_attack',
        attacker: expect.objectContaining({ square: 'b2', type: 'b' }),
        target: expect.objectContaining({ square: 'g7', type: 'q' }),
        unmaskedBy: expect.objectContaining({ square: 'c5', type: 'p', color: 'w' }),
        isCheck: false,
        forcingWeight: 55,
      }),
    );
  });

  it('should detect a discovered check when a pawn capture opens a rook file', () => {
    const previousFen = '7k/8/8/8/8/6p1/7P/2K4R w - - 0 1';
    const currentFen = '7k/8/8/8/8/6P1/8/2K4R b - - 0 1';
    const discoveries = detectDiscoveredAttacks(previousFen, currentFen);

    expect(discoveries).toContainEqual(
      expect.objectContaining({
        type: 'discovered_attack',
        attacker: expect.objectContaining({ square: 'h1', type: 'r' }),
        target: expect.objectContaining({ square: 'h8', type: 'k' }),
        unmaskedBy: expect.objectContaining({ square: 'g3', type: 'p', color: 'w' }),
        isCheck: true,
        forcingWeight: 100,
      }),
    );
  });

  it('should detect a discovered check when a knight vacates a rook file', () => {
    const previousFen = '7k/8/8/8/8/8/7N/2K4R w - - 0 1';
    const currentFen = '7k/8/8/8/6N1/8/8/2K4R b - - 0 1';
    const discoveries = detectDiscoveredAttacks(previousFen, currentFen);

    expect(discoveries).toContainEqual(
      expect.objectContaining({
        type: 'discovered_attack',
        attacker: expect.objectContaining({ square: 'h1', type: 'r' }),
        target: expect.objectContaining({ square: 'h8', type: 'k' }),
        unmaskedBy: expect.objectContaining({ square: 'g4', type: 'n', color: 'w' }),
        isCheck: true,
        forcingWeight: 100,
      }),
    );
  });

  it('should detect a discovered attack when a rook vacates a queen file', () => {
    const previousFen = 'r3k3/8/8/8/R7/8/8/Q3K3 w - - 0 1';
    const currentFen = 'r3k3/8/8/8/7R/8/8/Q3K3 b - - 0 1';
    const discoveries = detectDiscoveredAttacks(previousFen, currentFen);

    expect(discoveries).toContainEqual(
      expect.objectContaining({
        type: 'discovered_attack',
        attacker: expect.objectContaining({ square: 'a1', type: 'q' }),
        target: expect.objectContaining({ square: 'a8', type: 'r' }),
        unmaskedBy: expect.objectContaining({ square: 'h4', type: 'r', color: 'w' }),
        isCheck: false,
        forcingWeight: 55,
      }),
    );
  });

  it('should not detect a phantom discovery when the line remains blocked', () => {
    const previousFen = '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1';
    const currentFen = '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1';
    const discoveries = detectDiscoveredAttacks(previousFen, currentFen);

    expect(discoveries).toHaveLength(0);
  });

  it('should not detect a discovery when the attacker moved', () => {
    const previousFen = '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1';
    const currentFen = '4k3/6q1/8/2P5/8/8/4B3/4K3 w - - 0 1';
    const discoveries = detectDiscoveredAttacks(previousFen, currentFen);

    expect(discoveries).toHaveLength(0);
  });

  it('should return null from analyzePosition when previous and current FEN are identical', () => {
    const fen = '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1';
    const discoveries = detectDiscoveredAttacks(fen, fen);

    expect(discoveries).toHaveLength(0);
  });

  it("should not credit a discovery when the opponent's piece vacates the line", () => {
    // Black pawn leaves the b2-g7 diagonal: the white bishop's new attack on
    // the g7 rook is not black's discovery, and the rook has no diagonal reply.
    const previousFen = '4k3/6r1/8/8/3p4/8/1B6/4K3 b - - 0 1';
    const currentFen = '4k3/6r1/8/8/8/3p4/1B6/4K3 w - - 0 1';
    const discoveries = detectDiscoveredAttacks(previousFen, currentFen);

    expect(discoveries).toHaveLength(0);
  });

  it('should not detect a discovery when a capture keeps the line blocked', () => {
    const previousFen = '4k3/6q1/8/4r3/3P4/8/1B6/4K3 w - - 0 1';
    const currentFen = '4k3/6q1/8/4P3/8/8/1B6/4K3 b - - 0 1';
    const discoveries = detectDiscoveredAttacks(previousFen, currentFen);

    expect(discoveries).toHaveLength(0);
  });

  it('should not flag a direct new attack by the moved piece as a discovery', () => {
    // dxe5 attacks the f6 rook directly — the attacker moved, so it is not discovered.
    const previousFen = '4k3/8/5r2/4p3/3P4/8/8/4K3 w - - 0 1';
    const currentFen = '4k3/8/5r2/4P3/8/8/8/4K3 b - - 0 1';
    const discoveries = detectDiscoveredAttacks(previousFen, currentFen);

    expect(discoveries).toHaveLength(0);
  });

  it('should return an empty list for invalid FEN input', () => {
    const validFen = '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1';
    expect(detectDiscoveredAttacks('not a fen', validFen)).toHaveLength(0);
    expect(detectDiscoveredAttacks(validFen, 'not a fen')).toHaveLength(0);
  });

  it('should list intervening squares along a sliding line', () => {
    expect(squareBetween('a1', 'a8')).toEqual([
      'a2', 'a3', 'a4', 'a5', 'a6', 'a7',
    ]);
    expect(squareBetween('a1', 'h8')).toEqual([
      'b2', 'c3', 'd4', 'e5', 'f6', 'g7',
    ]);
    expect(squareBetween('a1', 'a2')).toEqual([]);
  });

  it('should terminate at the board edge for misaligned squares', () => {
    // Misaligned inputs walk the dominant direction and stop at the edge.
    const squares = squareBetween('a1', 'b3');
    expect(squares[squares.length - 1]).toBe('h8');
    expect(squares.length).toBeLessThan(8);
  });
});
