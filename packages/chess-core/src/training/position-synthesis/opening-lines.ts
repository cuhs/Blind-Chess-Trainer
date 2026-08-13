import { Chess } from 'chess.js';
import type { Color, PieceSymbol } from 'chess.js';
import type { Square } from '@mindboard/shared';
import { pickFrom, seedToRng } from '../seed';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const OPENING_FENS = [
  START_FEN,
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3',
  'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
  'rnbqkbnr/pp2pppp/2p5/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 3',
];

const PIECE_NARRATION: Record<PieceSymbol, { w: string; b: string }> = {
  p: { w: 'White pushes a central pawn.', b: 'Black pushes a central pawn.' },
  n: {
    w: 'White develops the kingside knight.',
    b: 'Black develops the kingside knight.',
  },
  b: {
    w: 'White develops the light-squared bishop.',
    b: 'Black develops the dark-squared bishop.',
  },
  r: { w: 'White activates a rook.', b: 'Black activates a rook.' },
  q: { w: 'White brings the queen out.', b: 'Black brings the queen out.' },
  k: { w: 'White moves the king.', b: 'Black moves the king.' },
};

export interface OpeningMoveLine {
  fen: string;
  moves: string[];
  displayFen: string;
}

export interface SingleMoveLine {
  fen: string;
  move: string;
  from: Square;
  to: Square;
  captured: boolean;
  narration: string;
}

export function synthesizeOpeningLine(
  seed: string,
  minMoves: number,
  maxMoves: number,
): OpeningMoveLine {
  const rng = seedToRng(`opening:${seed}`);
  const baseFen = pickFrom(rng, OPENING_FENS);
  const chess = new Chess(baseFen);
  const moves: string[] = [];
  const targetMoves =
    minMoves + Math.floor(rng() * (maxMoves - minMoves + 1));

  for (let i = 0; i < targetMoves; i += 1) {
    const legal = chess.moves();
    if (legal.length === 0) break;
    const move = pickFrom(rng, legal);
    chess.move(move);
    moves.push(move);
  }

  return {
    fen: baseFen,
    moves,
    displayFen: chess.fen(),
  };
}

export function synthesizeSingleMove(
  seed: string,
  preferCapture: boolean,
): SingleMoveLine {
  const rng = seedToRng(`single-move:${seed}`);

  for (let attempt = 0; attempt < 32; attempt += 1) {
    const baseFen = pickFrom(rng, OPENING_FENS);
    const chess = new Chess(baseFen);
    const verbose = chess.moves({ verbose: true });
    const candidates = verbose.filter((move) =>
      preferCapture ? Boolean(move.captured) : true,
    );
    const pool = candidates.length > 0 ? candidates : verbose;
    if (pool.length === 0) continue;

    const move = pickFrom(rng, pool);
    const pieceType = move.piece as PieceSymbol;
    const color = move.color as Color;
    const narration =
      PIECE_NARRATION[pieceType]?.[color] ??
      `${color === 'w' ? 'White' : 'Black'} makes a move.`;

    return {
      fen: baseFen,
      move: move.san,
      from: move.from as Square,
      to: move.to as Square,
      captured: Boolean(move.captured),
      narration,
    };
  }

  throw new Error(`Failed to synthesize single move for seed ${seed}`);
}

export { START_FEN, OPENING_FENS };
