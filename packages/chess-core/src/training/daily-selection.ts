import type { GeneratedTrainingPuzzle } from './generators/types';
import {
  buildPuzzleFromCategory,
  categoryDailyBucket,
  DAILY_CATEGORY_ROTATION,
  type PuzzleCategoryId,
} from './categories';
import { hashDateKey, shuffleDeterministic } from './seeded-random';

export const DEFAULT_DAILY_SESSION_SIZE = 3;

export { hashDateKey, shuffleDeterministic } from './seeded-random';

/**
 * Pick generated puzzles for a calendar day with category spread.
 * Deterministic for the same dateKey.
 */
export function selectDailyCategoryPuzzles(
  dateKey: string,
  options: {
    categories?: PuzzleCategoryId[];
    sessionSize?: number;
    reservedBuckets?: Set<string>;
  } = {},
): GeneratedTrainingPuzzle[] {
  const categories = options.categories ?? DAILY_CATEGORY_ROTATION;
  const sessionSize = options.sessionSize ?? DEFAULT_DAILY_SESSION_SIZE;
  const reservedBuckets = options.reservedBuckets ?? new Set<string>();
  const shuffled = shuffleDeterministic(
    categories,
    hashDateKey(`${dateKey}:categories`),
  );

  const picked: GeneratedTrainingPuzzle[] = [];
  const usedBuckets = new Set(reservedBuckets);

  for (const category of shuffled) {
    if (picked.length >= sessionSize) break;
    const bucket = categoryDailyBucket(category);
    if (usedBuckets.has(bucket)) continue;
    picked.push(buildPuzzleFromCategory(category, `${dateKey}:${category}`));
    usedBuckets.add(bucket);
  }

  for (const category of shuffled) {
    if (picked.length >= sessionSize) break;
    if (picked.some((puzzle) => puzzle.id.includes(String(category)))) continue;
    picked.push(
      buildPuzzleFromCategory(category, `${dateKey}:${category}:fill`),
    );
  }

  return shuffleDeterministic(picked, hashDateKey(`${dateKey}:order`)).slice(
    0,
    sessionSize,
  );
}

export function deriveNodePuzzleSeed(
  nodeId: string,
  sourceSeed: string,
  sessionKey: string,
): string {
  if (sessionKey === 'fresh') return sourceSeed;
  return `${nodeId}#${sessionKey}#${sourceSeed}`;
}
