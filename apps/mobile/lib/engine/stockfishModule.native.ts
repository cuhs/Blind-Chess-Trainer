import {
  addOutputListener,
  isRunning,
  sendCommand as nativeSendCommand,
  startEngine,
  stopEngine,
} from '@og-nav/expo-stockfish';
import type { EventSubscription } from 'expo-modules-core';
import type { StockfishBootstrap, StockfishInstance } from './stockfishTypes';

let outputSubscription: EventSubscription | null = null;

export const createStockfishModule: StockfishBootstrap = async () => {
  const engine: StockfishInstance = {
    sendCommand: (cmd: string) => {
      nativeSendCommand(cmd);
    },
    terminate: () => {
      void stopEngine();
    },
  };

  if (!isRunning()) {
    await startEngine();
  }

  outputSubscription?.remove();
  outputSubscription = addOutputListener((line) => {
    engine.listener?.(line);
  });

  return engine;
};
