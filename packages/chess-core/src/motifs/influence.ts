import { ALL_SQUARES, type Square } from '@mindboard/shared';
import type { PieceMap, SquareInfluence } from '../types/motifs';
import {
  getAttackSquares,
  getOccupiedSquares,
  scanBoard,
  isSamePiece,
  type BoardState,
} from './primitives';

export type InfluenceMap = Record<Square, SquareInfluence>;

function emptyInfluenceMap(): InfluenceMap {
  const map = {} as InfluenceMap;
  for (const square of ALL_SQUARES) {
    map[square] = { square, attackers: [], defenders: [] };
  }
  return map;
}

export function buildInfluenceMapFromBoard(board: BoardState): InfluenceMap {
  const map = emptyInfluenceMap();
  const pieces = getOccupiedSquares(board);

  for (const piece of pieces) {
    const attackedSquares = getAttackSquares(piece, board);

    for (const target of attackedSquares) {
      const occupant = board[target];
      if (!occupant) continue;

      const influence = map[target];
      if (piece.color === occupant.color) {
        influence.defenders.push(piece);
      } else {
        influence.attackers.push(piece);
      }
    }
  }

  return map;
}

export function buildInfluenceMap(fen: string): InfluenceMap | null {
  const board = scanBoard(fen);
  if (!board) return null;

  return buildInfluenceMapFromBoard(board);
}

export function hasDefender(influence: SquareInfluence, piece: { square: Square }): boolean {
  return influence.defenders.some((d) => d.square === piece.square);
}

export function hasAttacker(influence: SquareInfluence, piece: { square: Square }): boolean {
  return influence.attackers.some((a) => a.square === piece.square);
}

/**
 * A square is tactically threatened when it is in check, undefended, or
 * attacked by more pieces than defend it (loose / underdefended).
 */
export function isSquareTacticallyThreatened(
  influence: SquareInfluence,
  occupant?: PieceMap | null,
): boolean {
  if (influence.attackers.length === 0) return false;
  if (occupant?.type === 'k') return true;
  return (
    influence.defenders.length === 0 ||
    influence.attackers.length > influence.defenders.length
  );
}

export function findInfluenceForPiece(
  map: InfluenceMap,
  piece: { square: Square },
): SquareInfluence | undefined {
  return map[piece.square];
}

export { isSamePiece };
