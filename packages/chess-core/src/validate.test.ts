import { describe, it, expect } from 'vitest';
import { validateAnswer, isInCheck, applyMoves } from './validate';

describe('validateAnswer', () => {
  it('validates square answers', () => {
    expect(validateAnswer('square', 'e4', 'e4')).toBe(true);
    expect(validateAnswer('square', 'E4', 'e4')).toBe(true);
    expect(validateAnswer('square', 'd4', 'e4')).toBe(false);
  });

  it('validates yes/no with move application', () => {
    const fen = 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
    const moves = ['Nf3', 'd5'];
    expect(validateAnswer('yes-no', 'no', 'no', fen, moves)).toBe(true);
    expect(validateAnswer('yes-no', 'yes', 'no', fen, moves)).toBe(false);
  });

  it('validates yes/no against the expected answer when no moves are given', () => {
    expect(validateAnswer('yes-no', 'YES', 'yes')).toBe(true);
    expect(validateAnswer('yes-no', 'n', 'no')).toBe(true);
    expect(validateAnswer('yes-no', 'yes', 'no')).toBe(false);
  });

  it('rejects unparseable input for both answer types', () => {
    expect(validateAnswer('square', 'z9', 'e4')).toBe(false);
    expect(validateAnswer('yes-no', 'maybe', 'yes')).toBe(false);
  });
});

describe('isInCheck', () => {
  it('detects check', () => {
    const fen = 'rnb1kbnr/pppp1ppp/4p3/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2';
    expect(isInCheck(fen)).toBe(false);
  });
});

describe('applyMoves', () => {
  it('applies SAN sequence', () => {
    const fen = 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
    const result = applyMoves(fen, ['Nf3', 'd5']);
    expect(result).toContain('5N2');
    expect(result).toContain('3p4');
  });
});
