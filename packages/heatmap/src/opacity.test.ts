import { describe, it, expect } from 'vitest';
import {
  getFogOpacity,
  isSquareCleared,
  getFogClearedPercent,
  getClarityPercent,
} from './opacity';
import type { Square } from '@mindboard/shared';

describe('getFogOpacity', () => {
  it('returns full fog with zero interactions', () => {
    expect(getFogOpacity('e4', 0)).toBe(1);
  });

  it('uses center threshold of 15', () => {
    expect(getFogOpacity('e4', 5)).toBeCloseTo(1 - 5 / 15);
  });

  it('uses corner threshold of 5', () => {
    expect(getFogOpacity('a1', 5)).toBe(0);
  });

  it('uses edge threshold of 10', () => {
    expect(getFogOpacity('a4', 5)).toBe(0.5);
  });
});

describe('isSquareCleared', () => {
  it('clears when interactions meet threshold', () => {
    expect(isSquareCleared('a1', 5)).toBe(true);
    expect(isSquareCleared('a1', 4)).toBe(false);
  });
});

describe('aggregate metrics', () => {
  it('returns low clarity after few interactions', () => {
    const ledger: Partial<Record<Square, number>> = {
      e4: 1,
      e1: 1,
      e8: 1,
      f3: 1,
    };
    expect(getClarityPercent(ledger)).toBeLessThan(15);
    expect(getFogClearedPercent(ledger)).toBe(0);
  });
});
