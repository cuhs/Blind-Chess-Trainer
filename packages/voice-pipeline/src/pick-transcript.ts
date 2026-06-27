import {
  resolveDisambiguationVoice,
  resolveMove,
  type MoveCandidate,
} from '@mindboard/chess-core';
import { normalizeSpokenMove } from './transcript';

function resolvesMove(
  fen: string,
  prepared: string,
  disambiguation?: { candidates: MoveCandidate[] } | null,
): boolean {
  if (!prepared) return false;

  if (disambiguation) {
    const result = resolveDisambiguationVoice(
      fen,
      disambiguation.candidates,
      prepared,
    );
    return result.ok;
  }

  const result = resolveMove(fen, prepared);
  return result.ok;
}

/** Pick the STT alternative most likely to parse as a legal move. */
export function pickBestTranscript(
  alternatives: string[],
  fen: string,
  disambiguation?: { candidates: MoveCandidate[] } | null,
): string {
  const cleaned = alternatives
    .map((alt) => normalizeSpokenMove(alt))
    .filter((alt) => alt.length > 0);

  for (const prepared of cleaned) {
    if (resolvesMove(fen, prepared, disambiguation)) {
      return prepared;
    }
  }

  return cleaned[0] ?? normalizeSpokenMove(alternatives[0] ?? '');
}
