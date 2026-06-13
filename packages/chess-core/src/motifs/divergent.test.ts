import { describe, it, expect } from 'vitest';
import { buildInfluenceMap } from './influence';
import {
  detectDivergentMotifs,
  detectForks,
  detectHangingPieces,
  detectOverloadedDefenders,
} from './divergent';

function mapFor(fen: string) {
  return buildInfluenceMap(fen)!;
}

describe('detectForks', () => {
  it('should detect a knight fork on two enemy pieces', () => {
    const fen = 'k7/8/8/5r2/3N4/8/2q5/K7 w - - 0 1';
    const forks = detectForks(fen, mapFor(fen));

    expect(forks).toContainEqual(
      expect.objectContaining({
        type: 'fork',
        attacker: expect.objectContaining({ square: 'd4', type: 'n' }),
        targets: expect.arrayContaining([
          expect.objectContaining({ square: 'c2', type: 'q' }),
          expect.objectContaining({ square: 'f5', type: 'r' }),
        ]),
        isRoyalFork: false,
        forcingWeight: 75,
      }),
    );
  });

  it('should flag a royal fork when the king is among the targets', () => {
    const fen = '8/8/8/8/3N4/8/2q1k3/1K6 w - - 0 1';
    const forks = detectForks(fen, mapFor(fen));

    expect(forks).toContainEqual(
      expect.objectContaining({
        isRoyalFork: true,
        forcingWeight: 80,
        attacker: expect.objectContaining({ square: 'd4', type: 'n' }),
      }),
    );
  });

  it('should not detect a fork when only one enemy piece is attacked', () => {
    const fen = 'k7/8/8/8/3N4/8/8/2q5/K7 w - - 0 1';
    const forks = detectForks(fen, mapFor(fen));

    expect(forks).toHaveLength(0);
  });

  it('should detect a pawn fork on two enemy pieces', () => {
    const fen = '8/8/8/3n1b2/4P3/8/8/4K2k w - - 0 1';
    const forks = detectForks(fen, mapFor(fen));

    expect(forks).toContainEqual(
      expect.objectContaining({
        attacker: expect.objectContaining({ square: 'e4', type: 'p' }),
        targets: expect.arrayContaining([
          expect.objectContaining({ square: 'd5', type: 'n' }),
          expect.objectContaining({ square: 'f5', type: 'b' }),
        ]),
      }),
    );
  });

  it('should not detect a fork when every target is equally defended and not worth more than the forker', () => {
    const fen = '7k/8/3b1b2/3r1r2/4Q3/8/8/7K w - - 0 1';
    const map = mapFor(fen);
    const forks = detectForks(fen, map);

    expect(forks).toHaveLength(0);
    expect(map.d5.attackers).toHaveLength(1);
    expect(map.d5.defenders).toHaveLength(1);
    expect(map.f5.attackers).toHaveLength(1);
    expect(map.f5.defenders).toHaveLength(1);
  });

  it('should detect a fork when only one target is loose', () => {
    const fen = '4k3/8/3b4/3r3r/4Q3/8/8/4K3 w - - 0 1';
    const forks = detectForks(fen, mapFor(fen));

    expect(forks).toContainEqual(
      expect.objectContaining({
        attacker: expect.objectContaining({ square: 'e4', type: 'q' }),
        targets: expect.arrayContaining([
          expect.objectContaining({ square: 'd5', type: 'r' }),
        ]),
      }),
    );
  });

  it('should detect a value-winning fork when the forker is lower value than its targets', () => {
    const fen = 'k7/8/8/8/3N4/8/2q1r3/K7 w - - 0 1';
    const map = mapFor(fen);
    const forks = detectForks(fen, map);

    expect(forks).toContainEqual(
      expect.objectContaining({
        attacker: expect.objectContaining({ square: 'd4', type: 'n' }),
        targets: expect.arrayContaining([
          expect.objectContaining({ square: 'c2', type: 'q' }),
          expect.objectContaining({ square: 'e2', type: 'r' }),
        ]),
      }),
    );
    expect(map.c2.attackers).toHaveLength(1);
    expect(map.c2.defenders).toHaveLength(1);
    expect(map.e2.attackers).toHaveLength(1);
    expect(map.e2.defenders).toHaveLength(1);
  });
});

describe('detectHangingPieces', () => {
  it('should detect an undefended piece under attack', () => {
    const fen = '4k3/8/8/8/8/8/4r3/4K3 w - - 0 1';
    const hanging = detectHangingPieces(fen, mapFor(fen));

    expect(hanging).toContainEqual(
      expect.objectContaining({
        type: 'hanging_piece',
        piece: expect.objectContaining({ square: 'e1', type: 'k' }),
        attackers: expect.arrayContaining([
          expect.objectContaining({ square: 'e2', type: 'r' }),
        ]),
      }),
    );
  });

  it('should not flag a defended piece as hanging', () => {
    const fen = '3k4/8/8/4b3/3Q4/4B3/8/4K3 w - - 0 1';
    const hanging = detectHangingPieces(fen, mapFor(fen));

    expect(hanging.some((h) => h.piece.square === 'd4')).toBe(false);
  });

  it('should not flag a piece with no attackers as hanging', () => {
    const fen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
    const hanging = detectHangingPieces(fen, mapFor(fen));

    expect(hanging).toHaveLength(0);
  });
});

describe('detectOverloadedDefenders', () => {
  it('should detect a knight that is the sole defender of two attacked pieces', () => {
    const fen = '4k3/8/5N2/5q2/4P1N1/8/8/4K3 w - - 0 1';
    const map = mapFor(fen);

    expect(map.e4.defenders).toEqual([expect.objectContaining({ square: 'f6' })]);
    expect(map.g4.defenders).toEqual([expect.objectContaining({ square: 'f6' })]);
    expect(map.e4.attackers).toContainEqual(expect.objectContaining({ square: 'f5' }));
    expect(map.g4.attackers).toContainEqual(expect.objectContaining({ square: 'f5' }));

    const overloaded = detectOverloadedDefenders(fen, map);

    expect(overloaded).toContainEqual(
      expect.objectContaining({
        type: 'overloaded_defender',
        defender: expect.objectContaining({ square: 'f6', type: 'n' }),
        defendedSquares: expect.arrayContaining(['e4', 'g4']),
        threatenedPieces: expect.arrayContaining([
          expect.objectContaining({ square: 'e4' }),
          expect.objectContaining({ square: 'g4' }),
        ]),
      }),
    );
  });

  it('should not detect overload when a square has multiple defenders', () => {
    const fen = '3k4/8/8/4b3/3Q4/4B3/8/4K3 w - - 0 1';
    const overloaded = detectOverloadedDefenders(fen, mapFor(fen));

    expect(overloaded).toHaveLength(0);
  });

  it('should not detect overload when only one square is solely defended', () => {
    const fen = '4k3/8/4r3/3B4/3R4/2N5/8/4K3 w - - 0 1';
    const overloaded = detectOverloadedDefenders(fen, mapFor(fen));

    expect(overloaded).toHaveLength(0);
  });
});

describe('detectDivergentMotifs', () => {
  it('should aggregate fork, hanging, and overloaded motifs', () => {
    const fen = '4k3/8/5N2/5q2/4P1N1/8/8/4K3 w - - 0 1';
    const motifs = detectDivergentMotifs(fen, mapFor(fen));

    expect(motifs.some((m) => m.type === 'overloaded_defender')).toBe(true);
  });
});
