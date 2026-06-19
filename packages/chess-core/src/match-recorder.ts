import type {
  MatchEvent,
  MatchMoveCandidate,
  MatchPlayerColor,
  MatchRecord,
  MatchResult,
  Square,
} from '@mindboard/shared';

export const MAX_MATCH_HISTORY = 50;

export type CreateMatchRecorderParams = {
  id: string;
  startedAt: string;
  startFen: string;
  playerColor: MatchPlayerColor;
  engineElo: number;
};

export type FinalizeMatchRecorderParams = {
  result: MatchResult;
  resigned: boolean;
  finalFen: string;
  finishedAt: string;
};

export class MatchRecorder {
  private readonly meta: CreateMatchRecorderParams;
  private readonly events: MatchEvent[] = [];
  private moveCount = 0;
  private finalizedRecord: MatchRecord | null = null;

  constructor(params: CreateMatchRecorderParams) {
    this.meta = params;
  }

  recordMove(
    san: string,
    color: MatchPlayerColor,
    fenAfter: string,
    timestamp: string,
  ): void {
    this.assertMutable();
    this.moveCount += 1;
    this.events.push({
      kind: 'move',
      ply: this.moveCount,
      color,
      san,
      fenAfter,
      timestamp,
    });
  }

  recordPeek(fen: string, square: Square, timestamp: string): void {
    this.assertMutable();
    this.events.push({ kind: 'peek', fen, square, timestamp });
  }

  recordIllegalAttempt(
    input: string,
    reason: string,
    fen: string,
    timestamp: string,
  ): void {
    this.assertMutable();
    this.events.push({ kind: 'illegal_attempt', input, reason, fen, timestamp });
  }

  recordDisambiguation(
    input: string,
    prompt: string,
    candidates: MatchMoveCandidate[],
    fen: string,
    timestamp: string,
  ): void {
    this.assertMutable();
    this.events.push({
      kind: 'disambiguation',
      input,
      prompt,
      candidates: candidates.map((candidate) => ({
        san: candidate.san,
        label: candidate.label,
      })),
      fen,
      timestamp,
    });
  }

  recordDisambiguationCancelled(fen: string, timestamp: string): void {
    this.assertMutable();
    this.events.push({ kind: 'disambiguation_cancelled', fen, timestamp });
  }

  recordResign(fen: string, timestamp: string): void {
    this.assertMutable();
    this.events.push({ kind: 'resign', fen, timestamp });
  }

  finalize(params: FinalizeMatchRecorderParams): MatchRecord {
    if (this.finalizedRecord) return this.finalizedRecord;

    this.finalizedRecord = {
      id: this.meta.id,
      startedAt: this.meta.startedAt,
      finishedAt: params.finishedAt,
      startFen: this.meta.startFen,
      finalFen: params.finalFen,
      playerColor: this.meta.playerColor,
      engineElo: this.meta.engineElo,
      result: params.result,
      resigned: params.resigned,
      events: [...this.events],
    };

    return this.finalizedRecord;
  }

  isFinalized(): boolean {
    return this.finalizedRecord !== null;
  }

  getEvents(): readonly MatchEvent[] {
    return this.events;
  }

  private assertMutable(): void {
    if (this.finalizedRecord) {
      throw new Error('Cannot record events after match is finalized');
    }
  }
}

export function createMatchRecorder(
  params: CreateMatchRecorderParams,
): MatchRecorder {
  return new MatchRecorder(params);
}

export function appendMatchRecord(
  history: MatchRecord[],
  record: MatchRecord,
  maxRecords = MAX_MATCH_HISTORY,
): MatchRecord[] {
  const next = [...history, record];
  if (next.length <= maxRecords) return next;
  return next.slice(next.length - maxRecords);
}
