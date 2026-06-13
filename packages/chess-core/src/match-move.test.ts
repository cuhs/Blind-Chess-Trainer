import { describe, expect, it } from 'vitest';
import { normalizeMove, resolveMove, validateMove } from './match-move';

const START =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const EXD5 =
  'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2';

const AMBIGUOUS_KNIGHTS = 'k7/8/8/8/8/5N2/8/1N4K1 w - - 0 1';

const PAWN_CAPTURE_PREFERS = '4k3/8/8/8/4p3/2NP4/8/4K3 w - - 0 1';

describe('normalizeMove', () => {
  it('accepts SAN', () => {
    expect(normalizeMove('e4')).toEqual({ ok: true, value: 'e4' });
    expect(normalizeMove('Nf3')).toEqual({ ok: true, value: 'Nf3' });
  });

  it('strips check and mate symbols', () => {
    expect(normalizeMove('Nf3+')).toEqual({ ok: true, value: 'Nf3' });
    expect(normalizeMove('Qh5#')).toEqual({ ok: true, value: 'Qh5' });
  });

  it('accepts spoken aliases', () => {
    expect(normalizeMove('knight f3')).toEqual({ ok: true, value: 'Nf3' });
    expect(normalizeMove('night f3')).toEqual({ ok: true, value: 'Nf3' });
  });

  it('accepts capture shorthand', () => {
    expect(normalizeMove('xd5')).toEqual({ ok: true, value: 'xd5' });
    expect(normalizeMove('takes d5')).toEqual({ ok: true, value: 'xd5' });
  });

  it('normalizes zeros castling to letter O', () => {
    expect(normalizeMove('0-0')).toEqual({ ok: true, value: 'O-O' });
  });

  it('rejects empty input', () => {
    expect(normalizeMove('')).toEqual({ ok: false });
  });
});

describe('resolveMove', () => {
  it('accepts legal opening moves', () => {
    const result = resolveMove(START, 'e4');
    expect(result).toEqual({ ok: true, san: 'e4' });
  });

  it('accepts moves with check or mate suffix', () => {
    const checkFen = 'rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 0 2';
    expect(resolveMove(checkFen, 'Qxf7+')).toEqual({ ok: true, san: 'Qxf7+' });
    expect(resolveMove(checkFen, 'Qxf7')).toEqual({ ok: true, san: 'Qxf7+' });

    const mateFen = '7k/6pp/8/8/8/8/6Q1/6K1 w - - 0 1';
    expect(resolveMove(mateFen, 'Qa8#')).toEqual({ ok: true, san: 'Qa8#' });
    expect(resolveMove(mateFen, 'Qa8')).toEqual({ ok: true, san: 'Qa8#' });
  });

  it('resolves pawn capture shorthand when unique', () => {
    expect(resolveMove(EXD5, 'xd5')).toEqual({ ok: true, san: 'exd5' });
    expect(resolveMove(EXD5, 'd5')).toEqual({ ok: true, san: 'exd5' });
    expect(resolveMove(EXD5, 'exd5')).toEqual({ ok: true, san: 'exd5' });
  });

  it('prefers pawn capture when multiple pieces can take the same square', () => {
    expect(resolveMove(PAWN_CAPTURE_PREFERS, 'xe4')).toEqual({ ok: true, san: 'dxe4' });
    expect(resolveMove(PAWN_CAPTURE_PREFERS, 'e4')).toEqual({ ok: true, san: 'dxe4' });
  });

  it('flags ambiguous knight moves', () => {
    const result = resolveMove(AMBIGUOUS_KNIGHTS, 'Nd2');
    expect(result.ok).toBe(false);
    if (result.ok || !('ambiguous' in result) || !result.ambiguous) {
      throw new Error('expected ambiguous result');
    }
    expect(result.prompt).toBe('Which knight?');
    expect(result.candidates.map((c) => c.san).sort()).toEqual(['Nbd2', 'Nfd2']);
  });

  it('accepts disambiguated knight moves', () => {
    expect(resolveMove(AMBIGUOUS_KNIGHTS, 'Nbd2')).toEqual({ ok: true, san: 'Nbd2' });
    expect(resolveMove(AMBIGUOUS_KNIGHTS, 'Nfd2')).toEqual({ ok: true, san: 'Nfd2' });
  });

  it('resolves destination-only moves when unique', () => {
    expect(resolveMove(START, 'e4')).toEqual({ ok: true, san: 'e4' });
  });

  it('accepts numeric castling notation', () => {
    const fen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
    expect(resolveMove(fen, '0-0')).toEqual({ ok: true, san: 'O-O' });
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

  it('returns prompt for ambiguous moves', () => {
    const result = validateMove(AMBIGUOUS_KNIGHTS, 'Nd2');
    expect(result).toEqual({ ok: false, reason: 'Which knight?' });
  });
});
