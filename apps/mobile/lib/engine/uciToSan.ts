import { Chess } from 'chess.js';

/** Converts a UCI move (e2e4, e7e8q) to SAN for the given position. */
export function uciToSan(fen: string, uci: string): string {
  const chess = new Chess(fen);
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci[4] : undefined;
  const move = chess.move({ from, to, promotion });
  if (!move) {
    throw new Error(`Illegal engine move ${uci} for position`);
  }
  return move.san;
}
