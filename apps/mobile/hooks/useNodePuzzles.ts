import { useMemo } from 'react';
import { buildTrainingPuzzleSpec, getNode } from '@mindboard/chess-core';
import type { NodePuzzleSource } from '@mindboard/shared';
import type { TrainingPuzzle } from '@/data/training-puzzles';
import { mapPuzzleBankRow, type PuzzleBankRow } from '@/lib/puzzleBank';
import { usePuzzleBank } from '@/hooks/usePuzzleBank';

function generatedToTrainingPuzzle(
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

function resolvePuzzleSource(
  source: NodePuzzleSource,
  bankBySlug: Map<string, TrainingPuzzle>,
): TrainingPuzzle | null {
  if (source.type === 'bank_slug') {
    return bankBySlug.get(source.slug) ?? null;
  }
  if (source.type === 'generator') {
    try {
      return generatedToTrainingPuzzle(
        buildTrainingPuzzleSpec(source.generatorId, source.seed),
      );
    } catch {
      return null;
    }
  }
  return null;
}

export function useNodePuzzles(nodeId: string | undefined) {
  const { puzzles: bankPuzzles, isLoading, isError, error, isNotConfigured } =
    usePuzzleBank();

  const puzzles = useMemo(() => {
    if (!nodeId) return [];

    const node = getNode(nodeId);
    if (!node) return [];

    const bankBySlug = new Map(
      bankPuzzles.map((puzzle) => [puzzle.id, puzzle]),
    );

    const resolved: TrainingPuzzle[] = [];
    for (const source of node.puzzles) {
      const puzzle = resolvePuzzleSource(source, bankBySlug);
      if (puzzle) resolved.push(puzzle);
    }
    return resolved;
  }, [nodeId, bankPuzzles]);

  const node = nodeId ? getNode(nodeId) : undefined;
  const puzzleCount = puzzles.length;

  return {
    node,
    puzzles,
    puzzleCount,
    isLoading,
    isError,
    error,
    isNotConfigured,
  };
}

export type { PuzzleBankRow };
