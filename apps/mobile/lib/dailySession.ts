import type { TrainingPuzzle } from '@/data/training-puzzles';

export const DAILY_SESSION_SIZE = 3;

/** Coarse prompt family — used to spread motif types across a daily session. */
export function puzzlePromptCategory(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('undefended') || p.includes('attacking ')) return 'hanging';
  if (p.includes('pinned') || p.includes('pinning')) return 'pin';
  if (p.includes('fork')) return 'fork';
  if (p.startsWith('is the')) return 'yes-no';
  if (p.includes('attack from')) return 'discovered';
  if (p.includes('skewer') || p.includes('skewered')) return 'skewer';
  if (p.includes('in check')) return 'check';
  return 'other';
}

function pickWithCategorySpread(
  pool: TrainingPuzzle[],
  count: number,
  seed: number,
  usedCategories: Set<string>,
): TrainingPuzzle[] {
  if (count <= 0 || pool.length === 0) return [];

  const shuffled = shuffleDeterministic(pool, seed);
  const picked: TrainingPuzzle[] = [];
  const categories = new Set(usedCategories);

  for (const puzzle of shuffled) {
    if (picked.length >= count) break;
    const category = puzzlePromptCategory(puzzle.prompt);
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

/** Deterministic hash for rotating daily puzzle selection by calendar day. */
export function hashDateKey(dateKey: string): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash;
}

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
 * remaining slots from puzzle bank, then shuffle slot order for the day.
 */
export function selectDailyPuzzles(
  all: TrainingPuzzle[],
  dateKey: string,
): TrainingPuzzle[] {
  if (all.length === 0) return [];

  const peek = all.filter((p) => p.source === 'peek');
  const daily = all.filter((p) => p.source !== 'peek');

  const selectedPeek = shuffleDeterministic(
    peek,
    hashDateKey(`${dateKey}:peek`),
  ).slice(0, MAX_PEEK_PUZZLES_PER_SESSION);

  const bankSlots = DAILY_SESSION_SIZE - selectedPeek.length;
  const peekCategories = new Set(
    selectedPeek.map((puzzle) => puzzlePromptCategory(puzzle.prompt)),
  );
  const selectedBank = pickWithCategorySpread(
    daily,
    bankSlots,
    hashDateKey(`${dateKey}:bank`),
    peekCategories,
  );

  const session = [...selectedPeek, ...selectedBank];
  return shuffleDeterministic(session, hashDateKey(`${dateKey}:order`)).slice(
    0,
    DAILY_SESSION_SIZE,
  );
}
