import type { Motif, PieceMap, PinMotif, SkewerMotif } from '../types/motifs';
import type { InfluenceMap } from './influence';
import {
  coordsToSquare,
  getAttackSquares,
  getOccupiedSquares,
  pieceValue,
  scanBoard,
  slidingDirections,
  squareToCoords,
  type BoardState,
} from './primitives';
import { buildInfluenceMapFromBoard, hasAttacker } from './influence';

const PIN_WEIGHT = { absolute: 90, relative: 60 } as const;
const SKEWER_WEIGHT = 70;

function walkRay(
  board: BoardState,
  startFile: number,
  startRank: number,
  df: number,
  dr: number,
): { square: string; piece: NonNullable<BoardState[keyof BoardState]> }[] {
  const hits: { square: string; piece: NonNullable<BoardState[keyof BoardState]> }[] = [];
  let f = startFile + df;
  let r = startRank + dr;

  while (true) {
    const sq = coordsToSquare(f, r);
    if (!sq) break;

    const occupant = board[sq];
    if (occupant) {
      hits.push({ square: sq, piece: occupant });
      break;
    }

    f += df;
    r += dr;
  }

  return hits;
}

function continueRayPast(
  board: BoardState,
  file: number,
  rank: number,
  df: number,
  dr: number,
): { square: string; piece: NonNullable<BoardState[keyof BoardState]> } | null {
  let f = file + df;
  let r = rank + dr;

  while (true) {
    const sq = coordsToSquare(f, r);
    if (!sq) return null;

    const occupant = board[sq];
    if (occupant) {
      return { square: sq, piece: occupant };
    }

    f += df;
    r += dr;
  }
}

function isSlidingPiece(type: string): boolean {
  return type === 'q' || type === 'r' || type === 'b';
}

function confirmsAttack(influenceMap: InfluenceMap, attackerSquare: string, targetSquare: string): boolean {
  return hasAttacker(influenceMap[targetSquare as keyof InfluenceMap], { square: attackerSquare as never });
}

function captureWinsMaterial(attacker: PieceMap, rear: PieceMap): boolean {
  return pieceValue(rear.type) > pieceValue(attacker.type);
}

/**
 * With the front blocker gone, the rear must be attacked by the pin attacker and
 * capturable: undefended, or underdefended with a profitable attacker, or the
 * pin attacker can win the exchange even when defenders match.
 */
function isRearCapturableIfFrontRemoved(
  board: BoardState,
  attacker: PieceMap,
  frontSq: string,
  rear: PieceMap,
): boolean {
  const cleared: BoardState = { ...board, [frontSq]: null };
  if (!getAttackSquares(attacker, cleared).includes(rear.square as never)) {
    return false;
  }

  if (rear.type === 'k') return true;

  const influence = buildInfluenceMapFromBoard(cleared)[rear.square];
  const { attackers, defenders } = influence;

  if (attackers.length === 0) return false;
  if (defenders.length === 0) return true;

  const profitableAttackers = attackers.filter((a) => captureWinsMaterial(a, rear));
  if (profitableAttackers.length === 0) return false;

  return (
    attackers.length > defenders.length ||
    profitableAttackers.some((a) => a.square === attacker.square)
  );
}

export function detectLinearMotifs(fen: string, influenceMap: InfluenceMap): Motif[] {
  const board = scanBoard(fen);
  if (!board) return [];

  const motifs: Motif[] = [];
  const pieces = getOccupiedSquares(board).filter((p) => isSlidingPiece(p.type));

  for (const attacker of pieces) {
    const { file, rank } = squareToCoords(attacker.square);

    for (const [df, dr] of slidingDirections(attacker.type)) {
      const firstHit = walkRay(board, file, rank, df, dr);
      if (firstHit.length === 0) continue;

      const { square: frontSq, piece: front } = firstHit[0];
      if (front.color === attacker.color) continue;
      if (!confirmsAttack(influenceMap, attacker.square, frontSq)) continue;

      const { file: ff, rank: fr } = squareToCoords(frontSq as never);
      const rearHit = continueRayPast(board, ff, fr, df, dr);
      if (!rearHit) continue;

      const { piece: rear } = rearHit;
      if (rear.color !== front.color) continue;

      const frontVal = pieceValue(front.type);
      const rearVal = pieceValue(rear.type);

      if (rearVal > frontVal) {
        const frontCanCaptureAttacker = getAttackSquares(front, board).includes(
          attacker.square as never,
        );
        if (frontCanCaptureAttacker) continue;
        if (!isRearCapturableIfFrontRemoved(board, attacker, frontSq, rear)) continue;

        const pinKind = rear.type === 'k' ? 'absolute' : 'relative';
        const pin: PinMotif = {
          type: 'pin',
          fen,
          forcingWeight: PIN_WEIGHT[pinKind],
          attacker,
          pinnedPiece: front,
          kingBehind: rear,
          pinKind,
        };
        motifs.push(pin);
      } else if (
        frontVal > rearVal &&
        (front.type === 'k' || front.type === 'q')
      ) {
        const skewer: SkewerMotif = {
          type: 'skewer',
          fen,
          forcingWeight: SKEWER_WEIGHT,
          attacker,
          frontPiece: front,
          rearPiece: rear,
        };
        motifs.push(skewer);
      }
    }
  }

  return motifs;
}
