import { describe, it, expect } from 'vitest';
import { analyzePosition } from './index';
import { detectOverloadedDefenders } from './divergent';
import { buildInfluenceMap } from './influence';
import { motifToResult, pieceToSanRef } from './adapters';

describe('pieceToSanRef', () => {
  it('should format a bishop on c4', () => {
    expect(pieceToSanRef({ square: 'c4', type: 'b', color: 'w' })).toBe('Bc4');
  });

  it('should format a pawn as its square only', () => {
    expect(pieceToSanRef({ square: 'e4', type: 'p', color: 'w' })).toBe('e4');
  });
});

describe('motifToResult', () => {
  it('should map a pin to MotifResult JSON', () => {
    const fen = '8/8/4k3/3n4/2B5/8/8/4K3 w - - 0 1';
    const motif = analyzePosition(fen);
    expect(motif?.type).toBe('pin');
    if (motif?.type !== 'pin') return;

    expect(motifToResult(motif)).toEqual({
      motif: 'pin',
      attacker: 'Bc4',
      target: 'Nd5',
      pinned_to: 'Ke6',
    });
  });

  it('should map a discovered attack to MotifResult JSON', () => {
    const previousFen = '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1';
    const currentFen = '4k3/6q1/8/2P5/8/8/1B6/4K3 w - - 0 1';
    const motif = analyzePosition(currentFen, previousFen);
    expect(motif?.type).toBe('discovered_attack');
    if (motif?.type !== 'discovered_attack') return;

    expect(motifToResult(motif)).toEqual({
      motif: 'discovered_attack',
      attacker: 'Bb2',
      target: 'Qg7',
      square: 'c5',
    });
  });

  it('should map an overloaded defender to MotifResult JSON', () => {
    const fen = '4k3/8/5N2/5q2/4P1N1/8/8/4K3 w - - 0 1';
    const map = buildInfluenceMap(fen)!;
    const motif = detectOverloadedDefenders(fen, map)[0];
    expect(motif?.type).toBe('overloaded_defender');

    expect(motifToResult(motif)).toMatchObject({
      motif: 'overloaded_defender',
      square: 'f6',
      attacker: 'Nf6',
    });
  });

  it('should map a fork to MotifResult JSON', () => {
    const fen = 'k7/8/8/5r2/3N4/8/2q5/K7 w - - 0 1';
    const motif = analyzePosition(fen);
    expect(motif?.type).toBe('fork');
    if (motif?.type !== 'fork') return;

    expect(motifToResult(motif)).toMatchObject({
      motif: 'fork',
      attacker: 'Nd4',
      square: 'd4',
    });
  });

  it('should map a skewer to MotifResult JSON', () => {
    const fen = '4k3/8/3r4/8/8/3K4/3B4/8 w - - 0 1';
    const motif = analyzePosition(fen);
    expect(motif?.type).toBe('skewer');
    if (motif?.type !== 'skewer') return;

    expect(motifToResult(motif)).toMatchObject({
      motif: 'skewer',
      attacker: 'Rd6',
      target: 'Kd3',
      square: 'd2',
    });
  });

  it('should map a hanging piece to MotifResult JSON', () => {
    const fen = '4k3/8/8/8/8/8/4r3/4K3 w - - 0 1';
    const motif = analyzePosition(fen);
    expect(motif?.type).toBe('hanging_piece');
    if (motif?.type !== 'hanging_piece') return;

    expect(motifToResult(motif)).toMatchObject({
      motif: 'hanging_piece',
      target: 'Ke1',
      square: 'e1',
    });
  });
});
