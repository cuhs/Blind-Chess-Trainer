import { describe, expect, it } from 'vitest';
import {
  prepareMoveTranscript,
  normalizeSpokenMove,
} from './transcript';

describe('prepareMoveTranscript', () => {
  it('trims whitespace and trailing punctuation', () => {
    expect(prepareMoveTranscript('  knight f3.  ')).toBe('knight f3');
    expect(prepareMoveTranscript('e4!')).toBe('e4');
  });

  it('preserves check symbols inside the move', () => {
    expect(prepareMoveTranscript('Nf3+')).toBe('Nf3+');
  });
});

describe('normalizeSpokenMove', () => {
  it('strips filler and converts spoken ranks', () => {
    expect(normalizeSpokenMove('um play knight f three')).toBe('knight f 3');
    expect(normalizeSpokenMove('e two')).toBe('e 2');
    expect(normalizeSpokenMove('rook to be two')).toBe('rook to b 2');
  });

  it('normalizes connectors', () => {
    expect(normalizeSpokenMove('rook to the b2')).toBe('rook to b2');
  });
});
