import { Chess } from 'chess.js';
import type { Square } from '@mindboard/shared';
import type { GeneratedTrainingPuzzle } from './types';

const EMPTY_BOARD = '8/8/8/8/8/8/8/8 w - - 0 1';

function blindCoordinatePuzzle(
  partial: Omit<
    GeneratedTrainingPuzzle,
    'showBoard' | 'fen' | 'moves'
  >,
): GeneratedTrainingPuzzle {
  return {
    ...partial,
    fen: EMPTY_BOARD,
    moves: [],
    showBoard: false,
  };
}

export function isLightSquare(square: Square): boolean {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = Number.parseInt(square[1]!, 10) - 1;
  return (file + rank) % 2 === 1;
}

function puzzleId(generatorId: string, seed: string): string {
  return `gen-${generatorId}-${seed.replace(/[^a-z0-9]/gi, '-')}`;
}

export function buildCoordinateColorPuzzle(seed: string): GeneratedTrainingPuzzle {
  const square = seed as Square;
  const light = isLightSquare(square);
  return blindCoordinatePuzzle({
    id: puzzleId('coordinate_color', seed),
    prompt: `Is ${square} a light square?`,
    answerType: 'yes-no',
    expected: light ? 'yes' : 'no',
    squaresTouched: [square],
    subtitle: 'Picture the grid in your head — no board shown.',
  });
}

export function buildCoordinateNeighborPuzzle(seed: string): GeneratedTrainingPuzzle {
  const [square, axis] = seed.split(':') as [Square, 'rank' | 'file'];
  const file = square.charCodeAt(0);
  const rank = Number.parseInt(square[1]!, 10);

  let expected: Square;
  let prompt: string;
  if (axis === 'rank') {
    expected = `${square[0]}${rank + 1}` as Square;
    prompt = `Which square is one rank above ${square}?`;
  } else {
    expected = `${String.fromCharCode(file + 1)}${square[1]}` as Square;
    prompt = `Which square is one file to the right of ${square}?`;
  }

  return blindCoordinatePuzzle({
    id: puzzleId('coordinate_neighbor', seed),
    prompt,
    inputPlaceholder: 'e.g. a8',
    answerType: 'square',
    expected,
    squaresTouched: [square, expected],
    subtitle: 'Navigate the grid from memory.',
  });
}

export function buildCoordinateKnightReachPuzzle(
  seed: string,
): GeneratedTrainingPuzzle {
  const [from, to] = seed.split(':') as [Square, Square];
  const chess = new Chess();
  chess.remove('a1' as Square);
  chess.put({ type: 'n', color: 'w' }, from);
  const reachable = chess.moves({ square: from, verbose: true });
  const canReach = reachable.some((move) => move.to === to);

  return blindCoordinatePuzzle({
    id: puzzleId('coordinate_knight_reach', seed),
    prompt: `Can a knight on ${from} reach ${to} in one jump?`,
    answerType: 'yes-no',
    expected: canReach ? 'yes' : 'no',
    squaresTouched: [from, to],
    subtitle: 'Knight geometry — no board shown.',
  });
}
