import { Chess, type Square as ChessSquare } from 'chess.js';
import type { Square } from '@mindboard/shared';

export type PieceCode =
  | 'wp' | 'wn' | 'wb' | 'wr' | 'wq' | 'wk'
  | 'bp' | 'bn' | 'bb' | 'br' | 'bq' | 'bk';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const DISPLAY_RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

/** displayRank 0 = top (rank 8), 7 = bottom (rank 1). a1 is file 0, displayRank 7. */
export function squareFromIndex(file: number, displayRank: number): Square {
  return `${FILES[file]}${8 - displayRank}` as Square;
}

/** a1 (file 0, displayRank 7) is dark — light when (file + displayRank) % 2 === 0 */
export function isLightSquare(file: number, displayRank: number): boolean {
  return (file + displayRank) % 2 === 0;
}

export function parseBoard(fen: string): (PieceCode | null)[][] {
  const chess = new Chess(fen);
  const board: (PieceCode | null)[][] = [];

  for (let chessRank = 7; chessRank >= 0; chessRank--) {
    const row: (PieceCode | null)[] = [];
    for (let file = 0; file < 8; file++) {
      const square = `${FILES[file]}${chessRank + 1}` as ChessSquare;
      const piece = chess.get(square);
      if (piece) {
        row.push(`${piece.color}${piece.type}` as PieceCode);
      } else {
        row.push(null);
      }
    }
    board.push(row);
  }

  return board;
}

export function forEachDisplaySquare(
  callback: (file: number, displayRank: number, square: Square) => void,
): void {
  for (let displayRank = 0; displayRank < 8; displayRank++) {
    for (let file = 0; file < 8; file++) {
      callback(file, displayRank, squareFromIndex(file, displayRank));
    }
  }
}
