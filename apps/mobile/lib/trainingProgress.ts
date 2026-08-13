import {
  CURRICULUM,
  getNode,
  type TrainingCurriculum,
} from '@mindboard/chess-core';
import type {
  NodeStarRating,
  TrainingNode,
  TrainingProgress,
} from '@mindboard/shared';
import { EMPTY_TRAINING_PROGRESS } from '@mindboard/shared';

export function isNodeCompleted(
  progress: TrainingProgress,
  nodeId: string,
): boolean {
  return progress.completedNodeIds.includes(nodeId);
}

export function previousMainPathNodeId(nodeId: string): string | null {
  const index = CURRICULUM.mainPathNodeIds.indexOf(nodeId);
  if (index <= 0) return null;
  return CURRICULUM.mainPathNodeIds[index - 1] ?? null;
}

export function isNodeUnlocked(
  nodeId: string,
  progress: TrainingProgress,
  curriculum: TrainingCurriculum = CURRICULUM,
): boolean {
  const node = curriculum.nodes[nodeId];
  if (!node) return false;

  const mainIndex = curriculum.mainPathNodeIds.indexOf(nodeId);
  if (mainIndex === -1) return false;
  if (mainIndex === 0) return true;

  const previousId = curriculum.mainPathNodeIds[mainIndex - 1];
  return previousId ? isNodeCompleted(progress, previousId) : false;
}

export function nextPlayableNode(
  progress: TrainingProgress,
  curriculum: TrainingCurriculum = CURRICULUM,
): TrainingNode | null {
  for (const nodeId of curriculum.mainPathNodeIds) {
    if (
      isNodeUnlocked(nodeId, progress, curriculum) &&
      !isNodeCompleted(progress, nodeId)
    ) {
      return curriculum.nodes[nodeId] ?? null;
    }
  }
  return null;
}

export function starsForSession(
  correct: number,
  total: number,
  peekCount: number,
): NodeStarRating {
  if (correct === total) {
    if (peekCount === 0) return 3;
    if (peekCount <= 1) return 2;
    return 1;
  }
  if (correct >= 2 && peekCount === 0) return 2;
  if (correct >= 2) return 1;
  return 0;
}

export function applyNodeCompletion(
  progress: TrainingProgress,
  nodeId: string,
  stars: NodeStarRating,
): TrainingProgress {
  const existingStars = progress.nodeStars[nodeId] ?? 0;
  const nextStars = Math.max(existingStars, stars) as NodeStarRating;
  const completedNodeIds = progress.completedNodeIds.includes(nodeId)
    ? progress.completedNodeIds
    : [...progress.completedNodeIds, nodeId];

  const nextNode = nextPlayableNode({
    ...progress,
    completedNodeIds,
    nodeStars: { ...progress.nodeStars, [nodeId]: nextStars },
  });

  return {
    ...progress,
    completedNodeIds,
    nodeStars: { ...progress.nodeStars, [nodeId]: nextStars },
    activeNodeId: nextNode?.id ?? null,
  };
}

export function setActiveNode(
  progress: TrainingProgress,
  nodeId: string | null,
): TrainingProgress {
  return { ...progress, activeNodeId: nodeId };
}

export function completedIdsForNode(
  nodeSessionProgress: { nodeId: string; completedPuzzleIds: string[] } | null,
  nodeId: string,
): string[] {
  if (!nodeSessionProgress || nodeSessionProgress.nodeId !== nodeId) return [];
  return nodeSessionProgress.completedPuzzleIds;
}

/**
 * Seed key for curriculum generators. Must stay stable while a node session
 * is in progress — completed puzzle ids must never be folded into the key
 * or remaining puzzles regenerate mid-session and resume breaks.
 *
 * First attempt (node not yet completed) uses curriculum seeds (`fresh`).
 * Replays after earning stars use `replay-${stars}` so the set differs
 * from the canonical first attempt without changing during resume.
 */
export function nodePuzzleSessionKey(
  nodeId: string,
  trainingProgress: TrainingProgress,
): string {
  if (!isNodeCompleted(trainingProgress, nodeId)) return 'fresh';
  const stars = trainingProgress.nodeStars[nodeId] ?? 0;
  return `replay-${stars}`;
}

export function nodePassed(
  node: TrainingNode,
  correctCount: number,
): boolean {
  return correctCount >= node.passThreshold;
}

export function ensureTrainingProgress(
  progress: TrainingProgress | null | undefined,
): TrainingProgress {
  if (!progress) return { ...EMPTY_TRAINING_PROGRESS };
  return progress;
}

export function getNodeOrThrow(nodeId: string): TrainingNode {
  const node = getNode(nodeId);
  if (!node) {
    throw new Error(`Unknown training node: ${nodeId}`);
  }
  return node;
}
