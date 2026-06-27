import { Chess } from 'chess.js';
import type { MoveCandidate } from '@mindboard/chess-core';
import { CHESS_MOVE_CONTEXTUAL_STRINGS } from './contextual-strings';

const MAX_POSITION_MOVES = 20;

export function buildContextualStrings(
  fen: string,
  disambiguation?: { candidates: MoveCandidate[] } | null,
): string[] {
  const strings = new Set<string>(CHESS_MOVE_CONTEXTUAL_STRINGS);

  try {
    const chess = new Chess(fen);
    for (const san of chess.moves().slice(0, MAX_POSITION_MOVES)) {
      strings.add(san);
    }
  } catch {
    // Invalid FEN — static list only.
  }

  if (!disambiguation) {
    return [...strings];
  }

  const chess = new Chess(fen);
  const verboseBySan = new Map(
    chess.moves({ verbose: true }).map((move) => [move.san, move]),
  );

  for (const candidate of disambiguation.candidates) {
    strings.add(candidate.san);
    strings.add(candidate.label);

    const move = verboseBySan.get(candidate.san);
    if (!move) continue;

    strings.add(move.from);
    strings.add(`${move.from[0]}-file`);
    strings.add(`${move.from[0]} file`);

    const pieceName =
      move.piece === 'n'
        ? 'knight'
        : move.piece === 'b'
          ? 'bishop'
          : move.piece === 'r'
            ? 'rook'
            : move.piece === 'q'
              ? 'queen'
              : move.piece === 'k'
                ? 'king'
                : 'pawn';
    strings.add(`${pieceName} ${move.from}`);
  }

  return [...strings];
}
