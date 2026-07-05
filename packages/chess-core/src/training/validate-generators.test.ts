import { describe, expect, it } from 'vitest';
import {
  buildPuzzleFromCategory,
  DAILY_CATEGORY_ROTATION,
  listCategories,
} from './categories';
import { verifyGeneratedPuzzle } from './verify-puzzle';
import type { GeneratorId } from './generators/types';

const FUZZ_SEEDS_DAILY = 200;
const FUZZ_SEEDS_ALL = 100;

function fuzzSeeds(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index}`);
}

function fuzzCategory(category: string, count: number, failures: string[]): void {
  for (const seed of fuzzSeeds(category, count)) {
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

describe('validate generators fuzz', () => {
  it('lists all puzzle categories', () => {
    expect(listCategories().length).toBeGreaterThanOrEqual(28);
  });

  it('builds and verifies daily rotation categories (200 seeds each)', () => {
    const failures: string[] = [];
    for (const category of DAILY_CATEGORY_ROTATION) {
      fuzzCategory(String(category), FUZZ_SEEDS_DAILY, failures);
    }
    expect(failures, failures.slice(0, 10).join('\n')).toEqual([]);
  });

  it('builds and verifies every registered category (100 seeds each)', () => {
    const failures: string[] = [];
    for (const meta of listCategories()) {
      fuzzCategory(String(meta.id), FUZZ_SEEDS_ALL, failures);
    }
    expect(failures, failures.slice(0, 10).join('\n')).toEqual([]);
  });
});

function inferGeneratorFromPuzzle(puzzleId: string): GeneratorId | string {
  const match = puzzleId.match(/^gen-(.+?)-/);
  return match?.[1] ?? puzzleId;
}
