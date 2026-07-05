import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { eloProfile, getFallbackMove } from './fallbackEngine';

const START =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('eloProfile', () => {
  it('targets ~1200 with depth 3 and low blunder rate', () => {
    const profile = eloProfile(1200);
    expect(profile.depth).toBe(3);
    expect(profile.blunderRate).toBeCloseTo(0.077, 2);
    expect(profile.noiseCp).toBeCloseTo(79.5, 0);
  });

  it('plays much weaker at 300 than at 1200', () => {
    const weak = eloProfile(300);
    const mid = eloProfile(1200);
    expect(weak.blunderRate).toBeGreaterThan(mid.blunderRate);
    expect(weak.noiseCp).toBeGreaterThan(mid.noiseCp);
    expect(weak.blunderPoolStart).toBeGreaterThan(mid.blunderPoolStart);
  });
});

describe('getFallbackMove', () => {
  it('replies to 1.e4 with a main-line opening move at 1200', () => {
    const afterE4 = new Chess(START);
    afterE4.move('e4');

    const replies = new Set<string>();
    for (let i = 0; i < 48; i++) {
      replies.add(getFallbackMove(afterE4.fen(), 1200));
    }

    expect(replies.has('f5')).toBe(false);
    expect(
      replies.has('e5') || replies.has('c5') || replies.has('Nf6') || replies.has('e6'),
    ).toBe(true);
  }, 15_000);

  it('plays legal moves from the starting position at 1200', () => {
    const chess = new Chess(START);
    const san = getFallbackMove(START, 1200);
    expect(chess.move(san)).toBeTruthy();
  });
});
