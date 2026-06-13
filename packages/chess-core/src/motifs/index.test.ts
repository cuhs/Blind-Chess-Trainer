import { describe, it, expect } from 'vitest';
import { analyzePosition } from './index';
import { buildInfluenceMap } from './influence';
import {
  detectForks,
  detectHangingPieces,
  detectLinearMotifs,
  detectOverloadedDefenders,
} from './index';

describe('analyzePosition', () => {
  it('should return null for an invalid FEN', () => {
    expect(analyzePosition('invalid-fen')).toBeNull();
  });

  it('should return null when no motifs are present', () => {
    expect(analyzePosition('4k3/8/8/8/8/8/8/4K3 w - - 0 1')).toBeNull();
  });

  it('should return the absolute pin when it is the only motif', () => {
    const fen = '4k3/4r3/8/8/8/8/4P3/4K3 w - - 0 1';
    const motif = analyzePosition(fen);

    expect(motif).toEqual(
      expect.objectContaining({
        type: 'pin',
        pinKind: 'absolute',
        forcingWeight: 90,
      }),
    );
  });

  it('should collect multiple motifs but return only the highest-priority pin', () => {
    const fen = '4k3/4r3/8/8/8/8/4P3/4K2q w - - 0 1';
    const map = buildInfluenceMap(fen)!;

    const all = [
      ...detectLinearMotifs(fen, map),
      ...detectForks(fen, map),
      ...detectHangingPieces(fen, map),
      ...detectOverloadedDefenders(fen, map),
    ];

    expect(all.some((m) => m.type === 'pin')).toBe(true);
    expect(all.some((m) => m.type === 'hanging_piece')).toBe(true);
    expect(analyzePosition(fen)?.type).toBe('pin');
  });

  it('should prefer a discovered check over an absolute pin in the same position window', () => {
    const pinFen = '4k3/4r3/8/8/8/8/4P3/4K3 w - - 0 1';
    const previousFen = '7k/8/8/8/8/6p1/7P/2K4R w - - 0 1';
    const currentFen = '7k/8/8/8/8/6P1/8/2K4R b - - 0 1';

    expect(analyzePosition(pinFen)?.forcingWeight).toBe(90);
    expect(analyzePosition(currentFen, previousFen)).toEqual(
      expect.objectContaining({
        type: 'discovered_attack',
        isCheck: true,
        forcingWeight: 100,
      }),
    );
  });

  it('should surface a discovered attack when a previous FEN is provided', () => {
    const previousFen = '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1';
    const currentFen = '4k3/6q1/8/2P5/8/8/1B6/4K3 w - - 0 1';
    const motif = analyzePosition(currentFen, previousFen);

    expect(motif).toEqual(
      expect.objectContaining({
        type: 'discovered_attack',
        forcingWeight: 55,
      }),
    );
  });

  it('should return a royal fork over a relative pin when both are present', () => {
    const fen = '8/8/8/8/3N4/8/2q1k3/1K6 w - - 0 1';
    const motif = analyzePosition(fen);

    expect(motif).toEqual(
      expect.objectContaining({
        type: 'fork',
        isRoyalFork: true,
        forcingWeight: 80,
      }),
    );
  });

  it('should return a skewer when it is the strongest motif on the board', () => {
    const fen = '4k3/8/3r4/8/8/3K4/3B4/8 w - - 0 1';
    const motif = analyzePosition(fen);

    expect(motif).toEqual(
      expect.objectContaining({
        type: 'skewer',
        forcingWeight: 70,
      }),
    );
  });

  it('should return exactly one motif JSON object with PieceMap fields', () => {
    const fen = 'k7/8/8/5r2/3N4/8/2q5/K7 w - - 0 1';
    const motif = analyzePosition(fen);

    expect(motif).not.toBeNull();
    expect(motif).toHaveProperty('type');
    expect(motif).toHaveProperty('fen', fen);
    expect(motif).toHaveProperty('forcingWeight');
    if (motif?.type === 'fork') {
      expect(motif.attacker).toEqual(
        expect.objectContaining({ square: 'd4', type: 'n', color: 'w' }),
      );
    }
  });
});
