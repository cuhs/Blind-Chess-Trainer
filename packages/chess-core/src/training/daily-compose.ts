import { hashDateKey, shuffleDeterministic } from './seeded-random';

export const MAX_PEEK_PUZZLES_PER_SESSION = 2;

export interface DailySpreadSlot {
  id: string;
  promptCategory: string;
  source?: string;
}

export function pickWithCategorySpread<T extends DailySpreadSlot>(
  pool: T[],
  count: number,
  seed: number,
  usedCategories: Set<string>,
): T[] {
  if (count <= 0 || pool.length === 0) return [];

  const shuffled = shuffleDeterministic(pool, seed);
  const picked: T[] = [];
  const categories = new Set(usedCategories);

  for (const puzzle of shuffled) {
    if (picked.length >= count) break;
    if (categories.has(puzzle.promptCategory)) continue;
    picked.push(puzzle);
    categories.add(puzzle.promptCategory);
  }

  for (const puzzle of shuffled) {
    if (picked.length >= count) break;
    if (picked.some((candidate) => candidate.id === puzzle.id)) continue;
    picked.push(puzzle);
  }

  return picked;
}

export function composeDailySession<T extends DailySpreadSlot>(
  all: T[],
  dateKey: string,
  options: {
    sessionSize: number;
    generate: (
      dateKey: string,
      reservedBuckets: Set<string>,
      count: number,
    ) => T[];
  },
): T[] {
  if (all.length === 0) {
    return options.generate(dateKey, new Set(), options.sessionSize);
  }

  const peek = all.filter((puzzle) => puzzle.source === 'peek');
  const bank = all.filter((puzzle) => puzzle.source !== 'peek');

  const selectedPeek = shuffleDeterministic(
    peek,
    hashDateKey(`${dateKey}:peek`),
  ).slice(0, MAX_PEEK_PUZZLES_PER_SESSION);

  const peekCategories = new Set(selectedPeek.map((puzzle) => puzzle.promptCategory));

  const generatedCount = Math.max(
    0,
    options.sessionSize - selectedPeek.length,
  );
  const generated = options.generate(dateKey, peekCategories, generatedCount);

  const remaining =
    options.sessionSize - selectedPeek.length - generated.length;
  const usedCategories = new Set([
    ...peekCategories,
    ...generated.map((puzzle) => puzzle.promptCategory),
  ]);

  const selectedBank = pickWithCategorySpread(
    bank,
    remaining,
    hashDateKey(`${dateKey}:bank`),
    usedCategories,
  );

  const session = [...selectedPeek, ...generated, ...selectedBank];
  return shuffleDeterministic(session, hashDateKey(`${dateKey}:order`)).slice(
    0,
    options.sessionSize,
  );
}
