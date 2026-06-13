/**
 * Stable key for a chess position: piece placement, side to move, castling,
 * and en passant. Halfmove and fullmove counters are ignored.
 */
export function positionKeyFromFen(fen: string): string {
  return fen.trim().split(/\s+/).slice(0, 4).join(' ');
}
