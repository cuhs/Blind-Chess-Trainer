import { Chess, type Move } from 'chess.js';

const PIECE_ALIASES: Record<string, string> = {
  knight: 'n',
  night: 'n',
  horse: 'n',
  bishop: 'b',
  rook: 'r',
  queen: 'q',
  king: 'k',
  pawn: '',
};

const PIECE_NAMES: Record<string, string> = {
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
  p: 'pawn',
};

const SAN_PATTERN =
  /^[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](=[NBRQK])?[+#]?$|^O-O(-O)?[+#]?$/i;

const PARTIAL_CAPTURE = /^x([a-h][1-8])$/i;
const PARTIAL_DEST = /^([a-h][1-8])$/;
const PARTIAL_PIECE_DEST = /^([nbrqk])([a-h][1-8])$/i;
const PARTIAL_PIECE_CAPTURE = /^([nbrqk])x([a-h][1-8])$/i;

export type MoveCandidate = {
  san: string;
  label: string;
};

export type ResolveMoveResult =
  | { ok: true; san: string }
  | { ok: false; reason: string }
  | { ok: false; ambiguous: true; prompt: string; candidates: MoveCandidate[] };

function stripCheckMate(token: string): string {
  return token.replace(/[+#]+$/, '');
}

function isCapture(flags: string): boolean {
  return flags.includes('c') || flags.includes('e');
}

export function normalizeMove(
  input: string,
): { ok: true; value: string } | { ok: false } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false };

  const compact = stripCheckMate(trimmed.replace(/\s+/g, ''));

  if (/^0-0(-0)?$/i.test(compact)) {
    return { ok: true, value: compact.replace(/0/g, 'O') };
  }

  if (SAN_PATTERN.test(compact)) {
    return { ok: true, value: compact };
  }

  const lower = trimmed.toLowerCase();
  const parts = lower.split(/\s+/);

  if (parts.length === 2) {
    if (PIECE_ALIASES[parts[0]] !== undefined) {
      const piece = PIECE_ALIASES[parts[0]];
      const dest = parts[1].replace(/[^a-h1-8]/g, '');
      if (/^[a-h][1-8]$/.test(dest)) {
        const prefix = piece === '' ? '' : piece.toUpperCase();
        return { ok: true, value: `${prefix}${dest}` };
      }
    }

    if (parts[0] === 'takes' || parts[0] === 'capture' || parts[0] === 'captures') {
      const dest = parts[1].replace(/[^a-h1-8]/g, '');
      if (/^[a-h][1-8]$/.test(dest)) {
        return { ok: true, value: `x${dest}` };
      }
    }
  }

  const pawnDest = lower.replace(/\s/g, '');
  if (PARTIAL_DEST.test(pawnDest)) {
    return { ok: true, value: pawnDest };
  }

  if (PARTIAL_CAPTURE.test(pawnDest)) {
    return { ok: true, value: pawnDest };
  }

  return { ok: false };
}

function moveMatchesToken(move: Move, token: string): boolean {
  const t = stripCheckMate(token).toLowerCase();
  const san = stripCheckMate(move.san).toLowerCase();

  if (san === t) return true;

  const destOnly = PARTIAL_DEST.exec(t);
  if (destOnly) {
    return move.to === destOnly[1];
  }

  const captureOnly = PARTIAL_CAPTURE.exec(t);
  if (captureOnly) {
    return move.to === captureOnly[1] && isCapture(move.flags);
  }

  const pieceDest = PARTIAL_PIECE_DEST.exec(t);
  if (pieceDest) {
    return move.piece === pieceDest[1] && move.to === pieceDest[2];
  }

  const pieceCapture = PARTIAL_PIECE_CAPTURE.exec(t);
  if (pieceCapture) {
    return (
      move.piece === pieceCapture[1] &&
      move.to === pieceCapture[2] &&
      isCapture(move.flags)
    );
  }

  return false;
}

function candidateLabel(move: Move): string {
  const piece = PIECE_NAMES[move.piece] ?? move.piece;
  const fromFile = move.from[0];
  const fromRank = move.from[1];
  const to = move.to;

  if (move.piece === 'p') {
    if (isCapture(move.flags)) {
      return `Pawn ${fromFile}-file captures ${to}`;
    }
    return `Pawn to ${to}`;
  }

  if (isCapture(move.flags)) {
    return `${piece[0].toUpperCase()}${piece.slice(1)} on ${fromFile}${fromRank} takes ${to}`;
  }

  return `${piece[0].toUpperCase()}${piece.slice(1)} on ${fromFile}${fromRank} to ${to}`;
}

function ambiguousPrompt(moves: Move[]): string {
  const piece = moves[0]?.piece;
  if (!piece) return 'Which move?';

  const dest = moves[0]?.to;
  const sameDest = moves.every((move) => move.to === dest);
  const pieceName = PIECE_NAMES[piece] ?? 'piece';

  if (sameDest && piece !== 'p') {
    return `Which ${pieceName}?`;
  }

  if (sameDest && piece === 'p' && isCapture(moves[0].flags)) {
    return `Which pawn captures ${dest}?`;
  }

  return 'Which move?';
}

function narrowCaptureMatches(matches: Move[]): Move[] {
  if (matches.length <= 1) return matches;

  const dest = matches[0].to;
  const sameDest = matches.every((move) => move.to === dest);
  if (!sameDest) return matches;

  const captures = matches.filter((move) => isCapture(move.flags));
  if (captures.length <= 1) return matches;

  const pawnCaptures = captures.filter((move) => move.piece === 'p');
  if (pawnCaptures.length >= 1) return pawnCaptures;

  return matches;
}

export function resolveMove(fen: string, input: string): ResolveMoveResult {
  const normalized = normalizeMove(input);
  if (!normalized.ok) {
    return { ok: false, reason: 'Could not parse move' };
  }

  const chess = new Chess(fen);
  const token = normalized.value;

  try {
    const direct = chess.move(token);
    if (direct) {
      return { ok: true, san: direct.san };
    }
  } catch {
    // Fall through to partial matching.
  }

  const legalMoves = chess.moves({ verbose: true });
  const matches = narrowCaptureMatches(
    legalMoves.filter((move) => moveMatchesToken(move, token)),
  );

  if (matches.length === 1) {
    return { ok: true, san: matches[0].san };
  }

  if (matches.length > 1) {
    return {
      ok: false,
      ambiguous: true,
      prompt: ambiguousPrompt(matches),
      candidates: matches.map((move) => ({
        san: move.san,
        label: candidateLabel(move),
      })),
    };
  }

  return { ok: false, reason: 'Illegal move' };
}

export function validateMove(
  fen: string,
  input: string,
): { ok: true; san: string } | { ok: false; reason: string } {
  const result = resolveMove(fen, input);
  if (result.ok) {
    return { ok: true, san: result.san };
  }
  if ('ambiguous' in result && result.ambiguous) {
    return { ok: false, reason: result.prompt };
  }
  return { ok: false, reason: result.reason };
}
