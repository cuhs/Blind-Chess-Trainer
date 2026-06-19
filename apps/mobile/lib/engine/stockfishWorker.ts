import {
  MATCH_ELO_DEFAULT,
  usesHumanFallbackEngine,
  userEloToEngineConfig,
} from './engineElo';
import { getFallbackMove } from './fallbackEngine';
import { uciToSan } from './uciToSan';
import { UciClient } from './uciClient';
import { createStockfishModule } from './stockfishModule';

export interface EngineOptions {
  elo: number;
}

const DEFAULT_MOVETIME_MS = 400;

let client: UciClient | null = null;
let initPromise: Promise<void> | null = null;
let configuredElo: number | null = null;

async function ensureClient(elo: number): Promise<UciClient> {
  if (!initPromise) {
    initPromise = (async () => {
      const module = await createStockfishModule();
      const uci = new UciClient(module);
      await uci.initialize();
      client = uci;
    })();
  }

  await initPromise;

  if (!client) {
    throw new Error('Stockfish failed to initialize');
  }

  await client.configureStrength(userEloToEngineConfig(elo));
  configuredElo = elo;
  return client;
}

export async function initEngine(options: EngineOptions): Promise<void> {
  configuredElo = options.elo;
  if (usesHumanFallbackEngine(options.elo)) return;
  await ensureClient(options.elo);
}

export async function disposeEngine(): Promise<void> {
  client?.dispose();
  client = null;
  initPromise = null;
  configuredElo = null;
}

export async function getEngineMove(fen: string, elo?: number): Promise<string> {
  const targetElo = elo ?? configuredElo ?? MATCH_ELO_DEFAULT;
  if (usesHumanFallbackEngine(targetElo)) {
    return getFallbackMove(fen, targetElo);
  }
  const uci = await (await ensureClient(targetElo)).bestMove(fen, DEFAULT_MOVETIME_MS);
  return uciToSan(fen, uci);
}
