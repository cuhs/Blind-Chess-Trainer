import { describe, expect, it } from 'vitest';
import { buildContextualStrings } from './build-contextual-strings';
import { pickBestTranscript } from './pick-transcript';

const START =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const AMBIGUOUS_KNIGHTS = 'k7/8/8/8/8/5N2/8/1N4K1 w - - 0 1';

describe('buildContextualStrings', () => {
  it('includes static chess vocabulary and legal moves', () => {
    const strings = buildContextualStrings(START);
    expect(strings).toContain('e4');
    expect(strings).toContain('Nf3');
    expect(strings).toContain('a-file');
  });

  it('adds disambiguation candidate hints', () => {
    const strings = buildContextualStrings(AMBIGUOUS_KNIGHTS, {
      candidates: [
        { san: 'Nbd2', label: 'Knight on b1 to d2' },
        { san: 'Nfd2', label: 'Knight on f1 to d2' },
      ],
    });
    expect(strings).toContain('Nbd2');
    expect(strings).toContain('b-file');
    expect(strings).toContain('f-file');
    expect(strings).toContain('b1');
    expect(strings).toContain('knight b1');
  });
});

describe('pickBestTranscript', () => {
  it('prefers an alternative that resolves to a legal move', () => {
    const picked = pickBestTranscript(['e two', 'e4', 'bee four'], START);
    expect(picked).toBe('e4');
  });
});
