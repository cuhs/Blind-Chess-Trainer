import { describe, expect, it } from 'vitest';
import { CURRICULUM } from './curriculum';
import { buildTrainingPuzzleSpec } from './generators';
import { buildPuzzleFromCategory, listCategories } from './categories';
import { verifyGeneratedPuzzle } from './verify-puzzle';

describe('verifyGeneratedPuzzle', () => {
  it('passes for every fixed curriculum generator seed', () => {
    const issues: string[] = [];

    for (const nodeId of CURRICULUM.mainPathNodeIds) {
      const node = CURRICULUM.nodes[nodeId]!;
      for (const source of node.puzzles) {
        if (source.type !== 'generator') continue;
        const puzzle = buildTrainingPuzzleSpec(source.generatorId, source.seed);
        const found = verifyGeneratedPuzzle(puzzle, {
          generatorId: source.generatorId,
        });
        if (found.length > 0) {
          issues.push(
            `${nodeId} ${source.generatorId}/${source.seed}: ${found[0]!.message}`,
          );
        }
      }
    }

    expect(issues).toEqual([]);
  });

  it('passes for representative category samples', () => {
    for (const meta of listCategories()) {
      const puzzle = buildPuzzleFromCategory(meta.id, 'verify-golden');
      const generatorId = puzzle.id.match(/^gen-(.+?)-/)?.[1];
      expect(verifyGeneratedPuzzle(puzzle, { generatorId, category: meta.id })).toEqual(
        [],
      );
    }
  });
});
