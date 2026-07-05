import { useMemo } from 'react';
import { resolveNodePuzzles } from '@/lib/generatedPuzzles';
import { getNode } from '@mindboard/chess-core';
import { usePuzzleBank } from '@/hooks/usePuzzleBank';
import { useGuestStore } from '@/stores/guestStore';

export function useNodePuzzles(nodeId: string | undefined) {
  const { puzzles: bankPuzzles, isLoading, isError, error, isNotConfigured } =
    usePuzzleBank();
  const nodeSessionProgress = useGuestStore((s) => s.nodeSessionProgress);

  const sessionKey = useMemo(() => {
    if (!nodeId) return 'default';
    if (nodeSessionProgress?.nodeId === nodeId) {
      return nodeSessionProgress.completedPuzzleIds.join(',') || 'fresh';
    }
    return 'fresh';
  }, [nodeId, nodeSessionProgress]);

  const puzzles = useMemo(() => {
    if (!nodeId) return [];
    return resolveNodePuzzles(nodeId, bankPuzzles, sessionKey);
  }, [nodeId, bankPuzzles, sessionKey]);

  const node = nodeId ? getNode(nodeId) : undefined;
  const puzzleCount = puzzles.length;

  return {
    node,
    puzzles,
    puzzleCount,
    isLoading: false,
    isError,
    error,
    isNotConfigured: false,
  };
}
