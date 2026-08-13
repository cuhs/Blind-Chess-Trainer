import { describe, it, expect } from 'vitest';
import { buildInfluenceMap } from './influence';
import { detectLinearMotifs } from './linear';

function detect(fen: string) {
  const map = buildInfluenceMap(fen)!;
  return detectLinearMotifs(fen, map);
}

describe('detectLinearMotifs', () => {
  it('should detect an absolute pin when a rook pins a pawn to the king', () => {
    const fen = '4k3/4r3/8/8/8/8/4P3/4K3 w - - 0 1';
    const motifs = detect(fen);

    expect(motifs).toContainEqual(
      expect.objectContaining({
        type: 'pin',
        pinKind: 'absolute',
        pinnedPiece: expect.objectContaining({ square: 'e2', type: 'p' }),
        kingBehind: expect.objectContaining({ square: 'e1', type: 'k' }),
        attacker: expect.objectContaining({ square: 'e7', type: 'r' }),
        forcingWeight: 90,
      }),
    );
  });

  it('should detect a relative pin when a bishop pins a knight to the queen', () => {
    const fen = '3qk3/8/5n2/6B1/8/8/8/4K3 w - - 0 1';
    const motifs = detect(fen);

    expect(motifs).toContainEqual(
      expect.objectContaining({
        type: 'pin',
        pinKind: 'relative',
        pinnedPiece: expect.objectContaining({ square: 'f6', type: 'n' }),
        kingBehind: expect.objectContaining({ square: 'd8', type: 'q' }),
        attacker: expect.objectContaining({ square: 'g5', type: 'b' }),
        forcingWeight: 60,
      }),
    );
  });

  it('should detect a skewer when a rook attacks a king with a piece behind it', () => {
    const fen = '4k3/8/3r4/8/8/3K4/3B4/8 w - - 0 1';
    const motifs = detect(fen);

    expect(motifs).toContainEqual(
      expect.objectContaining({
        type: 'skewer',
        frontPiece: expect.objectContaining({ square: 'd3', type: 'k' }),
        rearPiece: expect.objectContaining({ square: 'd2', type: 'b' }),
        attacker: expect.objectContaining({ square: 'd6', type: 'r' }),
        forcingWeight: 70,
      }),
    );
  });

  it('should not detect a pin when an interposed piece breaks the line', () => {
    const fen = '4k3/4r3/8/4N3/8/8/4P3/4K3 w - - 0 1';
    const motifs = detect(fen).filter((m) => m.type === 'pin');

    expect(motifs).toHaveLength(0);
  });

  it('should not detect a pin when only one enemy piece sits on the ray', () => {
    const fen = '4k3/4r3/8/8/8/8/8/4K3 w - - 0 1';
    const motifs = detect(fen);

    expect(motifs).toHaveLength(0);
  });

  it('should detect a bishop absolute pin along a diagonal', () => {
    const fen = '4k3/8/2n5/1B6/8/8/8/4K3 w - - 0 1';
    const motifs = detect(fen).filter((m) => m.type === 'pin');

    expect(motifs).toContainEqual(
      expect.objectContaining({
        pinKind: 'absolute',
        attacker: expect.objectContaining({ square: 'b5', type: 'b' }),
        pinnedPiece: expect.objectContaining({ square: 'c6', type: 'n' }),
        kingBehind: expect.objectContaining({ square: 'e8', type: 'k' }),
      }),
    );
  });

  it('should not detect a pin when the pinned piece can capture the attacker', () => {
    const fen = '4k3/3r4/8/8/8/8/3Q4/3K4 w - - 0 1';
    const motifs = detect(fen).filter((m) => m.type === 'pin');

    expect(motifs).toHaveLength(0);
  });

  it('should not report a skewer when the rear piece is more valuable than the front piece', () => {
    const fen = '4k3/4r3/8/8/8/8/4P3/4K3 w - - 0 1';
    const motifs = detect(fen).filter((m) => m.type === 'skewer');

    expect(motifs).toHaveLength(0);
  });

  it('should detect a queen skewer when the king steps in front of a rook', () => {
    const fen = '4k3/8/8/3r4/8/3K4/8/3Q4 w - - 0 1';
    const motifs = detect(fen).filter((m) => m.type === 'skewer');

    expect(motifs).toContainEqual(
      expect.objectContaining({
        attacker: expect.objectContaining({ square: 'd5', type: 'r' }),
        frontPiece: expect.objectContaining({ square: 'd3', type: 'k' }),
        rearPiece: expect.objectContaining({ square: 'd1', type: 'q' }),
      }),
    );
  });

  it('should detect a skewer along a rank when a rook attacks a king with a queen behind', () => {
    const fen = '4k3/8/8/8/1r1K3Q/8/8/8 w - - 0 1';
    const motifs = detect(fen).filter((m) => m.type === 'skewer');

    expect(motifs).toContainEqual(
      expect.objectContaining({
        attacker: expect.objectContaining({ square: 'b4', type: 'r' }),
        frontPiece: expect.objectContaining({ square: 'd4', type: 'k' }),
        rearPiece: expect.objectContaining({ square: 'h4', type: 'q' }),
      }),
    );
  });

  it('should not detect linear motifs when the attacker does not actually attack the front piece', () => {
    const fen = '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1';
    const board = buildInfluenceMap(fen)!;
    board.e2.attackers = [];

    const motifs = detectLinearMotifs(fen, board).filter((m) => m.type === 'pin');

    expect(motifs).toHaveLength(0);
  });

  it('should detect a relative pin when a bishop pins a knight to a rook', () => {
    const fen = 'r3k3/8/8/8/8/5n2/6B1/4K3 w - - 0 1';
    const motifs = detect(fen).filter((m) => m.type === 'pin');

    expect(motifs).toContainEqual(
      expect.objectContaining({
        type: 'pin',
        pinKind: 'relative',
        pinnedPiece: expect.objectContaining({ square: 'f3', type: 'n' }),
        kingBehind: expect.objectContaining({ square: 'a8', type: 'r' }),
        attacker: expect.objectContaining({ square: 'g2', type: 'b' }),
      }),
    );
  });

  it('should detect an absolute pin when a queen pins a pawn to the king', () => {
    const fen = '4k3/8/8/8/4q3/8/4P3/4K3 w - - 0 1';
    const motifs = detect(fen).filter((m) => m.type === 'pin');

    expect(motifs).toContainEqual(
      expect.objectContaining({
        pinKind: 'absolute',
        pinnedPiece: expect.objectContaining({ square: 'e2', type: 'p' }),
        kingBehind: expect.objectContaining({ square: 'e1', type: 'k' }),
        attacker: expect.objectContaining({ square: 'e4', type: 'q' }),
      }),
    );
  });

  it('should not detect a relative pin when the rear is defended and not tactically capturable', () => {
    const fen = 'rn1qkb1r/1pppppp1/p6n/7p/3PP3/5Q2/PPP2PPP/RNB1KBNR w KQkq - 0 1';
    const motifs = detect(fen).filter((m) => m.type === 'pin');

    expect(motifs).toHaveLength(0);
  });

  it('should not detect a relative pin when removing the front piece still leaves the rear defended', () => {
    const fen = '4k3/8/8/8/8/8/4p3/3Q1B2 w - - 0 1';
    const motifs = detect(fen).filter((m) => m.type === 'pin');

    expect(motifs).toHaveLength(0);
  });
});
