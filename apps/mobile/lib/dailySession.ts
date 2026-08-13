import {
  composeDailySession,
  MAX_PEEK_PUZZLES_PER_SESSION,
  promptCategoryFromText,
  type DailySpreadSlot,
} from '@mindboard/chess-core';
import type { TrainingPuzzle } from '@/data/training-puzzles';
import { generatedDailyPuzzles } from '@/lib/generatedPuzzles';

export const DAILY_SESSION_SIZE = 3;

export { MAX_PEEK_PUZZLES_PER_SESSION };

/** @deprecated Use promptCategory on TrainingPuzzle or chess-core promptCategoryFromText. */
export function puzzlePromptCategory(prompt: string): string {
  return promptCategoryFromText(prompt);
}

type DailyTrainingPuzzle = TrainingPuzzle & DailySpreadSlot;

function withPromptCategory(puzzle: TrainingPuzzle): DailyTrainingPuzzle {
  return {
    ...puzzle,
    promptCategory: puzzle.promptCategory ?? promptCategoryFromText(puzzle.prompt),
  };
}

/**
 * Pick up to 3 puzzles for a calendar day: up to 2 peek-sourced (from matches),
 * remaining slots from generated categories, optionally topped up from bank rows.
 */
export function selectDailyPuzzles(
  all: TrainingPuzzle[],
  dateKey: string,
): TrainingPuzzle[] {
  const normalized = all.map(withPromptCategory);
  return composeDailySession(normalized, dateKey, {
    sessionSize: DAILY_SESSION_SIZE,
    generate: (dayKey, reservedBuckets, count) =>
      generatedDailyPuzzles(
        dayKey,
        reservedBuckets,
        count,
      ) as DailyTrainingPuzzle[],
  });
}

/** Generator-only daily slots — no peek rows included. */
export function selectDailyGeneratedPuzzles(
  dateKey: string,
  reservedBuckets: Set<string> = new Set(),
  count: number = DAILY_SESSION_SIZE,
): TrainingPuzzle[] {
  return generatedDailyPuzzles(dateKey, reservedBuckets, count);
}
