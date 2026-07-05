import { useMemo } from 'react';
import { resolveNodePuzzles } from '@/lib/generatedPuzzles';
import { getNode } from '@mindboard/chess-core';
import { useGuestStore } from '@/stores/guestStore';

export function useNodePuzzles(nodeId: string | undefined) {
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
