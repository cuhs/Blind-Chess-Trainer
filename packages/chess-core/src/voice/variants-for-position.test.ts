import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { spokenVariantsForPosition } from './variants-for-position';

const START =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const AMBIGUOUS_KNIGHTS = 'k7/8/8/8/8/5N2/8/1N4K1 w - - 0 1';

describe('spokenVariantsForPosition', () => {
  it('should produce variants for every legal move in the starting position', () => {
    const variants = spokenVariantsForPosition(START);
    const chess = new Chess(START);
    const legalSans = new Set(chess.moves());

    expect(variants.length).toBeGreaterThan(0);
    for (const san of legalSans) {
      expect(variants.some((variant) => variant.san === san)).toBe(true);
    }
  });

  it('should restrict to disambiguation candidates when provided', () => {
    const variants = spokenVariantsForPosition(AMBIGUOUS_KNIGHTS, {
      candidates: [
        { san: 'Nbd2', label: 'Knight on b1 to d2' },
        { san: 'Nfd2', label: 'Knight on f1 to d2' },
      ],
    });

    const sans = new Set(variants.map((variant) => variant.san));
    expect(sans).toEqual(new Set(['Nbd2', 'Nfd2']));
    expect(variants.some((variant) => variant.phrase === 'b file')).toBe(true);
    expect(variants.some((variant) => variant.phrase === 'f file')).toBe(true);
  });

  it('should cover all legal moves in a heavy tactical position', () => {
    const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/3P4/8/PPP1PPPP/RNB1KBNR w KQkq - 0 4';
    const variants = spokenVariantsForPosition(fen);
    const legalSans = new Set(new Chess(fen).moves());

    for (const san of legalSans) {
      expect(variants.some((variant) => variant.san === san)).toBe(true);
    }
  });
});
