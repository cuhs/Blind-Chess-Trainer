import type { Square } from '@mindboard/shared';
import type { GeneratedTrainingPuzzle } from './types';
import { pickFrom, seedToRng, puzzleId } from '../seed';

interface ChunkFixture {
  fen: string;
  prompt: string;
  answerType: 'yes-no' | 'square';
  expected: string;
  squaresTouched: Square[];
  subtitle: string;
}

const CHUNK_CASTLED: ChunkFixture[] = [
  {
    fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
    prompt: 'Has White castled kingside?',
    answerType: 'yes-no',
    expected: 'no',
    squaresTouched: ['e1', 'h1', 'g1'],
    subtitle: 'Recognize castling patterns.',
  },
  {
    fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R4RK1 w - - 0 1',
    prompt: 'Has White castled kingside?',
    answerType: 'yes-no',
    expected: 'yes',
    squaresTouched: ['g1', 'f1', 'h1'],
    subtitle: 'Recognize castling patterns.',
  },
  {
    fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
    prompt: 'Which square is the White King on?',
    answerType: 'square',
    expected: 'e1',
    squaresTouched: ['e1', 'h1'],
    subtitle: 'Recognize castling patterns.',
  },
  {
    fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R4RK1 w - - 0 1',
    prompt: 'Which square is the White King on?',
    answerType: 'square',
    expected: 'g1',
    squaresTouched: ['g1', 'f1'],
    subtitle: 'Recognize castling patterns.',
  },
];

const CHUNK_FIANCHETTO: ChunkFixture[] = [
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/6P1/PPPPPPBP/RNBQK1NR w KQkq - 0 1',
    prompt: 'Which square is the fianchettoed bishop on?',
    answerType: 'square',
    expected: 'g2',
    squaresTouched: ['g2', 'f1'],
    subtitle: 'Spot fianchetto structures.',
  },
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    prompt: 'Has White fianchettoed a bishop?',
    answerType: 'yes-no',
    expected: 'no',
    squaresTouched: ['c1', 'f1'],
    subtitle: 'Spot fianchetto structures.',
  },
  {
    fen: 'rnbqk2r/ppppppbp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',
    prompt: 'Has Black fianchettoed the kingside bishop?',
    answerType: 'yes-no',
    expected: 'yes',
    squaresTouched: ['g7', 'f8'],
    subtitle: 'Spot fianchetto structures.',
  },
  {
    fen: 'rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 2 3',
    prompt: 'Has White fianchettoed a bishop?',
    answerType: 'yes-no',
    expected: 'no',
    squaresTouched: ['c1', 'f1'],
    subtitle: 'Spot fianchetto structures.',
  },
];

const CHUNK_PAWN_CHAIN: ChunkFixture[] = [
  {
    fen: 'rnbqkbnr/pppp1ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
    prompt: 'Does Black have a pawn chain on d5 and e6?',
    answerType: 'yes-no',
    expected: 'yes',
    squaresTouched: ['d5', 'e6'],
    subtitle: 'See pawn structures.',
  },
  {
    fen: 'rnbqkbnr/ppp2ppp/4p3/3P4/2P5/8/PPP2PPP/RNBQKBNR b KQkq - 0 1',
    prompt: 'Does White have a pawn chain on c4 and d5?',
    answerType: 'yes-no',
    expected: 'yes',
    squaresTouched: ['c4', 'd5'],
    subtitle: 'See pawn structures.',
  },
  {
    fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    prompt: 'Is the White pawn on e4 isolated?',
    answerType: 'yes-no',
    expected: 'no',
    squaresTouched: ['e4', 'c2', 'f2'],
    subtitle: 'See pawn structures.',
  },
  {
    fen: 'rnbqkbnr/pp1ppppp/8/8/3P4/8/PP3PPP/RNBQKBNR w KQkq - 0 2',
    prompt: 'Is the White pawn on d4 isolated?',
    answerType: 'yes-no',
    expected: 'yes',
    squaresTouched: ['d4', 'c2', 'e2'],
    subtitle: 'See pawn structures.',
  },
];

function buildChunkPuzzle(
  generatorId: string,
  fixtures: ChunkFixture[],
  seed: string,
): GeneratedTrainingPuzzle {
  const rng = seedToRng(`${generatorId}:${seed}`);
  const fixture = pickFrom(rng, fixtures);

  return {
    id: puzzleId(generatorId, seed),
    fen: fixture.fen,
    moves: [],
    prompt: fixture.prompt,
    inputPlaceholder:
      fixture.answerType === 'square' ? 'e.g. a8' : undefined,
    answerType: fixture.answerType,
    expected: fixture.expected,
    squaresTouched: fixture.squaresTouched,
    subtitle: fixture.subtitle,
  };
}

export function buildChunkCastledPuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildChunkPuzzle('chunk_castled', CHUNK_CASTLED, seed);
}

export function buildChunkFianchettoPuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildChunkPuzzle('chunk_fianchetto', CHUNK_FIANCHETTO, seed);
}

export function buildChunkPawnChainPuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildChunkPuzzle('chunk_pawn_chain', CHUNK_PAWN_CHAIN, seed);
}
