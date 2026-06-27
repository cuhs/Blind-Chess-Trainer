import { Chess } from 'chess.js';
import type { MoveCandidate } from '../match-move';
import { generateSpokenVariants } from './phonetics';

export type SpokenVariant = { san: string; phrase: string };

export function spokenVariantsForPosition(
  fen: string,
  options?: { candidates?: MoveCandidate[] },
): SpokenVariant[] {
  const chess = new Chess(fen);
  const verboseMoves = chess.moves({ verbose: true });

  const allowedSans = options?.candidates
    ? new Set(options.candidates.map((candidate) => candidate.san))
    : null;

  const result: SpokenVariant[] = [];
  const seen = new Set<string>();

  for (const move of verboseMoves) {
    if (allowedSans && !allowedSans.has(move.san)) {
      continue;
    }

    for (const phrase of generateSpokenVariants(move.san, move)) {
      const key = `${move.san}::${phrase}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ san: move.san, phrase });
    }
  }

  return result;
}
