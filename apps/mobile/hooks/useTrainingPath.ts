import { useMemo } from 'react';
import { CURRICULUM } from '@mindboard/chess-core';
import type { NodeStarRating, TrainingNode, TrainingUnit } from '@mindboard/shared';
import {
  isNodeCompleted,
  nextPlayableNode,
} from '@/lib/trainingProgress';
import { useGuestStore } from '@/stores/guestStore';

export type NodeVisualState = 'locked' | 'active' | 'complete';

export interface PathNodeView {
  node: TrainingNode;
  state: NodeVisualState;
  stars: NodeStarRating;
}

export interface PathUnitView {
  unit: TrainingUnit;
  nodes: PathNodeView[];
}

export function useTrainingPath() {
  const trainingProgress = useGuestStore((s) => s.trainingProgress);

  const activeNode = useMemo(
    () => nextPlayableNode(trainingProgress),
    [trainingProgress],
  );

  const units: PathUnitView[] = useMemo(() => {
    return CURRICULUM.units.map((unit) => ({
      unit,
      nodes: unit.nodeIds
        .map((nodeId) => CURRICULUM.nodes[nodeId])
        .filter((node): node is TrainingNode => Boolean(node))
        .map((node) => {
          const complete = isNodeCompleted(trainingProgress, node.id);
          const state: NodeVisualState = complete
            ? 'complete'
            : activeNode?.id === node.id
              ? 'active'
              : 'locked';

          return {
            node,
            state,
            stars: trainingProgress.nodeStars[node.id] ?? 0,
          };
        }),
    }));
  }, [trainingProgress, activeNode]);

  return {
    units,
    activeNode,
    trainingProgress,
  };
}
