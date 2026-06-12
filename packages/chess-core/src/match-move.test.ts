import { describe, expect, it } from 'vitest';
import { normalizeMove, validateMove } from './match-move';

const START =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('normalizeMove', () => {
  it('accepts SAN', () => {
    expect(normalizeMove('e4')).toEqual({ ok: true, value: 'e4' });
    expect(normalizeMove('Nf3')).toEqual({ ok: true, value: 'Nf3' });
  });

  it('accepts spoken aliases', () => {
    expect(normalizeMove('knight f3')).toEqual({ ok: true, value: 'Nf3' });
    expect(normalizeMove('night f3')).toEqual({ ok: true, value: 'Nf3' });
  });

  it('rejects empty input', () => {
    expect(normalizeMove('')).toEqual({ ok: false });
  });
});

describe('validateMove', () => {
  it('accepts legal opening moves', () => {
    const result = validateMove(START, 'e4');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.san).toBe('e4');
  });

  it('rejects illegal moves', () => {
    const result = validateMove(START, 'e5');
    expect(result).toEqual({ ok: false, reason: 'Illegal move' });
  });
});
