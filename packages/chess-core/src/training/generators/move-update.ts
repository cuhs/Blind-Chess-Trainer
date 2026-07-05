import { Chess } from 'chess.js';
import type { Square } from '@mindboard/shared';
import type { GeneratedTrainingPuzzle } from './types';

interface MoveUpdateFixture {
  fen: string;
  move: string;
  kind: 'landing' | 'vacated' | 'capture';
  prompt: string;
  /** Spoken aloud — must not name landing, departure, or capture. */
  narration: string;
}

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const AFTER_E4_FEN =
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
const ITALIAN_FEN =
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3';

const MOVE_UPDATE_FIXTURES: MoveUpdateFixture[] = [
  {
    fen: START_FEN,
    move: 'Nf3',
    kind: 'landing',
    prompt: 'Where did the piece land?',
    narration: 'White develops the kingside knight.',
  },
  {
    fen: AFTER_E4_FEN,
    move: 'Nf6',
    kind: 'landing',
    prompt: 'Where did the piece land?',
    narration: 'Black develops the kingside knight.',
  },
  {
    fen: ITALIAN_FEN,
    move: 'Bc4',
    kind: 'landing',
    prompt: 'Where did the piece land?',
    narration: 'White develops the light-squared bishop.',
  },
  {
    fen: START_FEN,
    move: 'Nf3',
    kind: 'vacated',
    prompt: 'Which square was vacated?',
    narration: 'White develops the kingside knight.',
  },
  {
    fen: START_FEN,
    move: 'Nc3',
    kind: 'vacated',
    prompt: 'Which square was vacated?',
    narration: 'White develops the queenside knight.',
  },
  {
    fen: ITALIAN_FEN,
    move: 'Bc4',
    kind: 'vacated',
    prompt: 'Which square was vacated?',
    narration: 'White develops the light-squared bishop.',
  },
  {
    fen: AFTER_E4_FEN,
    move: 'd5',
    kind: 'capture',
    prompt: 'Was a piece captured?',
    narration: 'Black challenges the center with a pawn push.',
  },
  {
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    move: 'exd5',
    kind: 'capture',
    prompt: 'Was a piece captured?',
    narration: 'White answers on the d-file.',
  },
  {
    fen: 'rnbqkbnr/pp2pppp/2p5/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 3',
    move: 'cxd5',
    kind: 'capture',
    prompt: 'Was a piece captured?',
    narration: 'Black replies on the d-file.',
  },
];

function puzzleId(generatorId: string, seed: string): GeneratedTrainingPuzzle['id'] {
  return `gen-${generatorId}-${seed}`;
}

function fixtureForKind(
  kind: MoveUpdateFixture['kind'],
  seed: string,
): MoveUpdateFixture {
  const index = Number.parseInt(seed, 10);
  const matches = MOVE_UPDATE_FIXTURES.filter((fixture) => fixture.kind === kind);
  const fixture = matches[index % matches.length];
  if (!fixture) {
    throw new Error(`No move_update fixture for kind ${kind}`);
  }
  return fixture;
}

function buildMoveUpdatePuzzle(
  generatorId: string,
  kind: MoveUpdateFixture['kind'],
  seed: string,
): GeneratedTrainingPuzzle {
  const fixture = fixtureForKind(kind, seed);
  const chess = new Chess(fixture.fen);
  const move = chess.move(fixture.move);
  if (!move) {
    throw new Error(`Illegal move ${fixture.move} in move_update fixture`);
  }

  const base = {
    id: puzzleId(generatorId, seed),
    fen: fixture.fen,
    moves: [fixture.move],
    narrationScript: fixture.narration,
    prompt: fixture.prompt,
    squaresTouched: [move.from as Square, move.to as Square],
    showBoard: true,
  };

  if (kind === 'landing') {
    return {
      ...base,
      inputPlaceholder: 'e.g. a8',
      answerType: 'square',
      expected: move.to as Square,
      subtitle: 'Hear the move, track where it lands.',
    };
  }

  if (kind === 'vacated') {
    return {
      ...base,
      inputPlaceholder: 'e.g. a8',
      answerType: 'square',
      expected: move.from as Square,
      subtitle: 'Hear the move, track the square it left.',
    };
  }

  return {
    ...base,
    answerType: 'yes-no',
    expected: move.captured ? 'yes' : 'no',
    subtitle: 'Hear the move, notice if anything was taken.',
  };
}

export function buildMoveUpdateLandingPuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildMoveUpdatePuzzle('move_update_landing', 'landing', seed);
}

export function buildMoveUpdateVacatedPuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildMoveUpdatePuzzle('move_update_vacated', 'vacated', seed);
}

export function buildMoveUpdateCapturePuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildMoveUpdatePuzzle('move_update_capture', 'capture', seed);
}
