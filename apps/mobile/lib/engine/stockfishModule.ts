import type { StockfishBootstrap, StockfishInstance } from './stockfishTypes';

export const createStockfishModule: StockfishBootstrap = async () => {
  const initEngine = require('stockfish') as (
    variant: string,
  ) => Promise<StockfishInstance>;
  return initEngine('lite-single');
};
