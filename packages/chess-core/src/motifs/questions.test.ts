import { describe, it, expect } from 'vitest';
import { analyzePosition } from './index';
import { detectOverloadedDefenders } from './divergent';
import { buildInfluenceMap } from './influence';
import { buildPuzzleFromMotif } from './questions';

describe('buildPuzzleFromMotif', () => {
  it('should build a pin puzzle asking for the pinned piece square', () => {
    const fen = '8/8/4k3/3n4/2B5/8/8/4K3 w - - 0 1';
    const motif = analyzePosition(fen);
    expect(motif).not.toBeNull();
    if (!motif) return;

    const puzzle = buildPuzzleFromMotif(motif);
    expect(puzzle.prompt).toBe('What square is the pinned knight on?');
    expect(puzzle.expected).toBe('d5');
    expect(puzzle.answerType).toBe('square');
    expect(puzzle.squaresTouched).toEqual(expect.arrayContaining(['d5', 'c4', 'e6']));
  });

  it('should build a discovered attack puzzle for the unmasked attacker', () => {
    const previousFen = '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1';
    const currentFen = '4k3/6q1/8/2P5/8/8/1B6/4K3 w - - 0 1';
    const motif = analyzePosition(currentFen, previousFen);
    expect(motif).not.toBeNull();
    if (!motif) return;

    const puzzle = buildPuzzleFromMotif(motif);
    expect(puzzle.prompt).toBe('What square does the White Bishop attack from?');
    expect(puzzle.expected).toBe('b2');
  });

  it('should build an overloaded defender puzzle', () => {
    const fen = '4k3/8/5N2/5q2/4P1N1/8/8/4K3 w - - 0 1';
    const map = buildInfluenceMap(fen)!;
    const motif = detectOverloadedDefenders(fen, map)[0];

    const puzzle = buildPuzzleFromMotif(motif);
    expect(puzzle.prompt).toBe(
      'What square is the White Knight that defends multiple attacked pieces on?',
    );
    expect(puzzle.expected).toBe('f6');
  });

  it('should build a fork puzzle for the forking piece', () => {
    const fen = 'k7/8/8/5r2/3N4/8/2q5/K7 w - - 0 1';
    const motif = analyzePosition(fen);
    expect(motif).not.toBeNull();
    if (!motif) return;

    const puzzle = buildPuzzleFromMotif(motif);
    expect(puzzle.prompt).toBe('What square is the knight fork on?');
    expect(puzzle.expected).toBe('d4');
  });

  it('should build a skewer puzzle for the front piece', () => {
    const fen = '4k3/8/3r4/8/8/3K4/3B4/8 w - - 0 1';
    const motif = analyzePosition(fen);
    expect(motif).not.toBeNull();
    if (!motif) return;

    const puzzle = buildPuzzleFromMotif(motif);
    expect(puzzle.prompt).toBe('What square is the White King on?');
    expect(puzzle.expected).toBe('d3');
  });

  it('should build a hanging piece puzzle', () => {
    const fen = '4k3/8/8/8/8/8/4r3/4K3 w - - 0 1';
    const motif = analyzePosition(fen);
    expect(motif).not.toBeNull();
    if (!motif) return;

    const puzzle = buildPuzzleFromMotif(motif);
    expect(puzzle.prompt).toBe('The White King is in check — what square is it on?');
    expect(puzzle.expected).toBe('e1');
  });
});
