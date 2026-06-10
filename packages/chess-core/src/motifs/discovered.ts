import type { DiscoveredAttackMotif, PieceMap } from '../types/motifs';
import { ALL_SQUARES, type Square } from '@mindboard/shared';
import { buildInfluenceMap } from './influence';
import {
  coordsToSquare,
  getOccupiedSquares,
  scanBoard,
  squareToCoords,
  type BoardState,
} from './primitives';

const DISCOVERED_CHECK_WEIGHT = 100;
const DISCOVERED_ATTACK_WEIGHT = 55;

interface MoveDiff {
  from: Square;
  to: Square;
  piece: PieceMap;
}

function diffMoves(previousFen: string, currentFen: string): MoveDiff[] {
  const prev = scanBoard(previousFen);
  const curr = scanBoard(currentFen);
  if (!prev || !curr) return [];

  const diffs: MoveDiff[] = [];

  for (const square of ALL_SQUARES) {
    const before = prev[square];
    const after = curr[square];
    if (!before || after) continue;

    const destination = getOccupiedSquares(curr).find(
      (p) => p.type === before.type && p.color === before.color && p.square !== square,
    );
    if (!destination) continue;

    const destBefore = prev[destination.square];
    if (!destBefore || destBefore.color !== before.color) {
      diffs.push({ from: square, to: destination.square, piece: before });
    }
  }

  return diffs;
}

function isOnLine(from: Square, through: Square, to: Square): boolean {
  const a = squareToCoords(from);
  const b = squareToCoords(through);
  const c = squareToCoords(to);

  const df1 = b.file - a.file;
  const dr1 = b.rank - a.rank;
  const df2 = c.file - b.file;
  const dr2 = c.rank - b.rank;

  const cross = df1 * dr2 - dr1 * df2;
  if (cross !== 0) return false;

  const dot = df1 * df2 + dr1 * dr2;
  if (dot <= 0) return false;

  const len1sq = df1 * df1 + dr1 * dr1;
  const len2sq = df2 * df2 + dr2 * dr2;
  return len2sq > 0 && len1sq > 0;
}

function movedOffLine(
  move: MoveDiff,
  attackerSquare: Square,
  targetSquare: Square,
  previousBoard: BoardState,
): boolean {
  const attacker = previousBoard[attackerSquare];
  if (!attacker || move.piece.color !== attacker.color) return false;
  if (!isOnLine(attackerSquare, move.from, targetSquare)) return false;
  return move.from !== attackerSquare && move.from !== targetSquare;
}

function attackerAttackedSquare(
  map: NonNullable<ReturnType<typeof buildInfluenceMap>>,
  attackerSquare: Square,
  targetSquare: Square,
): boolean {
  return map[targetSquare].attackers.some((a) => a.square === attackerSquare);
}

export function detectDiscoveredAttacks(
  previousFen: string,
  currentFen: string,
): DiscoveredAttackMotif[] {
  const prevBoard = scanBoard(previousFen);
  const currBoard = scanBoard(currentFen);
  if (!prevBoard || !currBoard) return [];

  const prevMap = buildInfluenceMap(previousFen);
  const currMap = buildInfluenceMap(currentFen);
  if (!prevMap || !currMap) return [];

  const moves = diffMoves(previousFen, currentFen);
  if (moves.length === 0) return [];

  const stationarySquares = new Set(
    getOccupiedSquares(currBoard)
      .filter((p) => prevBoard[p.square]?.type === p.type && prevBoard[p.square]?.color === p.color)
      .map((p) => p.square),
  );

  const discoveries: DiscoveredAttackMotif[] = [];

  for (const target of getOccupiedSquares(currBoard)) {
    const currAttackers = currMap[target.square].attackers;

    for (const attacker of currAttackers) {
      if (!stationarySquares.has(attacker.square)) continue;
      if (attackerAttackedSquare(prevMap, attacker.square, target.square)) continue;

      const unmaskMove = moves.find((m) =>
        movedOffLine(m, attacker.square, target.square, prevBoard),
      );
      if (!unmaskMove) continue;

      const isCheck = target.type === 'k' && target.color !== attacker.color;

      discoveries.push({
        type: 'discovered_attack',
        fen: currentFen,
        forcingWeight: isCheck ? DISCOVERED_CHECK_WEIGHT : DISCOVERED_ATTACK_WEIGHT,
        attacker,
        target,
        unmaskedBy: { ...unmaskMove.piece, square: unmaskMove.to },
        isCheck,
      });
    }
  }

  return discoveries;
}

export function squareBetween(from: Square, to: Square): Square[] {
  const a = squareToCoords(from);
  const b = squareToCoords(to);
  const df = Math.sign(b.file - a.file);
  const dr = Math.sign(b.rank - a.rank);

  const squares: Square[] = [];
  let f = a.file + df;
  let r = a.rank + dr;

  while (f !== b.file || r !== b.rank) {
    const sq = coordsToSquare(f, r);
    if (!sq) break;
    squares.push(sq);
    f += df;
    r += dr;
  }

  return squares;
}
