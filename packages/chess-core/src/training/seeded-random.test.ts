import { describe, expect, it } from 'vitest';
import { hashDateKey, shuffleDeterministic } from './seeded-random';

describe('seeded-random', () => {
  it('hashDateKey is stable for the same date', () => {
    expect(hashDateKey('2026-06-12')).toBe(hashDateKey('2026-06-12'));
  });

  it('hashDateKey differs across dates', () => {
    expect(hashDateKey('2026-06-12')).not.toBe(hashDateKey('2026-06-13'));
  });

  it('shuffleDeterministic is stable for the same seed', () => {
    const input = [1, 2, 3, 4, 5];
    expect(shuffleDeterministic(input, 42)).toEqual(
      shuffleDeterministic(input, 42),
    );
  });
});
