export {
  normalizeMove,
  resolveMove,
  resolveDisambiguationVoice,
  resolveNoisyTranscript,
  validateMove,
} from '@mindboard/chess-core';
export type {
  MoveCandidate,
  NoisyMatchResult,
  ResolveDisambiguationResult,
  ResolveMoveResult,
} from '@mindboard/chess-core';
export {
  prepareMoveTranscript,
  normalizeSpokenMove,
} from './transcript';
export { CHESS_MOVE_CONTEXTUAL_STRINGS } from './contextual-strings';
export { buildContextualStrings } from './build-contextual-strings';
export {
  HIGH_CONFIDENCE,
  minAutoSubmitConfidence,
  resolveVoiceTranscript,
  type VoiceResolveResult,
} from './resolve-voice-transcript';
