import type {
  ForkMotif,
  HangingPieceMotif,
  Motif,
  OverloadedDefenderMotif,
  PieceMap,
} from '../types/motifs';
import type { Square } from '@mindboard/shared';
import type { InfluenceMap } from './influence';
import { isSquareTacticallyThreatened } from './influence';
import { getOccupiedSquares, isSamePiece, pieceValue, scanBoard } from './primitives';

const FORK_WEIGHT = 75;
const ROYAL_FORK_WEIGHT = 80;
const HANGING_WEIGHT = 50;
const OVERLOADED_WEIGHT = 45;

function pieceAttacksSquare(
  influenceMap: InfluenceMap,
  attacker: PieceMap,
  target: Square,
): boolean {
  const influence = influenceMap[target];
  return influence.attackers.some((a) => a.square === attacker.square);
}

/** Capturing the best target and losing the forker to recapture still wins material. */
function isValueWinningFork(attacker: PieceMap, targets: PieceMap[]): boolean {
  const attackerVal = pieceValue(attacker.type);
  const bestTargetVal = Math.max(...targets.map((t) => pieceValue(t.type)));
  return bestTargetVal > attackerVal;
}

export function detectForks(fen: string, influenceMap: InfluenceMap): ForkMotif[] {
  const board = scanBoard(fen);
  if (!board) return [];

  const forks: ForkMotif[] = [];
  const pieces = getOccupiedSquares(board);

  for (const attacker of pieces) {
    const targets: PieceMap[] = [];

    for (const occupant of pieces) {
      if (occupant.color === attacker.color) continue;
      if (!pieceAttacksSquare(influenceMap, attacker, occupant.square)) continue;
      targets.push(occupant);
    }

    if (targets.length < 2) continue;

    const isRoyalFork = targets.some((t) => t.type === 'k');
    const threatenedTargets = targets.filter((target) =>
      isSquareTacticallyThreatened(influenceMap[target.square], target),
    );

    // A fork must create a real dilemma: royal forks force a reply; otherwise at
    // least two targets are loose/underdefended, or the forker is worth less
    // than a defended target so capture-recapture still wins (e.g. knight forking
    // defended queen + rook). A single loose pawn plus a well-defended piece is
    // not a fork — it is just pressure on the loose target.
    if (
      !isRoyalFork &&
      threatenedTargets.length < 2 &&
      !isValueWinningFork(attacker, targets)
    ) {
      continue;
    }

    forks.push({
      type: 'fork',
      fen,
      forcingWeight: isRoyalFork ? ROYAL_FORK_WEIGHT : FORK_WEIGHT,
      attacker,
      targets,
      isRoyalFork,
    });
  }

  return forks;
}

export function detectHangingPieces(
  fen: string,
  influenceMap: InfluenceMap,
): HangingPieceMotif[] {
  const board = scanBoard(fen);
  if (!board) return [];

  const hanging: HangingPieceMotif[] = [];

  for (const piece of getOccupiedSquares(board)) {
    const influence = influenceMap[piece.square];
    if (influence.attackers.length > 0 && influence.defenders.length === 0) {
      hanging.push({
        type: 'hanging_piece',
        fen,
        forcingWeight: HANGING_WEIGHT,
        piece,
        attackers: [...influence.attackers],
      });
    }
  }

  return hanging;
}

export function detectOverloadedDefenders(
  fen: string,
  influenceMap: InfluenceMap,
): OverloadedDefenderMotif[] {
  const board = scanBoard(fen);
  if (!board) return [];

  const soleDefense = new Map<string, Square[]>();

  for (const occupant of getOccupiedSquares(board)) {
    const influence = influenceMap[occupant.square];
    if (influence.attackers.length === 0) continue;
    if (influence.defenders.length !== 1) continue;

    const defender = influence.defenders[0];
    const key = defender.square;
    const squares = soleDefense.get(key) ?? [];
    squares.push(occupant.square);
    soleDefense.set(key, squares);
  }

  const motifs: OverloadedDefenderMotif[] = [];

  for (const [defenderSquare, defendedSquares] of soleDefense) {
    if (defendedSquares.length < 2) continue;

    const defender = board[defendedSquares[0]]?.color
      ? influenceMap[defendedSquares[0]].defenders.find((d) => d.square === defenderSquare)
      : undefined;

    const defenderPiece =
      getOccupiedSquares(board).find((p) => p.square === defenderSquare) ?? defender;
    if (!defenderPiece) continue;

    const threatenedPieces = defendedSquares
      .map((sq) => board[sq])
      .filter((p): p is PieceMap => p !== null);

    motifs.push({
      type: 'overloaded_defender',
      fen,
      forcingWeight: OVERLOADED_WEIGHT,
      defender: defenderPiece,
      defendedSquares,
      threatenedPieces,
    });
  }

  return motifs;
}

export function detectDivergentMotifs(fen: string, influenceMap: InfluenceMap): Motif[] {
  return [
    ...detectForks(fen, influenceMap),
    ...detectHangingPieces(fen, influenceMap),
    ...detectOverloadedDefenders(fen, influenceMap),
  ];
}

export { isSamePiece };
