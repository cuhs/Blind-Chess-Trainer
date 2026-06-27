export { generateSpokenVariants } from './phonetics';
export {
  spokenVariantsForPosition,
  type SpokenVariant,
} from './variants-for-position';
export {
  AMBIGUITY_MARGIN,
  MAX_DISTANCE_RATIO,
  resolveNoisyTranscript,
  type NoisyMatchResult,
} from './resolver';
export { normalizeTranscriptForMatch } from './normalize-transcript';
