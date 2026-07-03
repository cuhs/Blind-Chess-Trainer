import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { generateSpokenVariants } from './phonetics';

function verboseMove(fen: string, san: string) {
  const chess = new Chess(fen);
  const move = chess.move(san);
  if (!move) throw new Error(`illegal ${san} for fen`);
  return move;
}

describe('generateSpokenVariants', () => {
  it('should include pawn push spoken forms', () => {
    const move = verboseMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'e4',
    );
    const variants = generateSpokenVariants('e4', move);
    expect(variants).toContain('e4');
    expect(variants).toContain('e four');
    expect(variants).toContain('pawn to e4');
    expect(variants).toContain('pawn to e four');
  });

  it('should include piece move collapsed and spaced rank forms', () => {
    const move = verboseMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'Nf3',
    );
    const variants = generateSpokenVariants('Nf3', move);
    expect(variants).toContain('nf3');
    expect(variants).toContain('knight to f 3');
    expect(variants).toContain('night f three');
  });

  it('should include capture spoken forms', () => {
    const fen = 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2';
    const move = verboseMove(fen, 'exd5');
    const variants = generateSpokenVariants('exd5', move);
    expect(variants).toContain('exd5');
    expect(variants).toContain('e takes d5');
    expect(variants).toContain('pawn takes d5');
  });

  it('should include rook capture spoken forms', () => {
    const fen = '4k3/8/8/4p3/8/4R3/8/4K3 w - - 0 1';
    const move = verboseMove(fen, 'Re4');
    const variants = generateSpokenVariants('Re4', move);
    expect(variants).toContain('re4');
    expect(variants).toContain('rook e four');
  });

  it('should include castling spoken forms', () => {
    expect(generateSpokenVariants('O-O')).toContain('castle kingside');
    expect(generateSpokenVariants('O-O')).toContain('0-0');
    expect(generateSpokenVariants('O-O-O')).toContain('castle queenside');
    expect(generateSpokenVariants('O-O-O')).toContain('0-0-0');
  });

  it('should include disambiguation origin hints', () => {
    const fen = 'k7/8/8/8/8/5N2/8/1N4K1 w - - 0 1';
    const move = verboseMove(fen, 'Nbd2');
    const variants = generateSpokenVariants('Nbd2', move);
    expect(variants).toContain('nbd2');
    expect(variants).toContain('b1');
    expect(variants).toContain('b file');
    expect(variants).toContain('b-file');
    expect(variants).toContain('knight on b1 to d2');
  });

  it('should not include duplicate phrases', () => {
    const move = verboseMove(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'e4',
    );
    const variants = generateSpokenVariants('e4', move);
    expect(variants.length).toBe(new Set(variants).size);
  });

  it('should return minimal output for empty san', () => {
    expect(generateSpokenVariants('')).toEqual([]);
    expect(generateSpokenVariants('   ')).toEqual([]);
  });

  it('should include check spoken suffixes for checking moves', () => {
    const checkFen = 'rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 0 2';
    const move = verboseMove(checkFen, 'Qxf7+');
    const variants = generateSpokenVariants('Qxf7+', move);
    expect(variants).toContain('queen takes f7 check');
    expect(variants).toContain('qxf7 check');
  });
});
