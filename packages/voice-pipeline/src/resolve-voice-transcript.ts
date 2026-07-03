import {
  resolveDisambiguationVoice,
  resolveMove,
  resolveNoisyTranscript,
  normalizeMove,
  minConfidenceForTranscript,
  type MoveCandidate,
} from '@mindboard/chess-core';
import { normalizeSpokenMove } from './transcript';

export const HIGH_CONFIDENCE = 0.72;

export function minAutoSubmitConfidence(transcriptLength: number): number {
  return Math.max(HIGH_CONFIDENCE, minConfidenceForTranscript(transcriptLength));
}

export type VoiceResolveResult = {
  displayText: string;
  submitText: string;
  confidence: number;
  matched: boolean;
  san?: string;
  /** Set when the utterance parses to a specific move that is not legal. */
  illegal?: boolean;
  /** Fuzzy tie between legal moves — show disambiguation overlay. */
  ambiguous?: boolean;
  prompt?: string;
  candidates?: MoveCandidate[];
};

function resolvesMove(
  fen: string,
  prepared: string,
  disambiguation?: { candidates: MoveCandidate[] } | null,
): { ok: true; san: string } | { ok: false; illegal?: boolean } {
  if (!prepared) return { ok: false };

  if (disambiguation) {
    const result = resolveDisambiguationVoice(
      fen,
      disambiguation.candidates,
      prepared,
    );
    return result.ok ? { ok: true, san: result.san } : { ok: false };
  }

  const result = resolveMove(fen, prepared);
  if (result.ok) return { ok: true, san: result.san };
  if ('reason' in result && result.reason === 'Illegal move') {
    return { ok: false, illegal: true };
  }
  return { ok: false };
}

function scoreAlternative(
  rawAlternative: string,
  fen: string,
  disambiguation?: { candidates: MoveCandidate[] } | null,
): VoiceResolveResult {
  const prepared = normalizeSpokenMove(rawAlternative);
  if (!prepared) {
    return {
      displayText: '',
      submitText: '',
      confidence: 0,
      matched: false,
    };
  }

  const parsed = resolvesMove(fen, prepared, disambiguation);
  if (parsed.ok) {
    return {
      displayText: parsed.san,
      submitText: prepared,
      confidence: 1,
      matched: true,
      san: parsed.san,
    };
  }

  const noisy = resolveNoisyTranscript(prepared, fen, {
    candidates: disambiguation?.candidates,
  });
  if (noisy.matched) {
    return {
      displayText: noisy.san,
      submitText: noisy.san,
      confidence: noisy.confidence,
      matched: true,
      san: noisy.san,
    };
  }

  if ('ambiguous' in noisy && noisy.ambiguous) {
    return {
      displayText: prepared,
      submitText: prepared,
      confidence: 0,
      matched: false,
      ambiguous: true,
      prompt: noisy.prompt,
      candidates: noisy.candidates,
    };
  }

  const explicit = normalizeMove(prepared);
  const displayText = explicit.ok ? explicit.value : prepared;
  const illegal = parsed.illegal ?? false;

  return {
    displayText,
    submitText: displayText,
    confidence: 0,
    matched: false,
    illegal,
  };
}

/** Resolve STT alternatives to the best legal move for the current position. */
export function resolveVoiceTranscript(
  alternatives: string[],
  fen: string,
  disambiguation?: { candidates: MoveCandidate[] } | null,
): VoiceResolveResult {
  if (!alternatives.length) {
    return {
      displayText: '',
      submitText: '',
      confidence: 0,
      matched: false,
    };
  }

  let best: VoiceResolveResult | null = null;

  for (const alternative of alternatives) {
    const result = scoreAlternative(alternative, fen, disambiguation);
    if (
      !best ||
      result.confidence > best.confidence ||
      (result.confidence === best.confidence && result.matched && !best.matched)
    ) {
      best = result;
    }
  }

  return (
    best ?? {
      displayText: normalizeSpokenMove(alternatives[0] ?? ''),
      submitText: normalizeSpokenMove(alternatives[0] ?? ''),
      confidence: 0,
      matched: false,
    }
  );
}
