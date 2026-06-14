import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzePosition } from '../src/motifs/analyze-position';
import { buildPuzzleFromMotif } from '../src/motifs/questions';
import { applyMoves } from '../src/validate';

interface FixtureRow {
  slug: string;
  fen: string;
  moves: string[];
  motifJson: Record<string, string>;
  nlpPrompt?: string;
  expectedAnswer: string;
  skipEngine: boolean;
  alternatePrompt?: boolean;
  checkColor?: 'w' | 'b';
}

interface SeedRow extends FixtureRow {
  nlpPrompt: string;
  answerSquare: string;
  answerType: 'square' | 'yes-no';
  squaresTouched: string[];
}

function enrichRow(row: FixtureRow): SeedRow {
  if (row.motifJson.motif === 'story_check') {
    const prompt =
      row.nlpPrompt ??
      (row.checkColor === 'w'
        ? 'Is the White King in check?'
        : 'Is the Black King in check?');
    return {
      ...row,
      nlpPrompt: prompt,
      answerSquare: row.checkColor === 'w' ? 'e1' : 'e8',
      answerType: 'yes-no',
      squaresTouched: [],
    };
  }

  const displayFen =
    row.moves.length > 0 ? applyMoves(row.fen, row.moves) : row.fen;
  const previousFen =
    row.moves.length === 1
      ? row.fen
      : row.moves.length > 1
        ? applyMoves(row.fen, row.moves.slice(0, -1))
        : undefined;

  const motif = analyzePosition(displayFen, previousFen);
  if (!motif) {
    throw new Error(`No motif for ${row.slug}`);
  }

  const draft = buildPuzzleFromMotif(motif);
  return {
    ...row,
    nlpPrompt: row.nlpPrompt ?? draft.prompt,
    answerSquare: row.expectedAnswer,
    answerType: 'square',
    squaresTouched: draft.squaresTouched,
  };
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const existing = JSON.parse(
  readFileSync(resolve(__dirname, '../src/motifs/fixtures/puzzle-bank-fixtures.json'), 'utf8'),
) as FixtureRow[];

const merged = existing.map(enrichRow);

const fixtureJson = merged.map((row) => ({
  slug: row.slug,
  fen: row.fen,
  moves: row.moves,
  motifJson: row.motifJson,
  nlpPrompt: row.nlpPrompt,
  expectedAnswer: row.expectedAnswer,
  skipEngine: row.skipEngine,
  ...(row.alternatePrompt ? { alternatePrompt: true } : {}),
  ...(row.checkColor ? { checkColor: row.checkColor } : {}),
}));

writeFileSync(
  resolve(__dirname, '../src/motifs/fixtures/puzzle-bank-fixtures.json'),
  `${JSON.stringify(fixtureJson, null, 2)}\n`,
);

function sqlRow(row: SeedRow): string {
  const moves = JSON.stringify(row.moves);
  const motifJson = JSON.stringify(row.motifJson);
  const squares = JSON.stringify(row.squaresTouched ?? []);
  const placeholder =
    row.answerType === 'yes-no' ? "'e.g. Yes'" : "'e.g. a8'";
  const prompt = row.nlpPrompt.replace(/'/g, "''");

  return `  (
    '${row.slug}',
    '${row.fen}',
    '${motifJson.replace(/'/g, "''")}'::jsonb,
    '${prompt}',
    ${placeholder},
    null,
    '${row.answerSquare}',
    '${row.answerType}',
    '${row.expectedAnswer}',
    '${moves}'::jsonb,
    '${squares}'::jsonb,
    'daily',
    true
  )`;
}

const sql = `insert into public.puzzle_bank (
  slug,
  fen,
  motif_json,
  nlp_prompt,
  input_placeholder,
  subtitle,
  answer_square,
  answer_type,
  expected_answer,
  moves,
  squares_touched,
  source,
  is_active
)
values
${merged.map(sqlRow).join(',\n')}
on conflict (slug) do update
set
  fen = excluded.fen,
  motif_json = excluded.motif_json,
  nlp_prompt = excluded.nlp_prompt,
  input_placeholder = excluded.input_placeholder,
  subtitle = excluded.subtitle,
  answer_square = excluded.answer_square,
  answer_type = excluded.answer_type,
  expected_answer = excluded.expected_answer,
  moves = excluded.moves,
  squares_touched = excluded.squares_touched,
  source = excluded.source,
  is_active = excluded.is_active,
  updated_at = now();

-- Authoring audio (story) puzzles — rows with a non-empty moves[] array:
--
--   Pattern A — narration only (blank screen):
--     fen   = standard start position
--     moves = legal SAN sequence from the start (3–5 moves reads well)
--     The app skips the board and reads the moves aloud. Works because
--     every player knows the starting position.
--
--   Pattern B — memorize, then narrate:
--     fen   = any custom position (the BASE position, before moves)
--     moves = short legal SAN continuation (1–2 plies)
--     The app shows the base board for 5s, hides it, reads the moves,
--     then asks the question about the resulting position.
--
--   Rules:
--   - moves[] must be legal from fen (validated by chess-core fixtures).
--   - subtitle must NOT mention the moves — it shows during memorize.
--   - expected_answer refers to the position AFTER moves are applied.
--   - Peek shows the BASE position, never the post-move position.
--   - Mirror each row in packages/chess-core/src/motifs/fixtures/
--     puzzle-bank-fixtures.json and run \`npm run validate:puzzles\`.
`;

writeFileSync(resolve(__dirname, '../../../supabase/seed.sql'), sql);
console.log(`Wrote ${merged.length} puzzles to seed.sql`);
