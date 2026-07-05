import { Chess } from 'chess.js';
import type { Square } from '@mindboard/shared';
import type { GeneratedTrainingPuzzle } from './types';

interface StaticRecallQuery {
  prompt: string;
  expected: Square;
}

interface StaticRecallFixture {
  fen: string;
  pieceCount: number;
  queries: StaticRecallQuery[];
  subtitle: string;
}

/** Minimal positions for static recall — both kings always present. */
const STATIC_RECALL_2: StaticRecallFixture[] = [
  {
    fen: '8/8/8/8/4R3/8/8/4k2K w - - 0 1',
    pieceCount: 3,
    queries: [
      { prompt: 'Which square is the white rook on?', expected: 'e4' },
      { prompt: 'Which square is the black king on?', expected: 'e1' },
    ],
    subtitle: 'King and rook vs king. Memorize every piece.',
  },
  {
    fen: '8/8/8/8/8/5n2/8/4k2K w - - 0 1',
    pieceCount: 3,
    queries: [
      { prompt: 'Which square is the white king on?', expected: 'h1' },
      { prompt: 'Which square is the black knight on?', expected: 'f6' },
    ],
    subtitle: 'King vs king and knight. Memorize every piece.',
  },
];

/** Exactly four pieces. */
const STATIC_RECALL_4: StaticRecallFixture[] = [
  {
    fen: '8/8/4k3/3n4/2B5/8/8/4K3 w - - 0 1',
    pieceCount: 4,
    queries: [
      { prompt: 'Which square is the white bishop on?', expected: 'c4' },
      { prompt: 'Which square is the black knight on?', expected: 'd5' },
      { prompt: 'Which square is the black king on?', expected: 'e6' },
    ],
    subtitle: 'Four pieces on the board.',
  },
  {
    fen: 'k7/8/8/5r2/3N4/8/8/4K3 w - - 0 1',
    pieceCount: 4,
    queries: [
      { prompt: 'Which square is the white king on?', expected: 'e1' },
      { prompt: 'Which square is the white knight on?', expected: 'd4' },
      { prompt: 'Which square is the black rook on?', expected: 'f5' },
    ],
    subtitle: 'Four pieces on the board.',
  },
];

/** Exactly six pieces — minimal positions, not full openings. */
const STATIC_RECALL_6: StaticRecallFixture[] = [
  {
    fen: '8/8/4k3/4q3/3B4/2n5/8/4K2Q w - - 0 1',
    pieceCount: 6,
    queries: [
      { prompt: 'Which square is the white queen on?', expected: 'h1' },
      { prompt: 'Which square is the black queen on?', expected: 'e5' },
      { prompt: 'Which square is the black knight on?', expected: 'c3' },
    ],
    subtitle: 'Six pieces. Hold the whole position.',
  },
  {
    fen: '8/8/3k4/2r5/4B3/3N4/8/4K2R w - - 0 1',
    pieceCount: 6,
    queries: [
      { prompt: 'Which square is the white rook on?', expected: 'h1' },
      { prompt: 'Which square is the white bishop on?', expected: 'e4' },
      { prompt: 'Which square is the black rook on?', expected: 'c5' },
    ],
    subtitle: 'Six pieces. Hold the whole position.',
  },
];

function puzzleId(generatorId: string, seed: string): string {
  return `gen-${generatorId}-${seed.replace(/:/g, '-')}`;
}

/** Seed format: `fixtureIndex:queryIndex` (e.g. `0:1`). */
function parseSeed(seed: string): { fixtureIndex: number; queryIndex: number } {
  if (seed.includes(':')) {
    const [fixturePart, queryPart] = seed.split(':');
    return {
      fixtureIndex: Number.parseInt(fixturePart ?? '0', 10),
      queryIndex: Number.parseInt(queryPart ?? '0', 10),
    };
  }
  return {
    fixtureIndex: Number.parseInt(seed, 10),
    queryIndex: 0,
  };
}

export function countPiecesOnBoard(fen: string): number {
  const chess = new Chess(fen);
  let count = 0;
  for (const row of chess.board()) {
    for (const piece of row) {
      if (piece) count += 1;
    }
  }
  return count;
}

function buildStaticRecallPuzzle(
  generatorId: string,
  fixtures: StaticRecallFixture[],
  seed: string,
): GeneratedTrainingPuzzle {
  const { fixtureIndex, queryIndex } = parseSeed(seed);
  const fixture = fixtures[fixtureIndex % fixtures.length]!;
  const query = fixture.queries[queryIndex % fixture.queries.length]!;

  if (countPiecesOnBoard(fixture.fen) !== fixture.pieceCount) {
    throw new Error(
      `Fixture piece count mismatch for ${generatorId} seed ${seed}`,
    );
  }

  const squaresTouched = [
    ...new Set(fixture.queries.map((item) => item.expected)),
  ] as Square[];

  return {
    id: puzzleId(generatorId, seed),
    fen: fixture.fen,
    moves: [],
    prompt: query.prompt,
    inputPlaceholder: 'e.g. a8',
    answerType: 'square',
    expected: query.expected,
    squaresTouched,
    subtitle: fixture.subtitle,
  };
}

export function buildStaticRecall2Puzzle(seed: string): GeneratedTrainingPuzzle {
  return buildStaticRecallPuzzle('static_recall_2', STATIC_RECALL_2, seed);
}

export function buildStaticRecall4Puzzle(seed: string): GeneratedTrainingPuzzle {
  return buildStaticRecallPuzzle('static_recall_4', STATIC_RECALL_4, seed);
}

export function buildStaticRecall6Puzzle(seed: string): GeneratedTrainingPuzzle {
  return buildStaticRecallPuzzle('static_recall_6', STATIC_RECALL_6, seed);
}
