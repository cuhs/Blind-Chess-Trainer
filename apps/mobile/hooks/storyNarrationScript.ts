const PIECE_PREFIX: Record<string, string> = {
  N: 'Knight',
  B: 'Bishop',
  R: 'Rook',
  Q: 'Queen',
  K: 'King',
};

export interface NarrationOptions {
  /** FEN before moves[0] — sets who speaks first. Defaults to White. */
  fen?: string;
  /** Hide check/checkmate from speech so the answer is not spoiled. */
  stripCheck?: boolean;
}

function turnFromFen(fen: string): 'w' | 'b' {
  const turn = fen.trim().split(/\s+/)[1];
  return turn === 'b' ? 'b' : 'w';
}

function formatMoveForSpeech(san: string, options: NarrationOptions): string {
  const normalized = options.stripCheck ? san.replace(/[+#]/g, '') : san;
  const piece = normalized[0];
  const spoken =
    piece && PIECE_PREFIX[piece]
      ? `${PIECE_PREFIX[piece]} ${normalized.slice(1)}`
      : normalized;

  if (options.stripCheck) {
    return spoken.replace(/x/g, ' takes ').replace(/\s+/g, ' ').trim();
  }

  return spoken
    .replace(/x/g, ' takes ')
    .replace(/\+/g, ', check')
    .replace(/#/g, ', checkmate')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildMoveNarrationScript(
  moves: string[],
  options: NarrationOptions = {},
): string {
  let turn: 'w' | 'b' = options.fen ? turnFromFen(options.fen) : 'w';

  return moves
    .map((move) => {
      const color = turn === 'w' ? 'White plays' : 'Black plays';
      turn = turn === 'w' ? 'b' : 'w';
      return `${color} ${formatMoveForSpeech(move, options)}`;
    })
    .join('. ');
}
