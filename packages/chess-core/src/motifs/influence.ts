import { ALL_SQUARES, type Square } from '@mindboard/shared';
import type { SquareInfluence } from '../types/motifs';
import { getAttackSquares, getOccupiedSquares, scanBoard, isSamePiece } from './primitives';

export type InfluenceMap = Record<Square, SquareInfluence>;

function emptyInfluenceMap(): InfluenceMap {
  const map = {} as InfluenceMap;
  for (const square of ALL_SQUARES) {
    map[square] = { square, attackers: [], defenders: [] };
  }
  return map;
}

export function buildInfluenceMap(fen: string): InfluenceMap | null {
  const board = scanBoard(fen);
  if (!board) return null;

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

export function hasDefender(influence: SquareInfluence, piece: { square: Square }): boolean {
  return influence.defenders.some((d) => d.square === piece.square);
}

export function hasAttacker(influence: SquareInfluence, piece: { square: Square }): boolean {
  return influence.attackers.some((a) => a.square === piece.square);
}

export function findInfluenceForPiece(
  map: InfluenceMap,
  piece: { square: Square },
): SquareInfluence | undefined {
  return map[piece.square];
}

export { isSamePiece };
