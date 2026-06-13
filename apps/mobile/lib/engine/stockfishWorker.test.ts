import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { Chess } from 'chess.js';
import { initEngine, getEngineMove, disposeEngine } from './stockfishWorker';

const START =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('stockfishWorker', () => {
  beforeAll(async () => {
    await initEngine({ elo: 800 });
  }, 30_000);

  afterAll(async () => {
    await disposeEngine();
  });

  it('returns a legal SAN reply at 800 Elo', async () => {
    const afterE4 = new Chess(START);
    afterE4.move('e4');

    const san = await getEngineMove(afterE4.fen(), 800);
    const verify = new Chess(afterE4.fen());
    expect(verify.move(san)).toBeTruthy();
  }, 30_000);

  it('returns a legal move at 1500 UCI Elo', async () => {
    const san = await getEngineMove(START, 1500);
    const verify = new Chess(START);
    expect(verify.move(san)).toBeTruthy();
  }, 30_000);
});
