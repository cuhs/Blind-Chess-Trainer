import { describe, it, expect } from 'vitest';
import { normalizeSquare, normalizeYesNo } from './normalize';

describe('normalizeSquare', () => {
  const cases: [string, boolean, string?][] = [
    ['e4', true, 'e4'],
    ['E4', true, 'e4'],
    [' e4 ', true, 'e4'],
    ['z9', false],
    ['', false],
  ];

  it.each(cases)('normalizes %s', (input, ok, expected) => {
    const result = normalizeSquare(input);
    expect(result.ok).toBe(ok);
    if (ok && expected) {
      expect(result).toEqual({ ok: true, value: expected });
    }
  });
});

describe('normalizeYesNo', () => {
  const cases: [string, boolean, 'yes' | 'no'?][] = [
    ['yes', true, 'yes'],
    ['Yes', true, 'yes'],
    ['y', true, 'yes'],
    ['no', true, 'no'],
    ['N', true, 'no'],
    ['maybe', false],
  ];

  it.each(cases)('normalizes %s', (input, ok, expected) => {
    const result = normalizeYesNo(input);
    expect(result.ok).toBe(ok);
    if (ok && expected) {
      expect(result).toEqual({ ok: true, value: expected });
    }
  });
});
