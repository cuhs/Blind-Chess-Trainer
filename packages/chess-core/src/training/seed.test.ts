import { describe, expect, it } from 'vitest';
import { deriveNodePuzzleSeed } from './daily-selection';
import { buildTrainingPuzzleSpec } from './generators';

describe('deriveNodePuzzleSeed', () => {
  it('preserves curriculum seeds on a fresh session', () => {
    expect(deriveNodePuzzleSeed('node-1-2', 'e4:rank', 'fresh')).toBe('e4:rank');
  });

  it('varies seeds on retry sessions without breaking colon-delimited formats', () => {
    const derived = deriveNodePuzzleSeed('node-1-2', 'e4:rank', 'retry-1');
    expect(derived).not.toBe('e4:rank');
    expect(() =>
      buildTrainingPuzzleSpec('coordinate_neighbor', derived),
    ).not.toThrow();
  });
});
