import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

/** Centipawn bonus for side to move when in check (encourages giving check). */
const CHECK_BONUS = 35;

type BoardSquare = ReturnType<Chess['board']>[number][number];

const PAWN_PST: Record<Color, number[][]> = {
  w: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  b: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
};

const KNIGHT_PST: Record<Color, number[][]> = {
  w: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  b: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
};

const BISHOP_PST: Record<Color, number[][]> = {
  w: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
};

const ROOK_PST: Record<Color, number[][]> = {
  w: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  b: [
    [0, 0, 0, 5, 5, 0, 0, 0],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
};

const QUEEN_PST: Record<Color, number[][]> = {
  w: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  b: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
};

const KING_MID_PST: Record<Color, number[][]> = {
  w: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -20, -20, -20, -20, -20, -20, -20],
    [-10, -10, -10, -10, -10, -10, -10, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
  b: [
    [20, 30, 10, 0, 0, 10, 30, 20],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [-10, -10, -10, -10, -10, -10, -10, -10],
    [-20, -20, -20, -20, -20, -20, -20, -20],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
  ],
};

function squareIndex(square: Square): { file: number; rank: number } {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = Number(square[1]) - 1;
  return { file, rank };
}

function pstValue(
  piece: NonNullable<BoardSquare>,
  square: Square,
): number {
  const { file, rank } = squareIndex(square);
  const tableRank = piece.color === 'w' ? 7 - rank : rank;

  switch (piece.type) {
    case 'p':
      return PAWN_PST[piece.color][tableRank][file];
    case 'n':
      return KNIGHT_PST[piece.color][tableRank][file];
    case 'b':
      return BISHOP_PST[piece.color][tableRank][file];
    case 'r':
      return ROOK_PST[piece.color][tableRank][file];
    case 'q':
      return QUEEN_PST[piece.color][tableRank][file];
    case 'k':
      return KING_MID_PST[piece.color][tableRank][file];
    default:
      return 0;
  }
}

function evaluate(chess: Chess, forColor: Color): number {
  if (chess.isCheckmate()) {
    return chess.turn() === forColor ? -30_000 : 30_000;
  }
  if (chess.isDraw()) return 0;

  let score = 0;
  const board = chess.board();

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece) continue;
      const square = `${String.fromCharCode('a'.charCodeAt(0) + file)}${8 - rank}` as Square;
      const value = PIECE_VALUES[piece.type] + pstValue(piece, square);
      score += piece.color === forColor ? value : -value;
    }
  }

  if (chess.inCheck()) {
    score += chess.turn() === forColor ? -CHECK_BONUS : CHECK_BONUS;
  }

  return score;
}

interface EloProfile {
  depth: number;
  blunderRate: number;
  /** Centipawns — 2nd-best move within this gap may be chosen. */
  noiseCp: number;
  /** Fraction of ranked moves skipped when blundering (higher = worse blunders). */
  blunderPoolStart: number;
}

function interpolate(elo: number, anchors: [number, number][]): number {
  if (elo <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (elo >= last[0]) return last[1];

  for (let i = 0; i < anchors.length - 1; i++) {
    const [e0, v0] = anchors[i];
    const [e1, v1] = anchors[i + 1];
    if (elo >= e0 && elo <= e1) {
      const t = (elo - e0) / (e1 - e0);
      return v0 + t * (v1 - v0);
    }
  }
  return last[1];
}

export function eloProfile(elo: number): EloProfile {
  return {
    depth: Math.round(
      interpolate(elo, [
        [300, 1],
        [600, 1],
        [900, 2],
        [1200, 3],
        [1320, 3],
      ]),
    ),
    blunderRate: interpolate(elo, [
      [300, 0.48],
      [500, 0.38],
      [700, 0.28],
      [900, 0.18],
      [1100, 0.1],
      [1320, 0.05],
    ]),
    noiseCp: interpolate(elo, [
      [300, 350],
      [500, 280],
      [700, 220],
      [900, 160],
      [1100, 100],
      [1320, 55],
    ]),
    blunderPoolStart: interpolate(elo, [
      [300, 0.55],
      [600, 0.4],
      [900, 0.25],
      [1200, 0.15],
      [1320, 0.1],
    ]),
  };
}

function alphaBeta(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  forColor: Color,
  maximizing: boolean,
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluate(chess, forColor);
  }

  const moves = chess.moves({ verbose: true });

  if (maximizing) {
    let value = -Infinity;
    for (const move of moves) {
      chess.move(move);
      value = Math.max(
        value,
        alphaBeta(chess, depth - 1, alpha, beta, forColor, false),
      );
      chess.undo();
      alpha = Math.max(alpha, value);
      if (beta <= alpha) break;
    }
    return value;
  }

  let value = Infinity;
  for (const move of moves) {
    chess.move(move);
    value = Math.min(
      value,
      alphaBeta(chess, depth - 1, alpha, beta, forColor, true),
    );
    chess.undo();
    beta = Math.min(beta, value);
    if (beta <= alpha) break;
  }
  return value;
}

interface ScoredMove {
  san: string;
  score: number;
}

function scoreRootMoves(
  chess: Chess,
  depth: number,
  forColor: Color,
  candidateSans?: string[],
): ScoredMove[] {
  const allMoves = chess.moves({ verbose: true });
  const moves = candidateSans
    ? allMoves.filter((move) => candidateSans.includes(move.san))
    : allMoves;
  const scored: ScoredMove[] = [];

  for (const move of moves) {
    chess.move(move);
    const score = alphaBeta(chess, depth - 1, -Infinity, Infinity, forColor, false);
    chess.undo();
    scored.push({ san: move.san, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

const TOP_CANDIDATES = 6;

function searchBestMoves(
  chess: Chess,
  profile: EloProfile,
  forColor: Color,
): ScoredMove[] {
  if (profile.depth <= 1) {
    return scoreRootMoves(chess, 1, forColor);
  }

  const shallow = scoreRootMoves(chess, 1, forColor);
  const topSans = shallow.slice(0, TOP_CANDIDATES).map((move) => move.san);
  return scoreRootMoves(chess, profile.depth, forColor, topSans);
}

function pickHumanMove(scored: ScoredMove[], profile: EloProfile): string {
  if (scored.length === 0) return '';
  if (scored.length === 1) return scored[0].san;

  if (Math.random() < profile.blunderRate) {
    const start = Math.max(1, Math.floor(scored.length * profile.blunderPoolStart));
    const blunderPool = scored.slice(start);
    const pool = blunderPool.length > 0 ? blunderPool : scored.slice(1);
    const index = Math.floor(Math.random() * pool.length);
    return pool[index].san;
  }

  const best = scored[0].score;
  const candidates = scored.filter(
    (move) => best - move.score <= profile.noiseCp,
  );
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index].san;
}

/** Alpha-beta + PST eval with Elo-scaled depth and human-like noise. */
export function getFallbackMove(fen: string, elo: number): string {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return '';

  const engineColor = chess.turn();
  const profile = eloProfile(elo);
  const scored = searchBestMoves(chess, profile, engineColor);
  return pickHumanMove(scored, profile);
}
