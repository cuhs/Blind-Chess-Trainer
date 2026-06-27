export type PieceIntent = 'n' | 'b' | 'r' | 'q' | 'k' | 'p' | 'castle';

const PIECE_TOKENS: Record<string, PieceIntent> = {
  knight: 'n',
  night: 'n',
  horse: 'n',
  nit: 'n',
  bishop: 'b',
  bish: 'b',
  rook: 'r',
  rookie: 'r',
  rooky: 'r',
  queen: 'q',
  king: 'k',
  pawn: 'p',
};

/** Piece type explicitly named in STT (null = square-only / any piece). */
export function extractPieceIntent(normalizedTranscript: string): PieceIntent | null {
  const text = normalizedTranscript.toLowerCase();

  if (/\b(?:castle|castles)\b/.test(text)) return 'castle';
  if (/\b(?:king\s*side|kingside)\b/.test(text)) return 'castle';
  if (/\b(?:queen\s*side|queenside)\b/.test(text)) return 'castle';

  for (const token of text.split(/\s+/).filter(Boolean)) {
    const mapped = PIECE_TOKENS[token];
    if (mapped) return mapped;
  }

  return null;
}

export function sanMatchesPieceIntent(san: string, intent: PieceIntent): boolean {
  const normalized = san.replace(/0/g, 'O').replace(/[+#]+$/, '');
  if (intent === 'castle') {
    return /^O-O(-O)?$/i.test(normalized);
  }
  if (intent === 'p') {
    return !/^[NBRQK]/i.test(normalized) && !/^O-O/i.test(normalized);
  }
  return normalized[0]?.toUpperCase() === intent.toUpperCase();
}
