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

const ROOK_HOMOPHONES = new Set(['rook', 'are', 'hour', 'our']);

const SPOKEN_RANKS: Record<string, string> = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  for: '4',
  too: '2',
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

function spokenRank(token: string): string {
  const lower = token.toLowerCase();
  return SPOKEN_RANKS[lower] ?? lower;
}

function parseSquareToken(token: string): string | null {
  const lower = token.toLowerCase().trim();
  const cleaned = lower.replace(/[^a-h1-8]/g, '');
  if (/^[a-h][1-8]$/.test(cleaned)) return cleaned;

  const fileMatch = /^([a-h])\s*(.+)$/i.exec(lower);
  if (!fileMatch) return null;

  const rank = spokenRank(fileMatch[2]).replace(/[^1-8]/g, '');
  const dest = `${fileMatch[1]}${rank}`;
  return /^[a-h][1-8]$/.test(dest) ? dest : null;
}

function piecePrefix(piece: string): string {
  return piece === '' ? '' : piece.toUpperCase();
}

function pieceAliasForWord(word: string): string | undefined {
  const lower = word.toLowerCase();
  if (/^[nbrqk]$/.test(lower)) {
    return lower;
  }
  if (PIECE_ALIASES[lower] !== undefined) {
    return PIECE_ALIASES[lower];
  }
  if (ROOK_HOMOPHONES.has(lower)) {
    return 'r';
  }
  return undefined;
}

