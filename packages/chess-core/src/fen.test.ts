import { describe, expect, it } from 'vitest';
import { positionKeyFromFen } from './fen';

describe('positionKeyFromFen', () => {
  it('keeps the first four FEN fields', () => {
    expect(positionKeyFromFen('8/8/4k3/3n4/2B5/8/8/4K3 w - - 0 1')).toBe(
      '8/8/4k3/3n4/2B5/8/8/4K3 w - -',
    );
  });

  it('treats differing move counters as the same position', () => {
    const base = '8/8/4k3/3n4/2B5/8/8/4K3 w - -';
    expect(positionKeyFromFen(`${base} 0 1`)).toBe(
      positionKeyFromFen(`${base} 12 40`),
    );
  });
});
