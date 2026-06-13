/** Stockfish UCI_Elo range when UCI_LimitStrength is enabled. */
export const STOCKFISH_UCI_ELO_MIN = 1320;
export const STOCKFISH_UCI_ELO_MAX = 3190;

/** User-facing opponent rating slider bounds. */
export const MATCH_ELO_MIN = 300;
export const MATCH_ELO_MAX = STOCKFISH_UCI_ELO_MAX;
export const MATCH_ELO_DEFAULT = 800;

/** Stockfish Skill Level range (used below UCI_Elo calibration). */
export const STOCKFISH_SKILL_MIN = 0;
export const STOCKFISH_SKILL_MAX = 19;

export interface EngineStrengthConfig {
  limitStrength: boolean;
  uciElo: number;
  skillLevel: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Maps display Elo to Stockfish UCI options.
 *
 * - 1320–3190: UCI_LimitStrength + UCI_Elo (Stockfish-calibrated)
 * - 300–1319: Skill Level 0–19 (approximate human strength; SF has no sub-1320 UCI_Elo)
 */
export function userEloToEngineConfig(userElo: number): EngineStrengthConfig {
  const elo = clamp(Math.round(userElo), MATCH_ELO_MIN, MATCH_ELO_MAX);

  if (elo >= STOCKFISH_UCI_ELO_MIN) {
    return {
      limitStrength: true,
      uciElo: elo,
      skillLevel: 20,
    };
  }

  const span = STOCKFISH_UCI_ELO_MIN - 1 - MATCH_ELO_MIN;
  const t = span > 0 ? (elo - MATCH_ELO_MIN) / span : 0;
  const skillLevel = Math.round(t * STOCKFISH_SKILL_MAX);

  return {
    limitStrength: false,
    uciElo: STOCKFISH_UCI_ELO_MIN,
    skillLevel: clamp(skillLevel, STOCKFISH_SKILL_MIN, STOCKFISH_SKILL_MAX),
  };
}

export type EloTier =
  | 'absolute_beginner'
  | 'beginner'
  | 'intermediate'
  | 'club'
  | 'advanced'
  | 'master';

const TIER_COPY: Record<EloTier, string> = {
  absolute_beginner: 'Absolute beginner',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  club: 'Club player',
  advanced: 'Advanced',
  master: 'Master',
};

export function eloTier(elo: number): EloTier {
  if (elo < 600) return 'absolute_beginner';
  if (elo < 1000) return 'beginner';
  if (elo < 1400) return 'intermediate';
  if (elo < 1800) return 'club';
  if (elo < 2400) return 'advanced';
  return 'master';
}

export function eloTierLabel(elo: number): string {
  return TIER_COPY[eloTier(elo)];
}

/** Whether the rating uses Stockfish's calibrated UCI_Elo (vs Skill Level). */
export function usesCalibratedUciElo(elo: number): boolean {
  return elo >= STOCKFISH_UCI_ELO_MIN;
}
