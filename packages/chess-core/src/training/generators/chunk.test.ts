import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { verifyGeneratedPuzzle } from '../verify-puzzle';
import {
  buildChunkCastledPuzzle,
  buildChunkFianchettoPuzzle,
  buildChunkPawnChainPuzzle,
} from './chunk';

/** No friendly pawn on either neighboring file (c/f for e4, etc.). */
function isPawnIsolated(fen: string, square: string): boolean {
  const chess = new Chess(fen);
  const piece = chess.get(square);
  if (!piece || piece.type !== 'p') return false;

  const files = 'abcdefgh';
  const fileIndex = files.indexOf(square[0]!);
  for (const neighbor of [fileIndex - 1, fileIndex + 1]) {
    if (neighbor < 0 || neighbor > 7) continue;
    const neighborFile = files[neighbor]!;
    for (let rank = 1; rank <= 8; rank += 1) {
      const neighborPiece = chess.get(`${neighborFile}${rank}`);
      if (
        neighborPiece &&
        neighborPiece.color === piece.color &&
        neighborPiece.type === 'p'
      ) {
        return false;
      }
    }
  }
  return true;
}

describe('chunk generators', () => {
  it('procedural seeds pass verification', () => {
    const builders: Array<[string, (seed: string) => ReturnType<typeof buildChunkCastledPuzzle>]> = [
      ['chunk_castled', buildChunkCastledPuzzle],
      ['chunk_fianchetto', buildChunkFianchettoPuzzle],
      ['chunk_pawn_chain', buildChunkPawnChainPuzzle],
    ];
    for (const seed of ['0', '1', '2', '42', 'seed-99']) {
      for (const [generatorId, builder] of builders) {
        const puzzle = builder(seed);
        expect(verifyGeneratedPuzzle(puzzle, { generatorId })).toEqual([]);
      }
    }
  });

  it('isolated-pawn puzzles use the neighboring-file definition when asked', () => {
    const puzzle = buildChunkPawnChainPuzzle('isolated-check');
    if (puzzle.prompt.includes('isolated')) {
      const match = puzzle.prompt.match(/\b([a-h][1-8])\b/i);
      if (match) {
        expect(isPawnIsolated(puzzle.fen, match[1]!.toLowerCase())).toBe(
          puzzle.expected === 'yes',
        );
      }
    }
  });

  it('pawn-chain prompts refer to same-color chains', () => {
    for (const seed of ['0', '1', '2']) {
      const puzzle = buildChunkPawnChainPuzzle(seed);
      expect(puzzle.prompt.toLowerCase()).not.toContain('white and black');
    }
  });
});
