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

  it('should list intervening squares along a sliding line', () => {
    expect(squareBetween('a1', 'a8')).toEqual([
      'a2', 'a3', 'a4', 'a5', 'a6', 'a7',
    ]);
    expect(squareBetween('a1', 'h8')).toEqual([
      'b2', 'c3', 'd4', 'e5', 'f6', 'g7',
    ]);
  });
});
