import { Chess } from 'chess.js';
import { analyzePosition } from '../../src/motifs/analyze-position';
import { motifToResult } from '../../src/motifs/adapters';
import { buildPuzzleFromMotif } from '../../src/motifs/questions';
import { applyMoves } from '../../src/validate';

export interface FixtureRow {
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

export interface SeedRow extends FixtureRow {
  nlpPrompt: string;
  answerSquare: string;
  answerType: 'square' | 'yes-no';
  squaresTouched: string[];
}

export interface ProbeCandidate {
  slug: string;
  fen: string;
  moves?: string[];
  alternatePrompt?: boolean;
  customPrompt?: string;
  customExpected?: string;
  storyCheck?: { color: 'w' | 'b'; expected: 'yes' | 'no' };
}

export type ProbeResult =
  | { ok: true; fixture: FixtureRow }
  | { ok: false; reason: string };

function storyCheckPrompt(color: 'w' | 'b'): string {
  return color === 'b'
    ? 'Is the Black King in check?'
    : 'Is the White King in check?';
}

function displayAndPreviousFen(
  fen: string,
  moves: string[],
): { displayFen: string; previousFen: string | undefined } {
  const displayFen = moves.length > 0 ? applyMoves(fen, moves) : fen;
  const previousFen =
    moves.length === 1
      ? fen
      : moves.length > 1
        ? applyMoves(fen, moves.slice(0, -1))
        : undefined;
  return { displayFen, previousFen };
}

function motifJsonFromAnalysis(motif: NonNullable<ReturnType<typeof analyzePosition>>) {
  const result = motifToResult(motif);
  return {
    motif: result.motif,
    ...(result.attacker ? { attacker: result.attacker } : {}),
    ...(result.target ? { target: result.target } : {}),
    ...(result.pinned_to ? { pinned_to: result.pinned_to } : {}),
    ...(result.square && result.motif !== 'fork' && result.motif !== 'hanging_piece'
      ? { square: result.square }
      : {}),
  };
}

export function enrichFixtureRow(row: FixtureRow): SeedRow {
  if (row.motifJson.motif === 'story_check') {
    const prompt = row.nlpPrompt ?? storyCheckPrompt(row.checkColor ?? 'b');
    return {
      ...row,
      nlpPrompt: prompt,
      answerSquare: row.checkColor === 'w' ? 'e1' : 'e8',
      answerType: 'yes-no',
      squaresTouched: [],
    };
  }

  const { displayFen, previousFen } = displayAndPreviousFen(row.fen, row.moves);
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

export function probeCandidate(candidate: ProbeCandidate): ProbeResult {
  const moves = candidate.moves ?? [];

  if (candidate.storyCheck) {
    let displayFen: string;
    try {
      displayFen = moves.length > 0 ? applyMoves(candidate.fen, moves) : candidate.fen;
    } catch {
      return { ok: false, reason: 'illegal moves' };
    }

    const chess = new Chess(displayFen);
    const inCheck =
      chess.turn() === candidate.storyCheck.color && chess.inCheck();
    const actual = inCheck ? 'yes' : 'no';
    if (actual !== candidate.storyCheck.expected) {
      return {
        ok: false,
        reason: `check=${actual}, expected=${candidate.storyCheck.expected}`,
      };
    }

    return {
      ok: true,
      fixture: {
        slug: candidate.slug,
        fen: candidate.fen,
        moves,
        motifJson: { motif: 'story_check' },
        nlpPrompt: storyCheckPrompt(candidate.storyCheck.color),
        expectedAnswer: candidate.storyCheck.expected,
        skipEngine: true,
        checkColor: candidate.storyCheck.color,
      },
    };
  }

  let displayFen: string;
  try {
    displayFen = moves.length > 0 ? applyMoves(candidate.fen, moves) : candidate.fen;
  } catch {
    return { ok: false, reason: 'illegal moves' };
  }

  const { previousFen } = displayAndPreviousFen(candidate.fen, moves);
  const motif = analyzePosition(displayFen, previousFen);
  if (!motif) {
    return { ok: false, reason: 'no motif detected' };
  }

  const draft = buildPuzzleFromMotif(motif);
  const expected = candidate.customExpected ?? draft.expected;
  const prompt = candidate.customPrompt ?? draft.prompt;

  if (!candidate.alternatePrompt && draft.expected !== expected) {
    return {
      ok: false,
      reason: `expected mismatch ${draft.expected} vs ${expected}`,
    };
  }

  return {
    ok: true,
    fixture: {
      slug: candidate.slug,
      fen: candidate.fen,
      moves,
      motifJson: motifJsonFromAnalysis(motif),
      nlpPrompt: prompt,
      expectedAnswer: expected,
      skipEngine: false,
      ...(candidate.alternatePrompt ? { alternatePrompt: true } : {}),
    },
  };
}

export function fixtureToJsonRow(row: SeedRow | FixtureRow) {
  return {
    slug: row.slug,
    fen: row.fen,
    moves: row.moves,
    motifJson: row.motifJson,
    nlpPrompt: row.nlpPrompt,
    expectedAnswer: row.expectedAnswer,
    skipEngine: row.skipEngine,
    ...(row.alternatePrompt ? { alternatePrompt: true } : {}),
    ...(row.checkColor ? { checkColor: row.checkColor } : {}),
  };
}

export function fixtureToSqlRow(row: SeedRow): string {
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

export const SEED_SQL_FOOTER = `-- Authoring audio (story) puzzles — rows with a non-empty moves[] array:
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

export function buildSeedSql(rows: SeedRow[]): string {
  return `insert into public.puzzle_bank (
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
${rows.map(fixtureToSqlRow).join(',\n')}
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

${SEED_SQL_FOOTER}`;
}
