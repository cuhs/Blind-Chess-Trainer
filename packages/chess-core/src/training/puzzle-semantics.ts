import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';
import { applyMoves } from '../validate';

export const PIECE_WORD: Record<string, PieceSymbol> = {
  king: 'k',
  queen: 'q',
  rook: 'r',
  bishop: 'b',
  knight: 'n',
  pawn: 'p',
};

export function displayFen(fen: string, moves: string[]): string {
  return moves.length > 0 ? applyMoves(fen, moves) : fen;
}

export function loadFen(fen: string): Chess | null {
  try {
    return new Chess(fen);
  } catch {
    return null;
  }
}

export function parsePieceFromPrompt(prompt: string): {
  color: Color;
  type: PieceSymbol;
} | null {
  const match = prompt.match(
    /\b(white|black)\s+(king|queen|rook|bishop|knight|pawn)\b/i,
  );
  if (!match) return null;
  return {
    color: match[1]!.toLowerCase().startsWith('w') ? 'w' : 'b',
    type: PIECE_WORD[match[2]!.toLowerCase()]!,
  };
}

export function extractSquareFromPrompt(prompt: string): Square | null {
  const match = prompt.match(/\b([a-h][1-8])\b/i);
  return match ? (match[1]!.toLowerCase() as Square) : null;
}

export function promptLeaksSquare(text: string, square: string): boolean {
  return text.toLowerCase().includes(square.toLowerCase());
}

export function isPawnIsolated(
  chess: Chess,
  square: Square,
  color: Color,
): boolean {
  const piece = chess.get(square);
  if (!piece || piece.type !== 'p' || piece.color !== color) return false;

  const files = 'abcdefgh';
  const fileIndex = files.indexOf(square[0]!);
  for (const neighbor of [fileIndex - 1, fileIndex + 1]) {
    if (neighbor < 0 || neighbor > 7) continue;
    const neighborFile = files[neighbor]!;
    for (let rank = 1; rank <= 8; rank += 1) {
      const neighborPiece = chess.get(`${neighborFile}${rank}` as Square);
      if (
        neighborPiece &&
        neighborPiece.color === color &&
        neighborPiece.type === 'p'
      ) {
        return false;
      }
    }
  }
  return true;
}

export function pawnDiagonallyDefends(
  chess: Chess,
  defender: Square,
  defended: Square,
  color: Color,
): boolean {
  const defenderPiece = chess.get(defender);
  const defendedPiece = chess.get(defended);
  if (
    !defenderPiece ||
    !defendedPiece ||
    defenderPiece.type !== 'p' ||
    defendedPiece.type !== 'p' ||
    defenderPiece.color !== color ||
    defendedPiece.color !== color
  ) {
    return false;
  }

  const defenderFile = defender.charCodeAt(0) - 'a'.charCodeAt(0);
  const defenderRank = Number.parseInt(defender[1]!, 10);
  const targetFile = defended.charCodeAt(0) - 'a'.charCodeAt(0);
  const targetRank = Number.parseInt(defended[1]!, 10);
  const fileDelta = Math.abs(targetFile - defenderFile);
  const rankDelta = targetRank - defenderRank;

  if (fileDelta !== 1) return false;
  return color === 'w' ? rankDelta === 1 : rankDelta === -1;
}

export function hasKingsideFianchetto(chess: Chess, color: Color): boolean {
  const bishopSquare = color === 'w' ? 'g2' : 'g7';
  const pawnSquare = color === 'w' ? 'g3' : 'g6';
  const bishop = chess.get(bishopSquare);
  const pawn = chess.get(pawnSquare);
  return (
    bishop?.type === 'b' &&
    bishop.color === color &&
    pawn?.type === 'p' &&
    pawn.color === color
  );
}

export function hasCastledKingside(chess: Chess, color: Color): boolean {
  const kingSquare = color === 'w' ? 'g1' : 'g8';
  const rookSquare = color === 'w' ? 'f1' : 'f8';
  const king = chess.get(kingSquare);
  const rook = chess.get(rookSquare);
  return (
    king?.type === 'k' &&
    king.color === color &&
    rook?.type === 'r' &&
    rook.color === color
  );
}

export function isColorInCheck(fen: string, color: Color): boolean {
  const chess = new Chess(fen);
  return chess.turn() === color && chess.inCheck();
}

export function previousFenFor(
  fen: string,
  moves: string[],
): string | undefined {
  if (moves.length === 0) return undefined;
  if (moves.length === 1) return fen;
  return applyMoves(fen, moves.slice(0, -1));
}

export function solveCoordinateNeighborSeed(seed: string): Square | null {
  const fixed = /^([a-h][1-8]):(rank|file)$/.exec(seed);
  if (!fixed) return null;
  const square = fixed[1] as Square;
  const axis = fixed[2] as 'rank' | 'file';
  const file = square.charCodeAt(0);
  const rank = Number.parseInt(square[1]!, 10);
  const expected =
    axis === 'rank'
      ? (`${square[0]}${rank + 1}` as Square)
      : (`${String.fromCharCode(file + 1)}${square[1]}` as Square);
  return /^[a-h][1-8]$/.test(expected) ? expected : null;
}

export function solveKnightReachSeed(seed: string): 'yes' | 'no' | null {
  const fixed = /^([a-h][1-8]):([a-h][1-8])$/.exec(seed);
  if (!fixed) return null;
  const from = fixed[1] as Square;
  const to = fixed[2] as Square;
  const chess = new Chess();
  chess.remove('a1' as Square);
  chess.put({ type: 'n', color: 'w' }, from);
  const canReach = chess
    .moves({ square: from, verbose: true })
    .some((move) => move.to === to);
  return canReach ? 'yes' : 'no';
}
