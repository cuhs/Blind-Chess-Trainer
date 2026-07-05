/** Research-backed puzzle families for the training path curriculum. */
export type PuzzleKind =
  | 'coordinate'
  | 'static_recall'
  | 'move_update'
  | 'functional_geometry'
  | 'shallow_calc'
  | 'chunk'
  | 'story_check';

export type NodePuzzleSource =
  | { type: 'bank_slug'; slug: string }
  | { type: 'generator'; generatorId: string; seed: string };

export type NodeStarRating = 0 | 1 | 2 | 3;

export interface TrainingNode {
  id: string;
  unitId: string;
  order: number;
  title: string;
  puzzleKind: PuzzleKind;
  puzzles: NodePuzzleSource[];
  passThreshold: number;
}

export interface TrainingUnit {
  id: string;
  title: string;
  subtitle: string;
  order: number;
  nodeIds: string[];
}

export interface TrainingProgress {
  completedNodeIds: string[];
  nodeStars: Record<string, NodeStarRating>;
  activeNodeId: string | null;
}

export interface NodeSessionProgress {
  nodeId: string;
  completedPuzzleIds: string[];
}

export const EMPTY_TRAINING_PROGRESS: TrainingProgress = {
  completedNodeIds: [],
  nodeStars: {},
  activeNodeId: null,
};
