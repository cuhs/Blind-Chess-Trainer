import { spokenVariantsForPosition } from '@mindboard/chess-core';
import type { MoveCandidate } from '@mindboard/chess-core';
import { CHESS_MOVE_CONTEXTUAL_STRINGS } from './contextual-strings';

const IOS_CONTEXTUAL_STRING_LIMIT = 100;
const MAX_PHRASES_PER_MOVE = 3;
const SPOKEN_RANK = / (one|two|three|four|five|six|seven|eight)$/;

const STATIC_FALLBACK = [
  'castle',
  'kingside',
  'queenside',
  'knight',
  'night',
  'bishop',
  'rook',
  'queen',
  'king',
  'pawn',
  'a-file',
  'b-file',
  'c-file',
  'd-file',
  'e-file',
  'f-file',
  'g-file',
  'h-file',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
] as const;

function pickPhrasesForMove(phrases: string[]): string[] {
  const picked: string[] = [];
  if (phrases[0]) picked.push(phrases[0]);

  const spokenRank = phrases.find((phrase) => SPOKEN_RANK.test(phrase));
  if (spokenRank && !picked.includes(spokenRank)) {
    picked.push(spokenRank);
  }

  for (const phrase of phrases) {
    if (picked.length >= MAX_PHRASES_PER_MOVE) break;
    if (!picked.includes(phrase)) picked.push(phrase);
  }

  return picked.slice(0, MAX_PHRASES_PER_MOVE);
}

export function buildContextualStrings(
  fen: string,
  disambiguation?: { candidates: MoveCandidate[] } | null,
): string[] {
  const perMove = new Map<string, string[]>();

  for (const { san, phrase } of spokenVariantsForPosition(fen, {
    candidates: disambiguation?.candidates,
  })) {
    const phrases = perMove.get(san) ?? [];
    if (phrases.includes(phrase)) continue;
    phrases.push(phrase);
    perMove.set(san, phrases);
  }

  const prioritized: string[] = [];
  for (const phrases of perMove.values()) {
    prioritized.push(...pickPhrasesForMove(phrases));
  }

  if (disambiguation) {
    for (const candidate of disambiguation.candidates) {
      prioritized.push(candidate.san, candidate.label);
    }
  }

  const unique = [...new Set(prioritized)];
  if (unique.length >= IOS_CONTEXTUAL_STRING_LIMIT) {
    return unique.slice(0, IOS_CONTEXTUAL_STRING_LIMIT);
  }

  const strings = new Set(unique);
  for (const value of STATIC_FALLBACK) {
    if (strings.size >= IOS_CONTEXTUAL_STRING_LIMIT) break;
    strings.add(value);
  }

  for (const value of CHESS_MOVE_CONTEXTUAL_STRINGS) {
    if (strings.size >= IOS_CONTEXTUAL_STRING_LIMIT) break;
    strings.add(value);
  }

  return [...strings].slice(0, IOS_CONTEXTUAL_STRING_LIMIT);
}
