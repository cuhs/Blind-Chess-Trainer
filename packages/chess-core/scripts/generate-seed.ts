import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildSeedSql,
  enrichFixtureRow,
  fixtureToJsonRow,
  type FixtureRow,
} from './lib/puzzle-authoring';

const __dirname = dirname(fileURLToPath(import.meta.url));
const existing = JSON.parse(
  readFileSync(resolve(__dirname, '../src/motifs/fixtures/puzzle-bank-fixtures.json'), 'utf8'),
) as FixtureRow[];

const merged = existing.map(enrichFixtureRow);
const fixtureJson = merged.map(fixtureToJsonRow);

writeFileSync(
  resolve(__dirname, '../src/motifs/fixtures/puzzle-bank-fixtures.json'),
  `${JSON.stringify(fixtureJson, null, 2)}\n`,
);

writeFileSync(
  resolve(__dirname, '../../../supabase/seed.sql'),
  buildSeedSql(merged),
);
console.log(`Wrote ${merged.length} puzzles to seed.sql`);
