#!/usr/bin/env npx tsx
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildPuzzleFromCategory,
  listCategories,
  type PuzzleCategoryId,
} from '../src/training/categories';
import { verifyGeneratedPuzzle } from '../src/training/verify-puzzle';

interface CliOptions {
  category: PuzzleCategoryId;
  count: number;
  verifyOnly: boolean;
  output: string | null;
}

function parseArgs(argv: string[]): CliOptions {
  let category: PuzzleCategoryId = 'pin';
  let count = 10;
  let verifyOnly = false;
  let output: string | null = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--category' && argv[i + 1]) {
      category = argv[i + 1]! as PuzzleCategoryId;
      i += 1;
    } else if (arg === '--count' && argv[i + 1]) {
      count = Number.parseInt(argv[i + 1]!, 10);
      i += 1;
    } else if (arg === '--verify') {
      verifyOnly = true;
    } else if (arg === '--output' && argv[i + 1]) {
      output = argv[i + 1]!;
      i += 1;
    }
  }

  return { category, count, verifyOnly, output };
}

function slugFor(category: PuzzleCategoryId, index: number): string {
  return `gen-${String(category).replace(/_/g, '-')}-${index}`;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const known = new Set(listCategories().map((item) => String(item.id)));

  if (!known.has(String(options.category))) {
    console.error(
      `Unknown category "${options.category}". Known: ${[...known].join(', ')}`,
    );
    process.exit(1);
  }

  const rows: object[] = [];
  const failures: string[] = [];

  for (let index = 0; index < options.count; index += 1) {
    const seed = `${options.category}-${index}`;
    try {
      const puzzle = buildPuzzleFromCategory(options.category, seed);
      const issues = verifyGeneratedPuzzle(puzzle, { category: options.category });
      if (issues.length > 0) {
        failures.push(`${seed}: ${issues.map((issue) => issue.message).join('; ')}`);
        continue;
      }

      if (!options.verifyOnly) {
        rows.push({
          slug: slugFor(options.category, index),
          fen: puzzle.fen,
          moves: puzzle.moves,
          nlpPrompt: puzzle.prompt,
          expectedAnswer: puzzle.expected,
          answerType: puzzle.answerType,
          answerSquare: puzzle.answerType === 'square' ? puzzle.expected : puzzle.expected,
          squaresTouched: puzzle.squaresTouched,
          source: 'daily',
          skipEngine: false,
          motifJson: { motif: String(options.category) },
        });
      }
    } catch (error) {
      failures.push(
        `${seed}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  console.log(`Verified: ${options.count - failures.length}/${options.count}`);
  if (failures.length > 0) {
    console.log('Failures:');
    failures.forEach((line) => console.log(`  ${line}`));
  }

  if (options.output && rows.length > 0) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const outPath = resolve(__dirname, options.output);
    writeFileSync(outPath, `${JSON.stringify(rows, null, 2)}\n`);
    console.log(`Wrote ${rows.length} rows to ${outPath}`);
  }

  if (failures.length > 0) {
    process.exit(1);
  }
}

main();
