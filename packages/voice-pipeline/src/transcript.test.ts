import { describe, expect, it } from 'vitest';
import { prepareMoveTranscript } from './transcript';

describe('prepareMoveTranscript', () => {
  it('trims whitespace and trailing punctuation', () => {
    expect(prepareMoveTranscript('  knight f3.  ')).toBe('knight f3');
    expect(prepareMoveTranscript('e4!')).toBe('e4');
  });

  it('preserves check symbols inside the move', () => {
    expect(prepareMoveTranscript('Nf3+')).toBe('Nf3+');
  });
});
