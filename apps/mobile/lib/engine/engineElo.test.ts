import { describe, expect, it } from 'vitest';
import {
  MATCH_ELO_DEFAULT,
  MATCH_ELO_MAX,
  MATCH_ELO_MIN,
  STOCKFISH_UCI_ELO_MIN,
  userEloToEngineConfig,
} from './engineElo';

describe('userEloToEngineConfig', () => {
  it('defaults to skill mode for 800 Elo', () => {
    const config = userEloToEngineConfig(MATCH_ELO_DEFAULT);
    expect(config.limitStrength).toBe(false);
    expect(config.skillLevel).toBeGreaterThan(0);
    expect(config.skillLevel).toBeLessThan(20);
  });

  it('uses UCI_LimitStrength at 1320+', () => {
    const config = userEloToEngineConfig(1500);
    expect(config.limitStrength).toBe(true);
    expect(config.uciElo).toBe(1500);
    expect(config.skillLevel).toBe(20);
  });

  it('clamps to slider bounds', () => {
    expect(userEloToEngineConfig(100).skillLevel).toBe(0);
    expect(userEloToEngineConfig(4000).uciElo).toBe(MATCH_ELO_MAX);
  });

  it('maps minimum slider to skill 0', () => {
    expect(userEloToEngineConfig(MATCH_ELO_MIN).skillLevel).toBe(0);
  });

  it('maps just below UCI range to skill 19', () => {
    expect(userEloToEngineConfig(STOCKFISH_UCI_ELO_MIN - 1).skillLevel).toBe(19);
  });
});
