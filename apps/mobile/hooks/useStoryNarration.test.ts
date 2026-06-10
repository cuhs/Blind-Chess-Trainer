import { describe, expect, it } from 'vitest';
import { buildMoveNarrationScript } from './storyNarrationScript';

describe('buildMoveNarrationScript', () => {
  it('formats alternating colors with spoken piece names', () => {
    const script = buildMoveNarrationScript(['Nf3', 'Nc6', 'Bc4', 'Nf6']);
    expect(script).toBe(
      'White plays Knight f3. Black plays Knight c6. White plays Bishop c4. Black plays Knight f6',
    );
  });

  it('expands captures and check', () => {
    const script = buildMoveNarrationScript(['Bxf7+']);
    expect(script).toBe('White plays Bishop takes f7, check');
  });
});
