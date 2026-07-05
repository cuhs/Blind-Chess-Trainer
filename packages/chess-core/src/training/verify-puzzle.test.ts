import { describe, expect, it } from 'vitest';
import { CURRICULUM } from './curriculum';
import { buildTrainingPuzzleSpec } from './generators';
import { buildPuzzleFromCategory, listCategories } from './categories';
import { deriveNodePuzzleSeed } from './daily-selection';
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

  it('passes for mobile session-derived seeds (fresh and retry)', () => {
    const issues: string[] = [];
    const sessionKeys = ['fresh', 'retry-1', 'p1,p2'];

    for (const nodeId of CURRICULUM.mainPathNodeIds) {
      const node = CURRICULUM.nodes[nodeId]!;
      for (const source of node.puzzles) {
        if (source.type !== 'generator') continue;
        for (const sessionKey of sessionKeys) {
          const seed = deriveNodePuzzleSeed(nodeId, source.seed, sessionKey);
          try {
            const puzzle = buildTrainingPuzzleSpec(source.generatorId, seed);
            const found = verifyGeneratedPuzzle(puzzle, {
              generatorId: source.generatorId,
            });
            if (found.length > 0) {
              issues.push(
                `${nodeId} ${source.generatorId}/${sessionKey}: ${found[0]!.message}`,
              );
            }
          } catch (error) {
            issues.push(
              `${nodeId} ${source.generatorId}/${sessionKey}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
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
