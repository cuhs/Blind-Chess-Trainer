import { Chess } from 'chess.js';
import type { Square } from '@mindboard/shared';
import type { GeneratedTrainingPuzzle } from './types';
import { isOnBoard, pickFrom, pickSquare, puzzleId, seedToRng } from '../seed';

const EMPTY_BOARD = '8/8/8/8/8/8/8/8 w - - 0 1';

function blindCoordinatePuzzle(
  partial: Omit<GeneratedTrainingPuzzle, 'showBoard' | 'fen' | 'moves'>,
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

export function buildCoordinateColorPuzzle(seed: string): GeneratedTrainingPuzzle {
  const square = /^[a-h][1-8]$/.test(seed)
    ? (seed as Square)
    : pickSquare(seedToRng(`coordinate_color:${seed}`));
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

function neighborExpected(square: Square, axis: 'rank' | 'file'): Square {
  const file = square.charCodeAt(0);
  const rank = Number.parseInt(square[1]!, 10);
  return axis === 'rank'
    ? (`${square[0]}${rank + 1}` as Square)
    : (`${String.fromCharCode(file + 1)}${square[1]}` as Square);
}

export function buildCoordinateNeighborPuzzle(seed: string): GeneratedTrainingPuzzle {
  if (seed.includes(':')) {
    const [square, axis] = seed.split(':') as [Square, 'rank' | 'file'];
    const expected = neighborExpected(square, axis);
    if (!isOnBoard(expected)) {
      throw new Error(`Neighbor off board for seed ${seed}`);
    }
    const prompt =
      axis === 'rank'
        ? `Which square is one rank above ${square}?`
        : `Which square is one file to the right of ${square}?`;
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

  const rng = seedToRng(`coordinate_neighbor:${seed}`);
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const square = pickSquare(rng);
    const axis = pickFrom(rng, ['rank', 'file'] as const);
    const expected = neighborExpected(square, axis);
    if (!isOnBoard(expected)) continue;
    const prompt =
      axis === 'rank'
        ? `Which square is one rank above ${square}?`
        : `Which square is one file to the right of ${square}?`;
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

  throw new Error(`Failed to build coordinate_neighbor for seed ${seed}`);
}

export function buildCoordinateKnightReachPuzzle(
  seed: string,
): GeneratedTrainingPuzzle {
  let from: Square;
  let to: Square;

  if (seed.includes(':')) {
    [from, to] = seed.split(':') as [Square, Square];
  } else {
    const rng = seedToRng(`coordinate_knight_reach:${seed}`);
    from = pickSquare(rng);
    to = pickSquare(rng);
  }

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
