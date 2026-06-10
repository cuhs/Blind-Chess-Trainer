import { Chess, type Color, type PieceSymbol, type Square as ChessSquare } from 'chess.js';
import { ALL_SQUARES, type Square } from '@mindboard/shared';
import type { PieceMap } from '../types/motifs';

export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100,
};

export type BoardState = Record<Square, PieceMap | null>;

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

const ROOK_DIRS: [number, number][] = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
];

const BISHOP_DIRS: [number, number][] = [
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

const KNIGHT_OFFSETS: [number, number][] = [
  [2, 1], [2, -1], [-2, 1], [-2, -1],
  [1, 2], [1, -2], [-1, 2], [-1, -2],
];

const KING_OFFSETS: [number, number][] = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

export function toPieceMap(square: Square, type: PieceSymbol, color: Color): PieceMap {
  return { square, type, color };
}

export function squareToCoords(square: Square): { file: number; rank: number } {
  const file = FILES.indexOf(square[0] as (typeof FILES)[number]);
  const rank = parseInt(square[1], 10) - 1;
  return { file, rank };
}

export function coordsToSquare(file: number, rank: number): Square | null {
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return `${FILES[file]}${rank + 1}` as Square;
}

export function scanBoard(fen: string): BoardState | null {
  try {
    const chess = new Chess(fen);
    const board = {} as BoardState;

    for (const square of ALL_SQUARES) {
      const piece = chess.get(square as ChessSquare);
      if (piece) {
        board[square] = toPieceMap(square, piece.type, piece.color);
      } else {
        board[square] = null;
      }
    }

    return board;
  } catch {
    return null;
  }
}

export function slidingDirections(type: PieceSymbol): [number, number][] {
  if (type === 'r') return ROOK_DIRS;
  if (type === 'b') return BISHOP_DIRS;
  if (type === 'q') return [...ROOK_DIRS, ...BISHOP_DIRS];
  return [];
}

function pawnAttackDeltas(color: Color): [number, number][] {
  const forward = color === 'w' ? 1 : -1;
  return [[-1, forward], [1, forward]];
}

export function getAttackSquares(
  piece: PieceMap,
  board: BoardState,
): Square[] {
  const { file, rank } = squareToCoords(piece.square);
  const attacks: Square[] = [];

  if (piece.type === 'n') {
    for (const [df, dr] of KNIGHT_OFFSETS) {
      const sq = coordsToSquare(file + df, rank + dr);
      if (sq) attacks.push(sq);
    }
    return attacks;
  }

  if (piece.type === 'k') {
    for (const [df, dr] of KING_OFFSETS) {
      const sq = coordsToSquare(file + df, rank + dr);
      if (sq) attacks.push(sq);
    }
    return attacks;
  }

  if (piece.type === 'p') {
    for (const [df, dr] of pawnAttackDeltas(piece.color)) {
      const sq = coordsToSquare(file + df, rank + dr);
      if (sq) attacks.push(sq);
    }
    return attacks;
  }

  for (const [df, dr] of slidingDirections(piece.type)) {
    let f = file + df;
    let r = rank + dr;

    while (true) {
      const sq = coordsToSquare(f, r);
      if (!sq) break;

      attacks.push(sq);
      if (board[sq]) break;

      f += df;
      r += dr;
    }
  }

  return attacks;
}

export function pieceValue(type: PieceSymbol): number {
  return PIECE_VALUES[type];
}

export function isSamePiece(a: PieceMap, b: PieceMap): boolean {
  return a.square === b.square && a.type === b.type && a.color === b.color;
}

export function getOccupiedSquares(board: BoardState): PieceMap[] {
  return ALL_SQUARES.flatMap((sq) => {
    const piece = board[sq];
    return piece ? [piece] : [];
  });
}
