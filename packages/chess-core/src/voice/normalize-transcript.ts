/** Minimal STT file-word repairs before fuzzy match (not open-ended regex). */
const FILE_WORDS: Record<string, string> = {
  sea: 'c',
  see: 'c',
  bee: 'b',
  be: 'b',
  dee: 'd',
  ef: 'f',
  gee: 'g',
  aye: 'a',
  queue: 'q',
  cue: 'c',
};

const RANK_WORDS: Record<string, string> = {
  half: 'h',
};

const DROP_WORDS = new Set(['up', 'the']);

export function normalizeTranscriptForMatch(transcript: string): string {
  let text = transcript
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  text = text.replace(/\b(to|takes|capture|captures|on)\b/g, ' ');

  const tokens = text.split(/\s+/).filter(Boolean);
  const normalized = tokens
    .map((token) => {
      if (FILE_WORDS[token]) return FILE_WORDS[token];
      if (RANK_WORDS[token]) return RANK_WORDS[token];
      if (token === 'rookie' || token === 'rooky') return 'rook';
      if (token === 'bish') return 'bishop';
      if (token === 'nit' || token === 'night') return 'knight';
      return token;
    })
    .filter((token) => !DROP_WORDS.has(token));

  return normalized.join(' ').replace(/\s+/g, ' ').trim();
}
