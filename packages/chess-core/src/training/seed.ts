import type { Color, PieceSymbol } from 'chess.js';
import type { Square } from '@mindboard/shared';

const FILES = 'abcdefgh';
const RANKS = '12345678';
export const ALL_SQUARES: Square[] = [];

for (const file of FILES) {
  for (const rank of RANKS) {
    ALL_SQUARES.push(`${file}${rank}` as Square);
  }
}

export const NON_KING_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p'];

/** FNV-1a hash — stable across platforms for the same seed string. */
export function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32 PRNG from a 32-bit seed. */
export function seedToRng(seed: string): () => number {
  let state = hashSeed(seed) || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x1_0000_0000;
  };
}

export function pickFrom<T>(rng: () => number, items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('pickFrom called with empty array');
  }
  return items[Math.floor(rng() * items.length)]!;
}

export function pickSquare(rng: () => number): Square {
  return pickFrom(rng, ALL_SQUARES);
}

export function pickColor(rng: () => number): Color {
  return rng() < 0.5 ? 'w' : 'b';
}

export function pickPiece(rng: () => number): PieceSymbol {
  return pickFrom(rng, NON_KING_PIECES);
}

export function isOnBoard(square: string): square is Square {
  return /^[a-h][1-8]$/.test(square);
}

export function kingDistance(a: Square, b: Square): number {
  const af = a.charCodeAt(0) - 'a'.charCodeAt(0);
  const ar = Number.parseInt(a[1]!, 10) - 1;
  const bf = b.charCodeAt(0) - 'a'.charCodeAt(0);
  const br = Number.parseInt(b[1]!, 10) - 1;
  return Math.max(Math.abs(af - bf), Math.abs(ar - br));
}

export function puzzleId(prefix: string, seed: string): string {
  return `gen-${prefix}-${seed.replace(/[^a-z0-9]/gi, '-')}`;
}
