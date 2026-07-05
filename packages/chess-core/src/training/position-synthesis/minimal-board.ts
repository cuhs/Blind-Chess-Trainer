import { Chess } from 'chess.js';
import type { Color, PieceSymbol } from 'chess.js';
import type { Square } from '@mindboard/shared';
import {
  ALL_SQUARES,
  kingDistance,
  pickColor,
  pickFrom,
  pickPiece,
  pickSquare,
  seedToRng,
} from '../seed';

export interface PlacedPiece {
  square: Square;
  type: PieceSymbol;
  color: Color;
}

export interface MinimalBoardResult {
  fen: string;
  pieces: PlacedPiece[];
}

const PIECE_LABEL: Record<PieceSymbol, string> = {
  k: 'king',
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
  p: 'pawn',
};

export function piecePrompt(color: Color, type: PieceSymbol): string {
  const name = PIECE_LABEL[type];
  const colorName = color === 'w' ? 'White' : 'Black';
  return `Which square is the ${colorName} ${name} on?`;
}

function tryBuildFen(pieces: PlacedPiece[]): string | null {
  const chess = new Chess();
  chess.clear();

  for (const piece of pieces) {
    const ok = chess.put(
      { type: piece.type, color: piece.color },
      piece.square,
    );
    if (!ok) return null;
  }

  try {
    return chess.fen();
  } catch {
    return null;
  }
}

function isLegalMinimalPosition(fen: string): boolean {
  try {
    const chess = new Chess(fen);
    const board = chess.board();
    let whiteKings = 0;
    let blackKings = 0;
    for (const row of board) {
      for (const piece of row) {
        if (!piece) continue;
        if (piece.type === 'k' && piece.color === 'w') whiteKings += 1;
        if (piece.type === 'k' && piece.color === 'b') blackKings += 1;
      }
    }
    if (whiteKings !== 1 || blackKings !== 1) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Build a minimal legal position with exactly `totalPieces` on the board
 * (both kings included). Retries deterministically from seed.
 */
export function synthesizeMinimalBoard(
  totalPieces: number,
  seed: string,
  maxAttempts = 64,
): MinimalBoardResult {
  if (totalPieces < 2) {
    throw new Error('totalPieces must include both kings');
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const rng = seedToRng(`${seed}:board:${attempt}`);
    const occupied = new Set<Square>();
    const pieces: PlacedPiece[] = [];

    const whiteKing = pickSquare(rng);
    occupied.add(whiteKing);
    pieces.push({ square: whiteKing, type: 'k', color: 'w' });

    let blackKing: Square;
    do {
      blackKing = pickSquare(rng);
    } while (
      occupied.has(blackKing) ||
      kingDistance(whiteKing, blackKing) <= 1
    );
    occupied.add(blackKing);
    pieces.push({ square: blackKing, type: 'k', color: 'b' });

    const extraCount = totalPieces - 2;
    for (let i = 0; i < extraCount; i += 1) {
      let square: Square;
      do {
        square = pickSquare(rng);
      } while (occupied.has(square));
      occupied.add(square);
      pieces.push({
        square,
        type: pickPiece(rng),
        color: pickColor(rng),
      });
    }

    const fen = tryBuildFen(pieces);
    if (fen && isLegalMinimalPosition(fen)) {
      return { fen, pieces };
    }
  }

  throw new Error(
    `Failed to synthesize minimal board with ${totalPieces} pieces for seed ${seed}`,
  );
}

export function pickQueryPiece(
  pieces: PlacedPiece[],
  seed: string,
): PlacedPiece {
  const queryables = pieces.filter((piece) => piece.type !== 'k');
  if (queryables.length === 0) {
    throw new Error('No queryable pieces on minimal board');
  }
  const rng = seedToRng(`${seed}:query`);
  return pickFrom(rng, queryables);
}

export function allPieceSquares(pieces: PlacedPiece[]): Square[] {
  return [...new Set(pieces.map((piece) => piece.square))];
}

export function emptySquares(excluding: Square[]): Square[] {
  const blocked = new Set(excluding);
  return ALL_SQUARES.filter((square) => !blocked.has(square));
}
