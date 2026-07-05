import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '@mindboard/chess-core';
import {
  generatedToTrainingPuzzle,
  resolveNodePuzzles,
  resolvePuzzleSource,
} from '@/lib/generatedPuzzles';
import { buildTrainingPuzzleSpec } from '@mindboard/chess-core';

describe('resolveNodePuzzles', () => {
  it('resolves all 18 curriculum nodes without puzzle_bank rows', () => {
    for (const nodeId of CURRICULUM.mainPathNodeIds) {
      const puzzles = resolveNodePuzzles(nodeId, [], 'fresh');
      expect(puzzles, nodeId).toHaveLength(3);
      for (const puzzle of puzzles) {
        expect(puzzle.prompt.length, `${nodeId} ${puzzle.id}`).toBeGreaterThan(0);
        expect(puzzle.expected.length, `${nodeId} ${puzzle.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('resolves motif generator nodes without puzzle_bank rows', () => {
    const puzzles = resolveNodePuzzles('node-4-1', [], 'fresh');
    expect(puzzles).toHaveLength(3);
    for (const puzzle of puzzles) {
      expect(puzzle.prompt.length).toBeGreaterThan(0);
      expect(puzzle.squaresTouched.length).toBeGreaterThan(0);
      expect(puzzle.id).toMatch(/^gen-motif_pin-/);
    }
  });

  it('derives different puzzles when session key changes', () => {
    const first = resolveNodePuzzles('node-4-1', [], 'fresh');
    const replay = resolveNodePuzzles('node-4-1', [], 'retry-1');
    expect(first.map((puzzle) => puzzle.id)).not.toEqual(
      replay.map((puzzle) => puzzle.id),
    );
  });

  it('resolves story_check_line node without bank', () => {
    const puzzles = resolveNodePuzzles('node-5-1', [], 'fresh');
    expect(puzzles).toHaveLength(3);
    expect(puzzles.every((puzzle) => puzzle.answerType === 'yes-no')).toBe(true);
  });

  it('still resolves bank_slug sources when bank rows exist', () => {
    const bankPuzzle = generatedToTrainingPuzzle(
      buildTrainingPuzzleSpec('coordinate_color', 'e4'),
    );
    bankPuzzle.id = 'drill-pin-knight';

    const puzzle = resolvePuzzleSource(
      { type: 'bank_slug', slug: 'drill-pin-knight' },
      new Map([[bankPuzzle.id, bankPuzzle]]),
      'fresh',
      'node-4-1',
    );
    expect(puzzle?.id).toBe('drill-pin-knight');
  });

  it('resolves category sources via buildPuzzleFromCategory', () => {
    const puzzle = resolvePuzzleSource(
      { type: 'category', category: 'fork', seed: '0' },
      new Map(),
      'session-a',
      'node-4-2',
    );
    expect(puzzle).not.toBeNull();
    expect(puzzle!.id).toMatch(/^gen-motif_fork-/);
  });
});
