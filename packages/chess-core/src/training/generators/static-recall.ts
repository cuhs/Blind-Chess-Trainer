import { Chess } from 'chess.js';
import type { GeneratedTrainingPuzzle } from './types';
import {
  allPieceSquares,
  piecePrompt,
  pickQueryPiece,
  synthesizeMinimalBoard,
} from '../position-synthesis/minimal-board';
import { puzzleId } from '../seed';

export function countPiecesOnBoard(fen: string): number {
  const chess = new Chess(fen);
  let count = 0;
  for (const row of chess.board()) {
    for (const piece of row) {
      if (piece) count += 1;
    }
  }
  return count;
}

function buildStaticRecallPuzzle(
  generatorId: string,
  pieceCount: number,
  seed: string,
): GeneratedTrainingPuzzle {
  const board = synthesizeMinimalBoard(pieceCount, seed);
  const query = pickQueryPiece(board.pieces, seed);

  return {
    id: puzzleId(generatorId, seed),
    fen: board.fen,
    moves: [],
    prompt: piecePrompt(query.color, query.type),
    inputPlaceholder: 'e.g. a8',
    answerType: 'square',
    expected: query.square,
    squaresTouched: allPieceSquares(board.pieces),
    subtitle:
      pieceCount <= 3
        ? 'King and pieces vs king. Memorize every piece.'
        : pieceCount <= 4
          ? 'Four pieces on the board.'
          : 'Six pieces. Hold the whole position.',
  };
}

export function buildStaticRecall2Puzzle(seed: string): GeneratedTrainingPuzzle {
  return buildStaticRecallPuzzle('static_recall_2', 3, seed);
}

export function buildStaticRecall4Puzzle(seed: string): GeneratedTrainingPuzzle {
  return buildStaticRecallPuzzle('static_recall_4', 4, seed);
}

export function buildStaticRecall6Puzzle(seed: string): GeneratedTrainingPuzzle {
  return buildStaticRecallPuzzle('static_recall_6', 6, seed);
}