function stripSpokenCheckMate(text: string): string {
  return text
    .replace(/\b(?:checkmate)\b/g, ' ')
    .replace(/\bmate\b/g, ' ')
    .replace(/\bcheck\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSanCompact(compact: string): string {
  if (/^[nbrqk]/i.test(compact)) {
    return compact[0].toUpperCase() + compact.slice(1);
  }
  return compact;
}

function pieceDestFromAlias(pieceWord: string, destToken: string): string | null {
  const alias = pieceAliasForWord(pieceWord);
  if (alias === undefined) return null;
  const dest = parseSquareToken(destToken);
  if (!dest) return null;
  return `${piecePrefix(alias)}${dest}`;
}

function isCapture(flags: string): boolean {
  return flags.includes('c') || flags.includes('e');
}

export type ResolveDisambiguationResult =
  | { ok: true; san: string }
  | { ok: false };

function normalizeCastlingPhrase(lower: string): string | null {
  if (/^(?:castle|castles?)\s+(?:king\s*side|kingside)$/.test(lower)) {
    return 'O-O';
  }
  if (/^(?:castle|castles?)\s+(?:queen\s*side|queenside)$/.test(lower)) {
    return 'O-O-O';
  }
  if (/^(?:king\s*side|kingside)$/.test(lower)) {
    return 'O-O';
  }
  if (/^(?:queen\s*side|queenside)$/.test(lower)) {
    return 'O-O-O';
  }
  return null;
}

export function normalizeMove(
  input: string,
): { ok: true; value: string } | { ok: false } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false };

  const lower = stripSpokenCheckMate(trimmed.toLowerCase());
  const castling = normalizeCastlingPhrase(lower);
  if (castling) {
    return { ok: true, value: castling };
  }

  const compact = stripCheckMate(lower.replace(/\s+/g, ''));

  if (/^0-0(-0)?$/i.test(compact)) {
    return { ok: true, value: compact.replace(/0/g, 'O') };
  }

  if (SAN_PATTERN.test(compact)) {
    return { ok: true, value: normalizeSanCompact(compact) };
  }

  const pieceDest = PARTIAL_PIECE_DEST.exec(compact);
  if (pieceDest) {
    return {
      ok: true,
      value: `${pieceDest[1].toUpperCase()}${pieceDest[2]}`,
    };
  }

  const pieceCapture = PARTIAL_PIECE_CAPTURE.exec(compact);
  if (pieceCapture) {
    return {
      ok: true,
      value: `${pieceCapture[1].toUpperCase()}x${pieceCapture[2]}`,
    };
  }

  const parts = lower.split(/\s+/);

  if (parts.length === 3 && parts[1] === 'to') {
    const spoken = pieceDestFromAlias(parts[0], parts[2]);
    if (spoken) return { ok: true, value: spoken };
  }

  if (
    parts.length === 3 &&
    (parts[1] === 'takes' || parts[1] === 'capture' || parts[1] === 'captures')
  ) {
    const alias = pieceAliasForWord(parts[0]);
    const dest = parseSquareToken(parts[2]);
    if (alias !== undefined && dest) {
      return { ok: true, value: `${piecePrefix(alias)}x${dest}` };
    }
  }

  if (parts.length === 3 && /^[nbrqk]$/i.test(parts[0]) && /^[a-h]$/.test(parts[1])) {
    const rank = spokenRank(parts[2]);
    const dest = `${parts[1]}${rank}`;
    if (/^[a-h][1-8]$/.test(dest)) {
      return { ok: true, value: `${parts[0].toUpperCase()}${dest}` };
    }
  }

  if (parts.length === 3 && /^[a-h]$/.test(parts[1])) {
    const rank = spokenRank(parts[2]);
    const spoken = pieceDestFromAlias(parts[0], `${parts[1]}${rank}`);
    if (spoken) return { ok: true, value: spoken };
  }

  if (parts.length === 3 && parts[1] === 'file') {
    const spoken = pieceDestFromAlias(parts[2], parts[0]);
    if (spoken) return { ok: true, value: spoken };
  }

  if (parts.length === 2) {
    if (pieceAliasForWord(parts[0]) !== undefined) {
      const spoken = pieceDestFromAlias(parts[0], parts[1]);
      if (spoken) return { ok: true, value: spoken };
    }

    if (parts[1] === 'file' && /^[a-h]$/.test(parts[0])) {
      return { ok: false };
    }

    if (parts[0] === 'takes' || parts[0] === 'capture' || parts[0] === 'captures') {
      const dest = parseSquareToken(parts[1]);
      if (dest) {
        return { ok: true, value: `x${dest}` };
      }
    }
  }

  const pawnDest = lower.replace(/\s/g, '');
  const pawnDestSquare = parseSquareToken(pawnDest);
  if (pawnDestSquare && PARTIAL_DEST.test(pawnDestSquare)) {
    return { ok: true, value: pawnDestSquare };
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

function sanTokenMatches(candidateSan: string, token: string): boolean {
  return (
    stripCheckMate(candidateSan).toLowerCase() ===
    stripCheckMate(token).toLowerCase()
  );
}

function extractFileHint(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  const exact = /^(?:the\s+)?([a-h])(?:\s*-?\s*file)?$/.exec(trimmed);
  if (exact) return exact[1];

  const embedded = /\b([a-h])\s*-?\s*file\b/.exec(trimmed);
  return embedded?.[1] ?? null;
}

function extractOriginSquare(input: string): string | null {
  const match = /\b([a-h][1-8])\b/i.exec(input);
  return match?.[1].toLowerCase() ?? null;
}

export function resolveDisambiguationVoice(
  fen: string,
  candidates: MoveCandidate[],
  input: string,
): ResolveDisambiguationResult {
  if (!candidates.length) return { ok: false };

  const chess = new Chess(fen);
  const verboseBySan = new Map(
    chess
      .moves({ verbose: true })
      .filter((move) => candidates.some((candidate) => candidate.san === move.san))
      .map((move) => [move.san, move]),
  );

  const normalized = normalizeMove(input);
  if (normalized.ok) {
    const direct = candidates.filter((candidate) =>
      sanTokenMatches(candidate.san, normalized.value),
    );
    if (direct.length === 1) {
      return { ok: true, san: direct[0].san };
    }
  }

  const fileHint = extractFileHint(input);
  if (fileHint) {
    const matches = candidates.filter((candidate) => {
      const move = verboseBySan.get(candidate.san);
      return move?.from[0] === fileHint;
    });
    if (matches.length === 1) {
      return { ok: true, san: matches[0].san };
    }
  }

  const originSquare = extractOriginSquare(input);
  if (originSquare) {
    const matches = candidates.filter((candidate) => {
      const move = verboseBySan.get(candidate.san);
      return move?.from === originSquare;
    });
    if (matches.length === 1) {
      return { ok: true, san: matches[0].san };
    }
  }

  return { ok: false };
}

/** Build disambiguation UI options for a set of legal SANs in one position. */
export function buildMoveCandidates(
  fen: string,
  sans: string[],
): { prompt: string; candidates: MoveCandidate[] } {
  const chess = new Chess(fen);
  const bySan = new Map(
    chess.moves({ verbose: true }).map((move) => [move.san, move]),
  );
  const moves = sans
    .map((san) => bySan.get(san))
    .filter((move): move is Move => Boolean(move));

  return {
    prompt: moves.length ? ambiguousPrompt(moves) : 'Which move?',
    candidates: moves.map((move) => ({
      san: move.san,
      label: candidateLabel(move),
    })),
  };
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
  return {
    ok: false,
    reason: 'reason' in result ? result.reason : 'Could not parse move',
  };
}
