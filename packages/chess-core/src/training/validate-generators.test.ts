import { describe, expect, it } from 'vitest';
import {
  buildPuzzleFromCategory,
  DAILY_CATEGORY_ROTATION,
  listCategories,
} from './categories';
import { verifyGeneratedPuzzle } from './verify-puzzle';
import type { GeneratorId } from './generators/types';

const FUZZ_SEEDS_PER_CATEGORY = 200;

function fuzzSeeds(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index}`);
}

describe('validate generators fuzz', () => {
  it('lists all puzzle categories', () => {
    expect(listCategories().length).toBeGreaterThan(20);
  });

  it('builds and verifies puzzles for every category', () => {
    const failures: string[] = [];

    for (const category of DAILY_CATEGORY_ROTATION) {
      for (const seed of fuzzSeeds(String(category), FUZZ_SEEDS_PER_CATEGORY)) {
        try {
          const puzzle = buildPuzzleFromCategory(category, seed);
          const generatorId = inferGeneratorFromPuzzle(puzzle.id);
          const issues = verifyGeneratedPuzzle(puzzle, { generatorId, category });
          if (issues.length > 0) {
            failures.push(
              `${category}/${seed}: ${issues.map((issue) => issue.message).join('; ')}`,
            );
          }
        } catch (error) {
          failures.push(
            `${category}/${seed}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    expect(failures, failures.slice(0, 10).join('\n')).toEqual([]);
  });
});

function inferGeneratorFromPuzzle(puzzleId: string): GeneratorId | string {
  const match = puzzleId.match(/^gen-(.+?)-/);
  return match?.[1] ?? puzzleId;
}
