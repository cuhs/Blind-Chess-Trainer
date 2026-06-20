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

export interface MoveReplayPosition {
  /** 0 = game start; N = board after move N */
  index: number;
  fen: string;
}

export interface MoveReplayTurnFlags {
  hadPeek: boolean;
  hadIllegal: boolean;
}

export interface MoveReplayTimelineEntry {
  moveNumber: number;
  ply: number;
  san: string;
  /** Same as moveNumber — index into `positions` after this move */
  positionIndex: number;
  /** Peek or illegal attempt at this move's turn */
  flagged: boolean;
  turnFlags?: MoveReplayTurnFlags;
}

export interface MoveReplayData {
  positions: MoveReplayPosition[];
  moves: MoveReplayTimelineEntry[];
}

function isFlaggableEvent(
  event: MatchEvent,
): event is Extract<MatchEvent, { kind: 'peek' | 'illegal_attempt' }> {
  return event.kind === 'peek' || event.kind === 'illegal_attempt';
}

function turnFlagsForMove(
  pending: MoveReplayTurnFlags | undefined,
): MoveReplayTurnFlags | undefined {
  if (!pending || (!pending.hadPeek && !pending.hadIllegal)) return undefined;
  return pending;
}

/** Move-centric replay — board steps follow moves; timeline flags peek/illegal turns. */
export function buildMoveReplayData(record: MatchRecord): MoveReplayData {
  const positions: MoveReplayPosition[] = [
    { index: 0, fen: record.startFen },
  ];
  const moves: MoveReplayTimelineEntry[] = [];
  const pendingTurnFlags = new Map<number, MoveReplayTurnFlags>();

  let currentFen = record.startFen;
  let nextMoveNumber = 1;

  for (const event of record.events) {
    if (event.kind === 'move') {
      const turnFlags = turnFlagsForMove(pendingTurnFlags.get(nextMoveNumber));
      pendingTurnFlags.delete(nextMoveNumber);

      positions.push({
        index: nextMoveNumber,
        fen: event.fenAfter,
      });
      moves.push({
        moveNumber: nextMoveNumber,
        ply: event.ply,
        san: event.san,
        positionIndex: nextMoveNumber,
        flagged: turnFlags !== undefined,
        turnFlags,
      });

      currentFen = event.fenAfter;
      nextMoveNumber += 1;
      continue;
    }

    if (isFlaggableEvent(event) && event.fen === currentFen) {
      const pending = pendingTurnFlags.get(nextMoveNumber) ?? {
        hadPeek: false,
        hadIllegal: false,
      };
      if (event.kind === 'peek') pending.hadPeek = true;
      if (event.kind === 'illegal_attempt') pending.hadIllegal = true;
      pendingTurnFlags.set(nextMoveNumber, pending);
    }
  }

  return { positions, moves };
}
