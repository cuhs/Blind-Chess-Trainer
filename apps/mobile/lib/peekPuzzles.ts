import { analyzePosition, buildPuzzleFromMotif } from '@mindboard/chess-core';
import type { PeekEvent } from '@mindboard/shared';
import { isSquare, type Square } from '@mindboard/shared';
import type { TrainingPuzzle } from '@/data/training-puzzles';
import { dateKey, todayKey, yesterdayKey } from './dateKey';

export function peekEventDateKey(timestamp: string): string {
  return dateKey(new Date(timestamp));
}

/**
 * Peeks from yesterday's matches feed today's drill first; same-day peeks
 * are included when yesterday has none (keeps the closed loop testable).
 */
export function peekEventsForTodayDrill(events: PeekEvent[]): PeekEvent[] {
  const yesterday = yesterdayKey();
  const today = todayKey();

  const fromYesterday = events.filter(
    (event) => peekEventDateKey(event.timestamp) === yesterday,
  );
  if (fromYesterday.length > 0) {
    return fromYesterday;
  }

  return events.filter((event) => peekEventDateKey(event.timestamp) === today);
}

export function weaknessSquareFromFen(fen: string): Square | null {
  const motif = analyzePosition(fen);
  if (!motif) return null;

  const draft = buildPuzzleFromMotif(motif);
  if (draft.answerType === 'square' && isSquare(draft.expected)) {
    return draft.expected;
  }

  return draft.squaresTouched.find(isSquare) ?? null;
}

function peekPuzzleId(fen: string): string {
  let hash = 0;
  for (let i = 0; i < fen.length; i++) {
    hash = (hash * 31 + fen.charCodeAt(i)) >>> 0;
  }
  return `peek-${hash.toString(36)}`;
}

export function trainingPuzzlesFromPeekEvents(
  events: PeekEvent[],
): TrainingPuzzle[] {
  const seenFens = new Set<string>();
  const puzzles: TrainingPuzzle[] = [];

  for (const event of events) {
    if (seenFens.has(event.fen)) continue;

    const motif = analyzePosition(event.fen);
    if (!motif) continue;

    const draft = buildPuzzleFromMotif(motif);
    if (draft.squaresTouched.length === 0) continue;

    seenFens.add(event.fen);

    const weakness = weaknessSquareFromFen(event.fen) ?? event.square;
    const squaresTouched = [
      ...new Set<Square>([...draft.squaresTouched, weakness, event.square]),
    ];

    puzzles.push({
      id: peekPuzzleId(event.fen),
      fen: event.fen,
      moves: [],
      prompt: draft.prompt,
      inputPlaceholder: draft.inputPlaceholder,
      subtitle: 'From your blindfold match',
      answerType: draft.answerType,
      expected: draft.expected,
      squaresTouched,
      source: 'peek',
    });
  }

  return puzzles;
}

export function mergeBankWithPeekPuzzles(
  bank: TrainingPuzzle[],
  peekPuzzles: TrainingPuzzle[],
): TrainingPuzzle[] {
  const bankIds = new Set(bank.map((puzzle) => puzzle.id));
  const uniquePeek = peekPuzzles.filter((puzzle) => !bankIds.has(puzzle.id));
  return [...uniquePeek, ...bank];
}
