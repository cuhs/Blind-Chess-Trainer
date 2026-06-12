import { getFallbackMove } from './fallbackEngine';

export interface EngineOptions {
  elo: number;
}

let configuredElo = 1200;

/**
 * Stockfish worker client — async queue simulating an off-thread engine.
 * TODO: swap fallback for Stockfish WASM worker when RN bridge lands.
 */
export async function initEngine(options: EngineOptions): Promise<void> {
  configuredElo = options.elo;
  await Promise.resolve();
}

export async function disposeEngine(): Promise<void> {
  await Promise.resolve();
}

export async function getEngineMove(fen: string, elo?: number): Promise<string> {
  const targetElo = elo ?? configuredElo;
  // Yield so UI can paint "thinking" before synchronous fallback search.
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 80);
  });
  return getFallbackMove(fen, targetElo);
}
