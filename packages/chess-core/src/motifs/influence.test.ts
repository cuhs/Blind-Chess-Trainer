import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { buildInfluenceMap, findInfluenceForPiece, hasDefender } from './influence';

describe('buildInfluenceMap', () => {
  it('should return null for an invalid FEN', () => {
    expect(buildInfluenceMap('not-a-fen')).toBeNull();
  });

  it('should leave empty squares without attackers or defenders', () => {
    const map = buildInfluenceMap('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
    expect(map).not.toBeNull();
    expect(map!.e4.attackers).toHaveLength(0);
    expect(map!.e4.defenders).toHaveLength(0);
  });

  it('should register a pinned knight as a defender of a square it pseudo-legally attacks', () => {
    const fen = '4k3/4q3/8/8/3Q4/8/4N3/4K3 w - - 0 1';
    const map = buildInfluenceMap(fen);
    expect(map).not.toBeNull();

    const d4 = map!.d4;
    expect(hasDefender(d4, { square: 'e2' })).toBe(true);

    const chess = new Chess(fen);
    const knightMoves = chess.moves({ square: 'e2', verbose: true });
    expect(knightMoves).toHaveLength(0);
  });

  it('should list both attackers and defenders on a contested square', () => {
    const fen = '3k4/8/8/4b3/3Q4/4B3/8/4K3 w - - 0 1';
    const map = buildInfluenceMap(fen);
    expect(map).not.toBeNull();

    const d4 = map!.d4;
    expect(d4.attackers.some((p) => p.square === 'e5' && p.type === 'b')).toBe(true);
    expect(d4.defenders.some((p) => p.square === 'e3' && p.type === 'b')).toBe(true);
    expect(d4.attackers.length).toBeGreaterThan(0);
    expect(d4.defenders.length).toBeGreaterThan(0);
  });

  it('should count enemy sliding pressure as attackers on an occupied square', () => {
    const fen = '4k3/4r3/8/8/8/8/4N3/4K3 w - - 0 1';
    const map = buildInfluenceMap(fen);
    expect(map).not.toBeNull();

    const e2 = map!.e2;
    expect(e2.attackers.some((p) => p.square === 'e7' && p.type === 'r')).toBe(true);
  });

  it('should treat pawn diagonal pressure as an attack on occupied squares', () => {
    const fen = '4k3/8/8/8/4p3/3P4/8/4K3 w - - 0 1';
    const map = buildInfluenceMap(fen)!;

    expect(map.e4.attackers).toContainEqual(
      expect.objectContaining({ square: 'd3', type: 'p', color: 'w' }),
    );
  });

  it('should look up influence for a piece by square', () => {
    const fen = '4k3/4r3/8/8/8/8/4P3/4K3 w - - 0 1';
    const map = buildInfluenceMap(fen)!;
    const piece = { square: 'e2' as const, type: 'p' as const, color: 'w' as const };

    expect(findInfluenceForPiece(map, piece)).toBe(map.e2);
  });
});
