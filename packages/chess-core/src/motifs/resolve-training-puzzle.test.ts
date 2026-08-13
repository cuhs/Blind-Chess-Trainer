import { describe, it, expect } from 'vitest';
import { resolveTrainingPuzzle } from './resolve-training-puzzle';

describe('resolveTrainingPuzzle', () => {
  it('should use engine prompt when expected answer matches the detected motif', () => {
    const resolved = resolveTrainingPuzzle({
      id: 'drill-pin-knight',
      fen: '8/8/4k3/3n4/2B5/8/8/4K3 w - - 0 1',
      moves: [],
      prompt: 'Legacy prompt',
      answerType: 'square',
      expected: 'd5',
      squaresTouched: ['d5', 'c4', 'e6'],
    });

    expect(resolved.engineBacked).toBe(true);
    expect(resolved.prompt).toBe('What square is the pinned knight on?');
    expect(resolved.expected).toBe('d5');
  });

  it('should keep curated prompt when expected answer differs from engine default', () => {
    const resolved = resolveTrainingPuzzle({
      id: 'drill-pin-bishop',
      fen: '8/8/4k3/3n4/2B5/8/8/4K3 w - - 0 1',
      moves: [],
      prompt: 'What square is the pinning bishop on?',
      answerType: 'square',
      expected: 'c4',
      squaresTouched: ['c4', 'd5', 'e6'],
    });

    expect(resolved.engineBacked).toBe(false);
    expect(resolved.prompt).toBe('What square is the pinning bishop on?');
    expect(resolved.expected).toBe('c4');
  });

  it('should not override yes-no puzzles', () => {
    const resolved = resolveTrainingPuzzle({
      id: 'drill-story-check',
      fen: 'rnbqkbnr/pppp1ppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1',
      moves: ['Nf3', 'Nc6', 'Bc4', 'Nf6'],
      prompt: 'Is the Black King in check?',
      answerType: 'yes-no',
      expected: 'no',
      squaresTouched: ['e8', 'c4', 'f6', 'f3'],
    });

    expect(resolved.engineBacked).toBe(false);
    expect(resolved.prompt).toBe('Is the Black King in check?');
  });

  it('should keep a curated alternate prompt when a hanging piece shares the answer square', () => {
    const resolved = resolveTrainingPuzzle({
      id: 'drill-hanging-attacker-rook',
      fen: '4k3/8/8/8/q7/8/8/R3K3 w - - 0 1',
      moves: [],
      prompt: 'What square is the attacking rook on?',
      answerType: 'square',
      expected: 'a1',
      squaresTouched: ['a1', 'a4'],
    });

    expect(resolved.engineBacked).toBe(false);
    expect(resolved.prompt).toBe('What square is the attacking rook on?');
    expect(resolved.expected).toBe('a1');
  });

  it('should keep a static-recall prompt when a hanging piece shares the square but is not the ranked motif', () => {
    const resolved = resolveTrainingPuzzle({
      id: 'recall-forked-knight',
      fen: '8/8/8/3n1b2/4P3/8/8/4K2k w - - 0 1',
      moves: [],
      prompt: 'Which square is the Black knight on?',
      answerType: 'square',
      expected: 'd5',
      squaresTouched: ['d5'],
    });

    expect(resolved.engineBacked).toBe(false);
    expect(resolved.prompt).toBe('Which square is the Black knight on?');
    expect(resolved.expected).toBe('d5');
  });

  it('should engine-back an overloaded defender when it is the ranked motif', () => {
    const resolved = resolveTrainingPuzzle({
      id: 'drill-overload-knight',
      fen: '3k4/8/5Np1/5q2/4P1N1/8/8/4K3 w - - 0 1',
      moves: [],
      prompt: 'Placeholder',
      answerType: 'square',
      expected: 'f6',
      squaresTouched: ['f6', 'e4', 'g4'],
    });

    expect(resolved.engineBacked).toBe(true);
    expect(resolved.prompt).toBe(
      'What square is the White Knight that defends multiple attacked pieces on?',
    );
    expect(resolved.expected).toBe('f6');
  });

  it('should resolve discovered attacks when moves supply the previous ply', () => {
    const resolved = resolveTrainingPuzzle({
      id: 'drill-discovered-bishop',
      fen: '4k3/6q1/8/8/3P4/8/1B6/4K3 w - - 0 1',
      moves: ['d5'],
      prompt: 'Placeholder',
      answerType: 'square',
      expected: 'b2',
      squaresTouched: ['b2', 'g7', 'd5'],
    });

    expect(resolved.engineBacked).toBe(true);
    expect(resolved.prompt).toBe('What square does the White Bishop attack from?');
    expect(resolved.displayFen).toContain('3P4');
  });
});
