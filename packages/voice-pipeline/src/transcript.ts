/** Strip trailing punctuation STT often adds to chess move phrases. */
export function prepareMoveTranscript(raw: string): string {
  return raw.trim().replace(/[.,!?;:]+$/g, '').trim();
}

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

const FILLER_PREFIX =
  /^(?:um+|uh+|like|play(?:\s+the)?|move|go)\s+/i;

const PIECE_WORDS = new Set([
  'knight',
  'night',
  'horse',
  'bishop',
  'rook',
  'queen',
  'king',
  'pawn',
  'castle',
  'castles',
  'kingside',
  'queenside',
]);

function replaceSpokenRanks(text: string): string {
  return text
    .split(/\s+/)
    .map((token) => {
      const lower = token.toLowerCase();
      if (PIECE_WORDS.has(lower)) return token;
      return SPOKEN_RANKS[lower] ?? token;
    })
    .join(' ');
}

/** Normalize STT phrasing before chess move parsing. */
export function normalizeSpokenMove(raw: string): string {
  let text = prepareMoveTranscript(raw).toLowerCase();

  while (FILLER_PREFIX.test(text)) {
    text = text.replace(FILLER_PREFIX, '').trim();
  }

  text = text.replace(/\bto the\b/g, 'to');
  text = text.replace(/\bbe\s+(?=[1-8]|one|two|three|four|five|six|seven|eight)\b/g, 'b ');
  text = text.replace(/\s+/g, ' ').trim();
  text = replaceSpokenRanks(text);

  return text;
}
