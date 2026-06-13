import type { EngineStrengthConfig } from './engineElo';
import type { StockfishInstance } from './stockfishTypes';

interface PendingCommand {
  cmd: string;
  match: (line: string) => boolean;
  resolve: (message: string) => void;
  reject: (error: Error) => void;
  lines: string[];
  timer: ReturnType<typeof setTimeout>;
}

const SILENT_COMMAND_PREFIXES = ['setoption', 'position', 'ucinewgame', 'stop'];

function isSilentCommand(cmd: string): boolean {
  const trimmed = cmd.trim();
  return SILENT_COMMAND_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

export class UciClient {
  private readonly pending: PendingCommand[] = [];
  private initialized = false;
  private strengthKey = '';

  constructor(private readonly engine: StockfishInstance) {
    engine.listener = (line: string) => {
      this.onLine(line);
    };
  }

  private onLine(line: string): void {
    const trimmed = line.trim();
    if (!trimmed) return;

    for (let i = 0; i < this.pending.length; i += 1) {
      const command = this.pending[i];
      command.lines.push(trimmed);
      if (command.match(trimmed)) {
        clearTimeout(command.timer);
        this.pending.splice(i, 1);
        command.resolve(command.lines.join('\n'));
        return;
      }
    }
  }

  private send(cmd: string, match: (line: string) => boolean, timeoutMs = 30_000): Promise<string> {
    return new Promise((resolve, reject) => {
      const entry: PendingCommand = {
        cmd,
        match,
        resolve,
        reject,
        lines: [],
        timer: setTimeout(() => {
          const index = this.pending.indexOf(entry);
          if (index >= 0) this.pending.splice(index, 1);
          reject(new Error(`UCI timeout waiting for: ${cmd}`));
        }, timeoutMs),
      };
      this.pending.push(entry);
      this.engine.sendCommand(cmd);
    });
  }

  private fire(cmd: string): void {
    this.engine.sendCommand(cmd);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.send('uci', (line) => line === 'uciok');
    await this.send('isready', (line) => line === 'readyok');
    this.initialized = true;
  }

  async configureStrength(config: EngineStrengthConfig): Promise<void> {
    const key = `${config.limitStrength}:${config.uciElo}:${config.skillLevel}`;
    if (key === this.strengthKey) return;

    if (config.limitStrength) {
      this.fire('setoption name UCI_LimitStrength value true');
      this.fire(`setoption name UCI_Elo value ${config.uciElo}`);
      this.fire('setoption name Skill Level value 20');
    } else {
      this.fire('setoption name UCI_LimitStrength value false');
      this.fire(`setoption name Skill Level value ${config.skillLevel}`);
    }

    await this.send('isready', (line) => line === 'readyok');
    this.strengthKey = key;
  }

  async bestMove(fen: string, movetimeMs: number): Promise<string> {
    this.fire(`position fen ${fen}`);
    const response = await this.send(
      `go movetime ${movetimeMs}`,
      (line) => line.startsWith('bestmove'),
      Math.max(movetimeMs + 5_000, 10_000),
    );
    const bestLine = response.split('\n').find((line) => line.startsWith('bestmove'));
    const uci = bestLine?.split(' ')[1];
    if (!uci || uci === '(none)') {
      throw new Error('Stockfish returned no move');
    }
    return uci;
  }

  dispose(): void {
    for (const command of this.pending) {
      clearTimeout(command.timer);
    }
    this.pending.length = 0;
    this.fire('quit');
    this.engine.terminate?.();
    this.initialized = false;
    this.strengthKey = '';
  }
}

export function isSilentUciCommand(cmd: string): boolean {
  return isSilentCommand(cmd);
}
