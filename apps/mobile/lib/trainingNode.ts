import { getNode } from '@mindboard/chess-core';
import type { TrainingNode } from '@mindboard/shared';

export function resolveTrainingNode(nodeId: string): TrainingNode | null {
  return getNode(nodeId) ?? null;
}
