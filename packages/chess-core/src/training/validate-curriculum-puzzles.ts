import type { NodePuzzleSource } from '@mindboard/shared';
import { validatePuzzleBankFixtures } from '../motifs/validate-puzzle-bank';
import fixtures from '../motifs/fixtures/puzzle-bank-fixtures.json';
import { CURRICULUM } from './curriculum';
import { buildTrainingPuzzleSpec } from './generators';
import { verifyGeneratedPuzzle } from './verify-puzzle';

export interface CurriculumValidationIssue {
  nodeId: string;
  puzzleRef: string;
  message: string;
}

type PuzzleBankFixture = (typeof fixtures)[number];

function collectCurriculumSources(): Array<{
  nodeId: string;
  source: NodePuzzleSource;
}> {
  const rows: Array<{ nodeId: string; source: NodePuzzleSource }> = [];
  for (const nodeId of CURRICULUM.mainPathNodeIds) {
    const node = CURRICULUM.nodes[nodeId]!;
    for (const source of node.puzzles) {
      rows.push({ nodeId, source });
    }
  }
  return rows;
}

export function validateCurriculumPuzzles(): CurriculumValidationIssue[] {
  const issues: CurriculumValidationIssue[] = [];
  const bankSlugs = new Set<string>();

  for (const { nodeId, source } of collectCurriculumSources()) {
    if (source.type === 'generator') {
      const ref = `${source.generatorId}/${source.seed}`;
      try {
        const puzzle = buildTrainingPuzzleSpec(
          source.generatorId,
          source.seed,
        );
        for (const issue of verifyGeneratedPuzzle(puzzle, {
          generatorId: source.generatorId,
        })) {
          issues.push({
            nodeId,
            puzzleRef: ref,
            message: issue.message,
          });
        }
      } catch (error) {
        issues.push({
          nodeId,
          puzzleRef: ref,
          message: `Failed to build: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    } else if (source.type === 'bank_slug') {
      bankSlugs.add(source.slug);
    }
  }

  const bankRows = (fixtures as PuzzleBankFixture[]).filter((row) =>
    bankSlugs.has(row.slug),
  );
  const missingSlugs = [...bankSlugs].filter(
    (slug) => !bankRows.some((row) => row.slug === slug),
  );
  for (const slug of missingSlugs) {
    issues.push({
      nodeId: 'bank',
      puzzleRef: slug,
      message: 'Curriculum bank slug missing from puzzle-bank-fixtures.json',
    });
  }

  for (const bankIssue of validatePuzzleBankFixtures(bankRows)) {
    issues.push({
      nodeId: 'bank',
      puzzleRef: bankIssue.slug,
      message: bankIssue.message,
    });
  }

  return issues;
}
