import type { Motif, PinMotif, SkewerMotif } from '../types/motifs';
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
import { hasAttacker } from './influence';

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
