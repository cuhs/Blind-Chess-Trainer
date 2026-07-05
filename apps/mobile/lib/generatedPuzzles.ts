import {
  buildPuzzleFromCategory,
  buildTrainingPuzzleSpec,
  deriveNodePuzzleSeed,
  getNode,
  selectDailyCategoryPuzzles,
} from '@mindboard/chess-core';
import type { NodePuzzleSource } from '@mindboard/shared';
import type { TrainingPuzzle } from '@/data/training-puzzles';
import {
  generatedPromptCategoryFromId,
  hashDateKey,
  puzzlePromptCategory,
} from '@/lib/puzzleCategories';

export function generatedToTrainingPuzzle(
  generated: ReturnType<typeof buildTrainingPuzzleSpec>,
): TrainingPuzzle {
  return {
    id: generated.id,
    fen: generated.fen,
    moves: generated.moves,
    prompt: generated.prompt,
    inputPlaceholder: generated.inputPlaceholder,
    subtitle: generated.subtitle,
    answerType: generated.answerType,
    expected: generated.expected,
    squaresTouched: generated.squaresTouched,
    source: 'daily',
    showBoard: generated.showBoard,
    narrationScript: generated.narrationScript,
  };
}

export function resolvePuzzleSource(
  source: NodePuzzleSource,
  bankBySlug: Map<string, TrainingPuzzle>,
  sessionKey: string,
  nodeId: string,
): TrainingPuzzle | null {
  if (source.type === 'bank_slug') {
    return bankBySlug.get(source.slug) ?? null;
  }

  const seed =
    source.type === 'category'
      ? deriveNodePuzzleSeed(nodeId, source.seed, sessionKey)
      : deriveNodePuzzleSeed(nodeId, source.seed, sessionKey);

  if (source.type === 'category') {
    try {
      return generatedToTrainingPuzzle(
        buildPuzzleFromCategory(source.category, seed),
      );
    } catch {
      return null;
    }
  }

  if (source.type === 'generator') {
    try {
      return generatedToTrainingPuzzle(
        buildTrainingPuzzleSpec(source.generatorId, seed),
      );
    } catch {
      return null;
    }
  }

  return null;
}

export function resolveNodePuzzles(
  nodeId: string,
  bankPuzzles: TrainingPuzzle[],
  sessionKey: string,
): TrainingPuzzle[] {
  const node = getNode(nodeId);
  if (!node) return [];

  const bankBySlug = new Map(
    bankPuzzles.map((puzzle) => [puzzle.id, puzzle]),
  );

  const resolved: TrainingPuzzle[] = [];
  for (const source of node.puzzles) {
    const puzzle = resolvePuzzleSource(source, bankBySlug, sessionKey, nodeId);
    if (puzzle) resolved.push(puzzle);
  }
  return resolved;
}

/** Map generated daily puzzles to TrainingPuzzle with category bucket metadata. */
export function generatedDailyPuzzles(
  dateKey: string,
  reservedBuckets: Set<string>,
  count: number,
): TrainingPuzzle[] {
  const generated = selectDailyCategoryPuzzles(dateKey, {
    sessionSize: count,
    reservedBuckets,
  });
  return generated.map((puzzle) => generatedToTrainingPuzzle(puzzle));
}

export function peekPromptCategory(prompt: string): string {
  return puzzlePromptCategory(prompt);
}

export function generatedPromptCategory(puzzle: TrainingPuzzle): string {
  return generatedPromptCategoryFromId(puzzle.id, puzzle.prompt);
}

export { hashDateKey };
