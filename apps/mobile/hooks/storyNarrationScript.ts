const PIECE_PREFIX: Record<string, string> = {
  N: 'Knight',
  B: 'Bishop',
  R: 'Rook',
  Q: 'Queen',
  K: 'King',
};

function formatMoveForSpeech(san: string): string {
  const piece = san[0];
  const spoken =
    piece && PIECE_PREFIX[piece]
      ? `${PIECE_PREFIX[piece]} ${san.slice(1)}`
      : san;

  return spoken
    .replace(/x/g, ' takes ')
    .replace(/\+/g, ', check')
    .replace(/#/g, ', checkmate')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildMoveNarrationScript(moves: string[]): string {
  return moves
    .map((move, i) => {
      const color = i % 2 === 0 ? 'White plays' : 'Black plays';
      return `${color} ${formatMoveForSpeech(move)}`;
    })
    .join('. ');
}
