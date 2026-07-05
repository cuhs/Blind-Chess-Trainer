import { describe, expect, it } from 'vitest';
import { buildMoveNarrationScript } from './storyNarrationScript';

const AFTER_E4_FEN =
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';

describe('buildMoveNarrationScript', () => {
  it('formats alternating colors with spoken piece names from White', () => {
    const script = buildMoveNarrationScript(['Nf3', 'Nc6', 'Bc4', 'Nf6']);
    expect(script).toBe(
      'White plays Knight f3. Black plays Knight c6. White plays Bishop c4. Black plays Knight f6',
    );
  });

  it('respects the side to move in the starting FEN', () => {
    const script = buildMoveNarrationScript(['d5'], { fen: AFTER_E4_FEN });
    expect(script).toBe('Black plays d5');
  });

  it('expands captures and check by default', () => {
    const script = buildMoveNarrationScript(['Bxf7+']);
    expect(script).toBe('White plays Bishop takes f7, check');
  });

  it('can hide check so check puzzles stay fair', () => {
    const script = buildMoveNarrationScript(['Qxf7+'], { stripCheck: true });
    expect(script).toBe('White plays Queen takes f7');
    expect(script).not.toContain('check');
  });
});
