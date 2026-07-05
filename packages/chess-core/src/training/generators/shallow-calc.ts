import { Chess } from 'chess.js';
import type { Square } from '@mindboard/shared';
import { applyMoves } from '../../validate';
import type { GeneratedTrainingPuzzle } from './types';

type ShallowVerify =
  | { type: 'piece_on'; square: Square; color: 'w' | 'b'; pieceType?: string }
  | { type: 'attacked'; square: Square; byColor: 'w' | 'b' };

interface ShallowCalcFixture {
  fen: string;
  moves: string[];
  prompt: string;
  squaresTouched: Square[];
  verify: ShallowVerify;
}

const SHALLOW_STATE_FIXTURES: ShallowCalcFixture[] = [
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'],
    prompt: 'Is the White bishop still on c4?',
    squaresTouched: ['c4', 'f6', 'e8'],
    verify: { type: 'piece_on', square: 'c4', color: 'w', pieceType: 'b' },
  },
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: ['e4', 'e5', 'Nf3', 'Nc6'],
    prompt: 'Is the White knight still on f3?',
    squaresTouched: ['f3', 'c6', 'e5'],
    verify: { type: 'piece_on', square: 'f3', color: 'w', pieceType: 'n' },
  },
  {
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    moves: ['d5', 'exd5'],
    prompt: 'Is the White pawn still on e4?',
    squaresTouched: ['e4', 'd5'],
    verify: { type: 'piece_on', square: 'e4', color: 'w', pieceType: 'p' },
  },
];

const SHALLOW_ATTACKED_FIXTURES: ShallowCalcFixture[] = [
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: ['e4'],
    prompt: 'Is d5 attacked by White?',
    squaresTouched: ['e4', 'd5'],
    verify: { type: 'attacked', square: 'd5', byColor: 'w' },
  },
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: ['e4', 'e5'],
    prompt: 'Is f7 attacked by White?',
    squaresTouched: ['e4', 'e5', 'f7'],
    verify: { type: 'attacked', square: 'f7', byColor: 'w' },
  },
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
    prompt: 'Is f7 attacked by White?',
    squaresTouched: ['c4', 'f7', 'e8'],
    verify: { type: 'attacked', square: 'f7', byColor: 'w' },
  },
];

function puzzleId(generatorId: string, seed: string): string {
  return `gen-${generatorId}-${seed}`;
}

function evaluateVerify(fen: string, verify: ShallowVerify): 'yes' | 'no' {
  const chess = new Chess(fen);

  if (verify.type === 'piece_on') {
    const piece = chess.get(verify.square);
    const stillThere =
      piece != null &&
      piece.color === verify.color &&
      (verify.pieceType ? piece.type === verify.pieceType : true);
    return stillThere ? 'yes' : 'no';
  }

  return chess.isAttacked(verify.square, verify.byColor) ? 'yes' : 'no';
}

function buildShallowPuzzle(
  generatorId: string,
  fixtures: ShallowCalcFixture[],
  seed: string,
): GeneratedTrainingPuzzle {
  const index = Number.parseInt(seed, 10);
  const fixture = fixtures[index % fixtures.length]!;
  const displayFen =
    fixture.moves.length > 0
      ? applyMoves(fixture.fen, fixture.moves)
      : fixture.fen;
  const expected = evaluateVerify(displayFen, fixture.verify);

  return {
    id: puzzleId(generatorId, seed),
    fen: fixture.fen,
    moves: fixture.moves,
    prompt: fixture.prompt,
    answerType: 'yes-no',
    expected,
    squaresTouched: fixture.squaresTouched,
    subtitle: 'Follow the line, then verify.',
  };
}

export function buildShallowCalcStatePuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildShallowPuzzle('shallow_calc_state', SHALLOW_STATE_FIXTURES, seed);
}

export function buildShallowCalcAttackedPuzzle(
  seed: string,
): GeneratedTrainingPuzzle {
  return buildShallowPuzzle(
    'shallow_calc_attacked',
    SHALLOW_ATTACKED_FIXTURES,
    seed,
  );
}
