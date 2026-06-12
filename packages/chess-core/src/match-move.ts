import { Chess } from 'chess.js';

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

const SAN_PATTERN =
  /^[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](=[NBRQK])?[+#]?$|^O-O(-O)?[+#]?$/i;

export function normalizeMove(
  input: string,
): { ok: true; value: string } | { ok: false } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false };

  const compact = trimmed.replace(/\s+/g, '');
  if (SAN_PATTERN.test(compact)) {
    return { ok: true, value: compact };
  }

  const lower = trimmed.toLowerCase();
  const parts = lower.split(/\s+/);

  if (parts.length === 2 && PIECE_ALIASES[parts[0]] !== undefined) {
    const piece = PIECE_ALIASES[parts[0]];
    const dest = parts[1].replace(/[^a-h1-8]/g, '');
    if (/^[a-h][1-8]$/.test(dest)) {
      const prefix = piece === '' ? '' : piece.toUpperCase();
      return { ok: true, value: `${prefix}${dest}` };
    }
  }

  const pawnDest = lower.replace(/\s/g, '');
  if (/^[a-h][1-8]$/.test(pawnDest)) {
    return { ok: true, value: pawnDest };
  }

  return { ok: false };
}

export function validateMove(
  fen: string,
  input: string,
): { ok: true; san: string } | { ok: false; reason: string } {
  const normalized = normalizeMove(input);
  if (!normalized.ok) {
    return { ok: false, reason: 'Could not parse move' };
  }

  const chess = new Chess(fen);
  try {
    const move = chess.move(normalized.value);
    if (!move) {
      return { ok: false, reason: 'Illegal move' };
    }
    return { ok: true, san: move.san };
  } catch {
    return { ok: false, reason: 'Illegal move' };
  }
}
