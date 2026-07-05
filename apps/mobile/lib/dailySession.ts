import type { TrainingPuzzle } from '@/data/training-puzzles';
import {
  generatedDailyPuzzles,
  generatedPromptCategory,
  peekPromptCategory,
} from '@/lib/generatedPuzzles';
import { hashDateKey, puzzlePromptCategory } from '@/lib/puzzleCategories';

export const DAILY_SESSION_SIZE = 3;

export { puzzlePromptCategory, hashDateKey };

function pickWithCategorySpread(
  pool: TrainingPuzzle[],
  count: number,
  seed: number,
  usedCategories: Set<string>,
  categoryFor: (puzzle: TrainingPuzzle) => string = puzzlePromptCategory,
): TrainingPuzzle[] {
  if (count <= 0 || pool.length === 0) return [];

  const shuffled = shuffleDeterministic(pool, seed);
  const picked: TrainingPuzzle[] = [];
  const categories = new Set(usedCategories);

  for (const puzzle of shuffled) {
    if (picked.length >= count) break;
    const category = categoryFor(puzzle);
    if (categories.has(category)) continue;
    picked.push(puzzle);
    categories.add(category);
  }

  for (const puzzle of shuffled) {
    if (picked.length >= count) break;
    if (picked.some((candidate) => candidate.id === puzzle.id)) continue;
    picked.push(puzzle);
  }

  return picked;
}

export const MAX_PEEK_PUZZLES_PER_SESSION = 2;

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

/** Fisher–Yates shuffle with a fixed seed — stable order for a given date key. */
export function shuffleDeterministic<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  const random = createSeededRandom(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick up to 3 puzzles for a calendar day: up to 2 peek-sourced (from matches),
 * remaining slots from generated categories, optionally topped up from bank rows.
 */
export function selectDailyPuzzles(
  all: TrainingPuzzle[],
  dateKey: string,
): TrainingPuzzle[] {
  if (all.length === 0) {
    return selectDailyGeneratedPuzzles(dateKey, new Set(), DAILY_SESSION_SIZE);
  }

  const peek = all.filter((p) => p.source === 'peek');
  const daily = all.filter((p) => p.source !== 'peek');

  const selectedPeek = shuffleDeterministic(
    peek,
    hashDateKey(`${dateKey}:peek`),
  ).slice(0, MAX_PEEK_PUZZLES_PER_SESSION);

  const peekCategories = new Set(
    selectedPeek.map((puzzle) => peekPromptCategory(puzzle.prompt)),
  );

  const generatedCount = Math.max(0, DAILY_SESSION_SIZE - selectedPeek.length);
  const generated = selectDailyGeneratedPuzzles(
    dateKey,
    peekCategories,
    generatedCount,
  );

  const remaining = DAILY_SESSION_SIZE - selectedPeek.length - generated.length;
  const usedCategories = new Set([
    ...peekCategories,
    ...generated.map((puzzle) => generatedPromptCategory(puzzle)),
  ]);

  const selectedBank = pickWithCategorySpread(
    daily,
    remaining,
    hashDateKey(`${dateKey}:bank`),
    usedCategories,
  );

  const session = [...selectedPeek, ...generated, ...selectedBank];
  return shuffleDeterministic(session, hashDateKey(`${dateKey}:order`)).slice(
    0,
    DAILY_SESSION_SIZE,
  );
}

/** Generator-only daily slots — no peek rows included. */
export function selectDailyGeneratedPuzzles(
  dateKey: string,
  reservedBuckets: Set<string> = new Set(),
  count: number = DAILY_SESSION_SIZE,
): TrainingPuzzle[] {
  return generatedDailyPuzzles(dateKey, reservedBuckets, count);
}
