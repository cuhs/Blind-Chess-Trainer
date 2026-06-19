import type { MatchEvent, MatchRecord } from '@mindboard/shared';

export type ReplayStepKind = 'start' | MatchEvent['kind'];

export interface ReplayStep {
  index: number;
  kind: ReplayStepKind;
  fen: string;
  title: string;
  detail?: string;
  timestamp?: string;
}

export function findMatchRecord(
  history: MatchRecord[],
  id: string,
): MatchRecord | undefined {
  return history.find((record) => record.id === id);
}

export function sortMatchHistoryNewestFirst(
  history: MatchRecord[],
): MatchRecord[] {
  return [...history].sort(
    (a, b) =>
      new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime(),
  );
}

function titleForEvent(event: MatchEvent): { title: string; detail?: string } {
  switch (event.kind) {
    case 'move':
      return { title: event.san, detail: `Move ${event.ply}` };
    case 'peek':
      return { title: `Peek ${event.square}`, detail: 'Board flash' };
    case 'illegal_attempt':
      return {
        title: `Illegal: ${event.input}`,
        detail: event.reason,
      };
    case 'disambiguation':
      return {
        title: `Ambiguous: ${event.input}`,
        detail: event.prompt,
      };
    case 'disambiguation_cancelled':
      return { title: 'Disambiguation cancelled' };
    case 'resign':
      return { title: 'Resignation' };
    default:
      return { title: 'Event' };
  }
}

function fenForEvent(event: MatchEvent): string {
  switch (event.kind) {
    case 'move':
      return event.fenAfter;
    default:
      return event.fen;
  }
}

/** Ordered timeline for offline replay — one FEN per step. */
export function buildMatchReplaySteps(record: MatchRecord): ReplayStep[] {
  const steps: ReplayStep[] = [
    {
      index: 0,
      kind: 'start',
      fen: record.startFen,
      title: 'Game start',
      timestamp: record.startedAt,
    },
  ];

  for (const event of record.events) {
    const { title, detail } = titleForEvent(event);
    steps.push({
      index: steps.length,
      kind: event.kind,
      fen: fenForEvent(event),
      title,
      detail,
      timestamp: event.timestamp,
    });
  }

  return steps;
}

export function countMatchMoves(record: MatchRecord): number {
  return record.events.filter((event) => event.kind === 'move').length;
}

export function countMatchPeeks(record: MatchRecord): number {
  return record.events.filter((event) => event.kind === 'peek').length;
}
