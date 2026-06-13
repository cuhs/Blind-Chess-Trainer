export const MATCH_START_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export type MatchPlayerColor = 'w' | 'b';

export const MATCH_PLAYER_COLOR_DEFAULT: MatchPlayerColor = 'w';

/** @deprecated Use matchPlayerColor from guest store per session. */
export const PLAYER_COLOR = MATCH_PLAYER_COLOR_DEFAULT;
