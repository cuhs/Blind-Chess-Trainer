import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import {
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
  it('fianchetto fixtures match their expected answers', () => {
    expect(buildChunkFianchettoPuzzle('0').expected).toBe('g2');
    expect(buildChunkFianchettoPuzzle('1').expected).toBe('no');
    expect(buildChunkFianchettoPuzzle('2').expected).toBe('yes');
  });

  it('pawn-chain fixtures have correct expected answers', () => {
    expect(buildChunkPawnChainPuzzle('0').expected).toBe('yes');
    expect(buildChunkPawnChainPuzzle('1').expected).toBe('yes');
    expect(buildChunkPawnChainPuzzle('2').expected).toBe('no');
  });

  it('isolated-pawn puzzle uses the neighboring-file definition', () => {
    const puzzle = buildChunkPawnChainPuzzle('2');
    expect(isPawnIsolated(puzzle.fen, 'e4')).toBe(false);
  });

  it('pawn-chain prompts refer to same-color chains', () => {
    for (const seed of ['0', '1', '2']) {
      const puzzle = buildChunkPawnChainPuzzle(seed);
      expect(puzzle.prompt.toLowerCase()).not.toContain('white and black');
    }
  });
});
