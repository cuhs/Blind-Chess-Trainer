import { Chess } from 'chess.js';
import type { AnswerType } from '@mindboard/shared';
import { normalizeSquare, normalizeYesNo } from './normalize';

export function isInCheck(fen: string): boolean {
  const chess = new Chess(fen);
  return chess.inCheck();
}

export function applyMoves(fen: string, moves: string[]): string {
  const chess = new Chess(fen);
  for (const move of moves) {
    chess.move(move);
  }
  return chess.fen();
}

export function validateAnswer(
  answerType: AnswerType,
  userInput: string,
  expected: string,
  fen?: string,
  moves?: string[],
): boolean {
  if (answerType === 'square') {
    const normalized = normalizeSquare(userInput);
    if (!normalized.ok) return false;
    return normalized.value === expected.toLowerCase();
  }

  const normalized = normalizeYesNo(userInput);
  if (!normalized.ok) return false;

  if (fen && moves && moves.length > 0) {
    const afterFen = applyMoves(fen, moves);
    const inCheck = isInCheck(afterFen);
    const userSaysYes = normalized.value === 'yes';
    return userSaysYes === inCheck;
  }

  return normalized.value === expected.toLowerCase();
}
