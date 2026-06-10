import { describe, it, expect } from 'vitest';
import { rankMotifs } from './sorter';
import type {
  DiscoveredAttackMotif,
  ForkMotif,
  HangingPieceMotif,
  OverloadedDefenderMotif,
  PinMotif,
  SkewerMotif,
} from '../types/motifs';

const fen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';

function pin(weight: number, pinned: 'p' | 'n' = 'p'): PinMotif {
  return {
    type: 'pin',
    fen,
    forcingWeight: weight,
    pinKind: weight >= 90 ? 'absolute' : 'relative',
    attacker: { square: 'e7', type: 'r', color: 'b' },
    pinnedPiece: { square: 'e2', type: pinned, color: 'w' },
    kingBehind: { square: 'e1', type: 'k', color: 'w' },
  };
}

function fork(weight: number, targets: ForkMotif['targets']): ForkMotif {
  return {
    type: 'fork',
    fen,
    forcingWeight: weight,
    isRoyalFork: weight === 80,
    attacker: { square: 'd4', type: 'n', color: 'w' },
    targets,
  };
}

describe('rankMotifs', () => {
  it('should return null for an empty motif list', () => {
    expect(rankMotifs([])).toBeNull();
  });

  it('should prefer the higher forcing weight', () => {
    expect(rankMotifs([pin(60), pin(90)])?.forcingWeight).toBe(90);
  });

  it('should break ties by total piece value involved', () => {
    const pinOnPawn = pin(60, 'p');
    const pinOnKnight = pin(60, 'n');

    expect(rankMotifs([pinOnPawn, pinOnKnight])?.pinnedPiece.type).toBe('n');
  });

  it('should break ties for fork motifs by total target value', () => {
    const minorFork = fork(75, [
      { square: 'e2', type: 'n', color: 'b' },
      { square: 'c2', type: 'b', color: 'b' },
    ]);
    const majorFork = fork(75, [
      { square: 'e6', type: 'r', color: 'b' },
      { square: 'c6', type: 'q', color: 'b' },
    ]);

    expect(rankMotifs([minorFork, majorFork])?.targets[0].type).toBe('r');
  });

  it('should prefer a royal fork over a relative pin', () => {
    const royal = fork(80, [
      { square: 'e2', type: 'k', color: 'b' },
      { square: 'c2', type: 'q', color: 'b' },
    ]);

    expect(rankMotifs([pin(60), royal])?.type).toBe('fork');
  });

  it('should break ties for skewer motifs by total piece value', () => {
    const lowValue: SkewerMotif = {
      type: 'skewer',
      fen,
      forcingWeight: 70,
      attacker: { square: 'd6', type: 'r', color: 'b' },
      frontPiece: { square: 'd3', type: 'k', color: 'w' },
      rearPiece: { square: 'd2', type: 'p', color: 'w' },
    };
    const highValue: SkewerMotif = {
      ...lowValue,
      rearPiece: { square: 'd2', type: 'q', color: 'w' },
    };

    expect(rankMotifs([lowValue, highValue])?.rearPiece.type).toBe('q');
  });

  it('should break ties for hanging motifs by total piece value', () => {
    const pawnHanging: HangingPieceMotif = {
      type: 'hanging_piece',
      fen,
      forcingWeight: 50,
      piece: { square: 'e2', type: 'p', color: 'w' },
      attackers: [{ square: 'e7', type: 'r', color: 'b' }],
    };
    const queenHanging: HangingPieceMotif = {
      ...pawnHanging,
      piece: { square: 'd4', type: 'q', color: 'w' },
    };

    expect(rankMotifs([pawnHanging, queenHanging])?.piece.type).toBe('q');
  });

  it('should break ties for overloaded defender motifs by threatened piece value', () => {
    const low: OverloadedDefenderMotif = {
      type: 'overloaded_defender',
      fen,
      forcingWeight: 45,
      defender: { square: 'f6', type: 'n', color: 'w' },
      defendedSquares: ['e4', 'g4'],
      threatenedPieces: [
        { square: 'e4', type: 'p', color: 'w' },
        { square: 'g4', type: 'p', color: 'w' },
      ],
    };
    const high: OverloadedDefenderMotif = {
      ...low,
      threatenedPieces: [
        { square: 'e4', type: 'q', color: 'w' },
        { square: 'g4', type: 'p', color: 'w' },
      ],
    };

    expect(rankMotifs([low, high])?.threatenedPieces[0].type).toBe('q');
  });

  it('should break ties for discovered attacks by involved piece value', () => {
    const low: DiscoveredAttackMotif = {
      type: 'discovered_attack',
      fen,
      forcingWeight: 55,
      attacker: { square: 'b2', type: 'b', color: 'w' },
      target: { square: 'g7', type: 'p', color: 'b' },
      unmaskedBy: { square: 'c5', type: 'p', color: 'w' },
      isCheck: false,
    };
    const high: DiscoveredAttackMotif = {
      ...low,
      target: { square: 'g7', type: 'q', color: 'b' },
    };

    expect(rankMotifs([low, high])?.target.type).toBe('q');
  });
});
