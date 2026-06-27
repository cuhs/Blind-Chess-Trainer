import { distance } from 'fastest-levenshtein';
import type { MoveCandidate } from '../match-move';
import { normalizeTranscriptForMatch } from './normalize-transcript';
import {
  extractPieceIntent,
  sanMatchesPieceIntent,
} from './piece-intent';
import { spokenVariantsForPosition } from './variants-for-position';

export const MAX_DISTANCE_RATIO = 0.4;
export const AMBIGUITY_MARGIN = 0.06;
/** Tighter ratio cap when the winning phrase is a short square (e3, a 3). */
export const SHORT_PHRASE_MAX_LEN = 4;
export const SHORT_PHRASE_MAX_DISTANCE_RATIO = 0.25;

export type NoisyMatchResult =
  | { matched: true; san: string; distance: number; confidence: number }
  | { matched: false };

type RankedMatch = {
  san: string;
  phrase: string;
  distance: number;
  confidence: number;
  ratio: number;
};

/** Percentage-based score: 1 - (edits / maxLen). Never use raw edit count alone. */
export function matchConfidence(transcript: string, phrase: string): {
  distance: number;
  confidence: number;
  ratio: number;
} {
  const editDistance = distanceBetween(transcript, phrase);
  const maxLen = Math.max(transcript.length, phrase.length, 1);
  const ratio = editDistance / maxLen;
  return { distance: editDistance, confidence: 1 - ratio, ratio };
}

function distanceBetween(a: string, b: string): number {
  return distance(a, b);
}

function effectiveMaxRatio(phrase: string): number {
  return phrase.length <= SHORT_PHRASE_MAX_LEN
    ? SHORT_PHRASE_MAX_DISTANCE_RATIO
    : MAX_DISTANCE_RATIO;
}

function rankMatches(
  transcript: string,
  variants: { san: string; phrase: string }[],
): RankedMatch[] {
  const bySan = new Map<string, RankedMatch>();

  for (const { san, phrase } of variants) {
    const scored = matchConfidence(transcript, phrase);
    const existing = bySan.get(san);

    if (!existing || scored.distance < existing.distance) {
      bySan.set(san, { san, phrase, ...scored });
    }
  }

  return [...bySan.values()].sort((a, b) => {
    if (a.ratio !== b.ratio) return a.ratio - b.ratio;
    if (a.distance !== b.distance) return a.distance - b.distance;
    return a.phrase.length - b.phrase.length;
  });
}

function isAmbiguous(
  best: RankedMatch,
  second: RankedMatch,
  transcript: string,
): boolean {
  if (best.san === second.san) {
    return false;
  }

  // Ratio tie: two different legal moves equally plausible — reject (wrong move > no move).
  if (Math.abs(second.ratio - best.ratio) < AMBIGUITY_MARGIN) {
    return true;
  }

  const separation = second.distance - best.distance;
  if (separation >= 2) {
    return false;
  }

  if (separation === 0) {
    return true;
  }

  const margin =
    separation / Math.max(transcript.length, best.phrase.length, 1);
  return separation <= 1 && margin < AMBIGUITY_MARGIN;
}

export function resolveNoisyTranscript(
  transcript: string,
  fen: string,
  options?: { candidates?: MoveCandidate[] },
): NoisyMatchResult {
  const normalized = normalizeTranscriptForMatch(transcript);
  if (!normalized) {
    return { matched: false };
  }

  const variants = spokenVariantsForPosition(fen, options);
  if (!variants.length) {
    return { matched: false };
  }

  const pieceIntent = extractPieceIntent(normalized);
  const eligibleVariants = pieceIntent
    ? variants.filter(({ san }) => sanMatchesPieceIntent(san, pieceIntent))
    : variants;

  if (pieceIntent && !eligibleVariants.length) {
    return { matched: false };
  }

  const ranked = rankMatches(normalized, eligibleVariants);
  if (!ranked.length) {
    return { matched: false };
  }

  const best = ranked[0];
  if (best.ratio > effectiveMaxRatio(best.phrase)) {
    return { matched: false };
  }

  const contenders = ranked.filter(
    (entry) => entry.ratio <= effectiveMaxRatio(entry.phrase),
  );
  const second = contenders.find((entry) => entry.san !== best.san);
  if (second && isAmbiguous(best, second, normalized)) {
    return { matched: false };
  }

  return {
    matched: true,
    san: best.san,
    distance: best.distance,
    confidence: best.confidence,
  };
}
