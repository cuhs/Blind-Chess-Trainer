import { distance } from 'fastest-levenshtein';
import {
  buildMoveCandidates,
  type MoveCandidate,
} from '../match-move';
import { normalizeTranscriptForMatch } from './normalize-transcript';
import {
  extractPieceIntent,
  sanMatchesPieceIntent,
} from './piece-intent';
import { spokenVariantsForPosition } from './variants-for-position';

export const MAX_DISTANCE_RATIO = 0.4;
/** Reject or disambiguate when two legal moves score within this ratio band. */
export const AMBIGUITY_MARGIN = 0.05;
/** Tighter ratio cap when the winning phrase is a short square (e3, a 3). */
export const SHORT_PHRASE_MAX_LEN = 4;
export const SHORT_PHRASE_MAX_DISTANCE_RATIO = 0.25;
/** Short STT fragments need a higher match quality bar (premature finalization). */
export const SHORT_TRANSCRIPT_MAX_LEN = 8;
export const SHORT_TRANSCRIPT_MIN_CONFIDENCE = 0.9;
export const MEDIUM_TRANSCRIPT_MAX_LEN = 12;
export const MEDIUM_TRANSCRIPT_MIN_CONFIDENCE = 0.8;

export type NoisyMatchResult =
  | { matched: true; san: string; distance: number; confidence: number }
  | {
      matched: false;
      ambiguous: true;
      prompt: string;
      candidates: MoveCandidate[];
    }
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

/** Minimum fuzzy confidence required to trust a transcript of this length. */
export function minConfidenceForTranscript(transcriptLength: number): number {
  if (transcriptLength <= SHORT_TRANSCRIPT_MAX_LEN) {
    return SHORT_TRANSCRIPT_MIN_CONFIDENCE;
  }
  if (transcriptLength <= MEDIUM_TRANSCRIPT_MAX_LEN) {
    return MEDIUM_TRANSCRIPT_MIN_CONFIDENCE;
  }
  return 1 - MAX_DISTANCE_RATIO;
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

function tiedContenders(
  best: RankedMatch,
  contenders: RankedMatch[],
): RankedMatch[] {
  return contenders.filter(
    (entry) => Math.abs(entry.ratio - best.ratio) < AMBIGUITY_MARGIN,
  );
}

function uniqueSans(matches: RankedMatch[]): string[] {
  return [...new Set(matches.map((entry) => entry.san))];
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
  const tied = tiedContenders(best, contenders);
  const tiedSans = uniqueSans(tied);

  if (tiedSans.length > 1) {
    const { prompt, candidates } = buildMoveCandidates(fen, tiedSans);
    // Same-destination piece ties only — not "e3 vs a3" style collisions.
    if (candidates.length > 1 && prompt !== 'Which move?') {
      return { matched: false, ambiguous: true, prompt, candidates };
    }
    return { matched: false };
  }

  if (best.confidence < minConfidenceForTranscript(normalized.length)) {
    return { matched: false };
  }

  return {
    matched: true,
    san: best.san,
    distance: best.distance,
    confidence: best.confidence,
  };
}
