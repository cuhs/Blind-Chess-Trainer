import { useMemo } from 'react';
import { resolveNodePuzzles } from '@/lib/generatedPuzzles';
import { getNode } from '@mindboard/chess-core';
import { nodePuzzleSessionKey } from '@/lib/trainingProgress';
import { useGuestStore } from '@/stores/guestStore';

export function useNodePuzzles(nodeId: string | undefined) {
  const trainingProgress = useGuestStore((s) => s.trainingProgress);

  const sessionKey = useMemo(() => {
    if (!nodeId) return 'fresh';
    return nodePuzzleSessionKey(nodeId, trainingProgress);
  }, [nodeId, trainingProgress]);

  const puzzles = useMemo(() => {
    if (!nodeId) return [];
    return resolveNodePuzzles(nodeId, [], sessionKey);
  }, [nodeId, sessionKey]);

  const node = nodeId ? getNode(nodeId) : undefined;

  return {
    node,
    puzzles,
    puzzleCount: puzzles.length,
    isLoading: false,
    isError: false,
    error: null,
  };
}
