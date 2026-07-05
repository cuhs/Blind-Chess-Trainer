import { Chess } from 'chess.js';
import type { Square } from '@mindboard/shared';
import type { GeneratedTrainingPuzzle } from './types';
import { synthesizeOpeningLine } from '../position-synthesis/opening-lines';
import { pickFrom, seedToRng, puzzleId } from '../seed';

const PIECE_NAMES: Record<string, string> = {
  k: 'king',
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
  p: 'pawn',
};

function findPieceSquare(
  chess: Chess,
  color: 'w' | 'b',
  type: string,
): Square | null {
  for (let file = 0; file < 8; file += 1) {
    for (let rank = 1; rank <= 8; rank += 1) {
      const sq = `${'abcdefgh'[file]}${rank}` as Square;
      const piece = chess.get(sq);
      if (piece && piece.color === color && piece.type === type) {
        return sq;
      }
    }
  }
  return null;
}

function buildShallowStatePuzzle(seed: string): GeneratedTrainingPuzzle {
  const line = synthesizeOpeningLine(`shallow_state:${seed}`, 2, 5);
  const chess = new Chess(line.displayFen);
  const rng = seedToRng(`shallow_state_target:${seed}`);

  const queryables: Array<{ color: 'w' | 'b'; type: string; square: Square }> =
    [];
  for (let file = 0; file < 8; file += 1) {
    for (let rank = 1; rank <= 8; rank += 1) {
      const sq = `${'abcdefgh'[file]}${rank}` as Square;
      const piece = chess.get(sq);
      if (piece && piece.type !== 'k') {
        queryables.push({ color: piece.color, type: piece.type, square: sq });
      }
    }
  }

  if (queryables.length === 0) {
    throw new Error('No queryable pieces for shallow calc state');
  }

  const target = pickFrom(rng, queryables);
  const colorLabel = target.color === 'w' ? 'White' : 'Black';
  const pieceName = PIECE_NAMES[target.type] ?? 'piece';

  return {
    id: puzzleId('shallow_calc_state', seed),
    fen: line.fen,
    moves: line.moves,
    prompt: `Is the ${colorLabel} ${pieceName} still on ${target.square}?`,
    answerType: 'yes-no',
    expected: 'yes',
    squaresTouched: [target.square],
    subtitle: 'Follow the line, then verify.',
  };
}

function buildShallowAttackedPuzzle(seed: string): GeneratedTrainingPuzzle {
  const line = synthesizeOpeningLine(`shallow_attacked:${seed}`, 1, 4);
  const chess = new Chess(line.displayFen);
  const rng = seedToRng(`shallow_attacked_target:${seed}`);
  const byWhite = rng() < 0.5;
  const color = byWhite ? 'w' : 'b';
  const attackedColor = byWhite ? 'b' : 'w';

  const candidates: Square[] = [];
  for (let file = 0; file < 8; file += 1) {
    for (let rank = 1; rank <= 8; rank += 1) {
      const sq = `${'abcdefgh'[file]}${rank}` as Square;
      if (chess.get(sq)?.color === attackedColor) {
        candidates.push(sq);
      }
    }
  }

  const fallback = findPieceSquare(chess, attackedColor, 'p') ?? 'e5';
  const target = pickFrom(
    rng,
    candidates.length > 0 ? candidates : [fallback],
  );
  const expected = chess.isAttacked(target, color) ? 'yes' : 'no';
  const colorLabel = byWhite ? 'White' : 'Black';

  return {
    id: puzzleId('shallow_calc_attacked', seed),
    fen: line.fen,
    moves: line.moves,
    prompt: `Is ${target} attacked by ${colorLabel}?`,
    answerType: 'yes-no',
    expected,
    squaresTouched: [target],
    subtitle: 'Follow the line, then verify.',
  };
}

export function buildShallowCalcStatePuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildShallowStatePuzzle(seed);
}

export function buildShallowCalcAttackedPuzzle(
  seed: string,
): GeneratedTrainingPuzzle {
  return buildShallowAttackedPuzzle(seed);
}
