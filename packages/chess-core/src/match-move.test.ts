import { describe, expect, it } from 'vitest';
import {
  buildMoveCandidates,
  normalizeMove,
  resolveDisambiguationVoice,
  resolveMove,
  validateMove,
} from './match-move';

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

  it('uppercases spoken piece shorthand', () => {
    expect(normalizeMove('rb2')).toEqual({ ok: true, value: 'Rb2' });
    expect(normalizeMove('nf3')).toEqual({ ok: true, value: 'Nf3' });
  });

  it('accepts piece to square phrasing', () => {
    expect(normalizeMove('rook to b2')).toEqual({ ok: true, value: 'Rb2' });
    expect(normalizeMove('rook b two')).toEqual({ ok: true, value: 'Rb2' });
  });

  it('accepts rook homophones', () => {
    expect(normalizeMove('are b2')).toEqual({ ok: true, value: 'Rb2' });
  });

  it('accepts spoken castling', () => {
    expect(normalizeMove('castle kingside')).toEqual({ ok: true, value: 'O-O' });
    expect(normalizeMove('castle queenside')).toEqual({ ok: true, value: 'O-O-O' });
  });

  it('accepts spoken rank in pawn moves', () => {
    expect(normalizeMove('e 2')).toEqual({ ok: true, value: 'e2' });
  });

  it('accepts piece letter and spoken name interchangeably', () => {
    expect(normalizeMove('n f3')).toEqual({ ok: true, value: 'Nf3' });
    expect(normalizeMove('N f 3')).toEqual({ ok: true, value: 'Nf3' });
    expect(normalizeMove('n f three')).toEqual({ ok: true, value: 'Nf3' });
  });

  it('accepts spoken piece captures', () => {
    expect(normalizeMove('knight takes d5')).toEqual({ ok: true, value: 'Nxd5' });
    expect(normalizeMove('N takes d5')).toEqual({ ok: true, value: 'Nxd5' });
    expect(normalizeMove('queen takes f7 check')).toEqual({ ok: true, value: 'Qxf7' });
  });

  it('strips spoken check and mate words', () => {
    expect(normalizeMove('knight f3 check')).toEqual({ ok: true, value: 'Nf3' });
    expect(normalizeMove('Qa8 mate')).toEqual({ ok: true, value: 'Qa8' });
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

  it('resolves spoken piece captures', () => {
    expect(resolveMove(EXD5, 'knight takes d5')).toEqual({
      ok: false,
      reason: 'Illegal move',
    });
    expect(resolveMove(EXD5, 'takes d5')).toEqual({ ok: true, san: 'exd5' });
    const rookCap = '4k3/8/8/4p3/8/4R3/8/4K3 w - - 0 1';
    expect(resolveMove(rookCap, 'rook takes e5')).toEqual({ ok: true, san: 'Rxe5+' });
    expect(resolveMove(rookCap, 'R takes e5')).toEqual({ ok: true, san: 'Rxe5+' });
  });

  it('accepts spoken check on forcing moves', () => {
    const checkFen = 'rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 0 2';
    expect(resolveMove(checkFen, 'queen takes f7 check')).toEqual({ ok: true, san: 'Qxf7+' });
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

  it('resolves spoken rook shorthand on a legal rook move', () => {
    const fen = '4k3/8/8/8/8/8/4R3/4K3 w - - 0 1';
    expect(resolveMove(fen, 'rb2')).toEqual({ ok: true, san: 'Rb2' });
    expect(resolveMove(fen, 'rook to b2')).toEqual({ ok: true, san: 'Rb2' });
  });
});

describe('buildMoveCandidates', () => {
  it('builds same-destination rook disambiguation options', () => {
    const fen = '4k3/8/8/8/8/8/8/R4R1K w - - 0 1';
    const { prompt, candidates } = buildMoveCandidates(fen, ['Rae1+', 'Rfe1+']);
    expect(prompt).toBe('Which rook?');
    expect(candidates.map((c) => c.san).sort()).toEqual(['Rae1+', 'Rfe1+']);
  });
});

describe('resolveDisambiguationVoice', () => {
  it('resolves file answers for ambiguous knights', () => {
    const fen = 'k7/8/8/8/8/5N2/8/1N4K1 w - - 0 1';
    const candidates = [
      { san: 'Nbd2', label: 'Knight on b1 to d2' },
      { san: 'Nfd2', label: 'Knight on f1 to d2' },
    ];

    expect(resolveDisambiguationVoice(fen, candidates, 'b-file')).toEqual({
      ok: true,
      san: 'Nbd2',
    });
    expect(resolveDisambiguationVoice(fen, candidates, 'the f file')).toEqual({
      ok: true,
      san: 'Nfd2',
    });
  });

  it('resolves origin square answers', () => {
    const fen = 'k7/8/8/8/8/5N2/8/1N4K1 w - - 0 1';
    const candidates = [
      { san: 'Nbd2', label: 'Knight on b1 to d2' },
      { san: 'Nfd2', label: 'Knight on f1 to d2' },
    ];

    expect(resolveDisambiguationVoice(fen, candidates, 'knight b1')).toEqual({
      ok: true,
      san: 'Nbd2',
    });
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
