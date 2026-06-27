import { describe, expect, it } from 'vitest';
import { buildContextualStrings } from './build-contextual-strings';

const START =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const AMBIGUOUS_KNIGHTS = 'k7/8/8/8/8/5N2/8/1N4K1 w - - 0 1';

const HEAVY_TACTICAL =
  'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/3P4/8/PPP1PPPP/RNB1KBNR w KQkq - 0 4';

describe('buildContextualStrings', () => {
  it('should stay within the iOS contextualStrings limit', () => {
    expect(buildContextualStrings(START).length).toBeLessThanOrEqual(100);
    expect(buildContextualStrings(HEAVY_TACTICAL).length).toBeLessThanOrEqual(100);
  });

  it('should include spoken forms for legal moves', () => {
    const strings = buildContextualStrings(START);
    expect(strings).toContain('e4');
    expect(strings).toContain('knight f3');
    expect(strings).toContain('e four');
  });

  it('should add disambiguation candidate hints', () => {
    const strings = buildContextualStrings(AMBIGUOUS_KNIGHTS, {
      candidates: [
        { san: 'Nbd2', label: 'Knight on b1 to d2' },
        { san: 'Nfd2', label: 'Knight on f1 to d2' },
      ],
    });
    expect(strings).toContain('Nbd2');
    expect(strings).toContain('b file');
    expect(strings).toContain('f file');
  });
});
