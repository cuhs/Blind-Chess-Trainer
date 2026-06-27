import { describe, expect, it } from 'vitest';
import {
  extractPieceIntent,
  sanMatchesPieceIntent,
} from './piece-intent';

describe('extractPieceIntent', () => {
  it.each([
    ['rook e four', 'r'],
    ['knight to c3', 'n'],
    ['pawn e4', 'p'],
    ['castle king side', 'castle'],
    ['e four', null],
  ] as const)('should read intent from "%s"', (transcript, expected) => {
    expect(extractPieceIntent(transcript)).toBe(expected);
  });
});

describe('sanMatchesPieceIntent', () => {
  it.each([
    ['Re4', 'r', true],
    ['e4', 'r', false],
    ['e4', 'p', true],
    ['Nf3', 'n', true],
    ['O-O', 'castle', true],
    ['O-O', 'r', false],
  ])('san %s intent %s → %s', (san, intent, expected) => {
    expect(sanMatchesPieceIntent(san, intent)).toBe(expected);
  });
});
