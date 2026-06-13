export interface StockfishInstance {
  sendCommand: (cmd: string) => void;
  listener?: (line: string) => void;
  terminate?: () => void;
  ccall?: (
    name: string,
    returnType: null,
    argTypes: string[],
    args: unknown[],
    options?: { async?: boolean },
  ) => unknown;
  _isReady?: () => boolean;
}

export type StockfishBootstrap = () => Promise<StockfishInstance>;
