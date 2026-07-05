import type {
  NodePuzzleSource,
  PuzzleKind,
  TrainingNode,
  TrainingUnit,
} from '@mindboard/shared';

export interface TrainingCurriculum {
  units: TrainingUnit[];
  nodes: Record<string, TrainingNode>;
  mainPathNodeIds: string[];
}

function node(
  id: string,
  unitId: string,
  order: number,
  title: string,
  puzzleKind: PuzzleKind,
  puzzles: NodePuzzleSource[],
): TrainingNode {
  return {
    id,
    unitId,
    order,
    title,
    puzzleKind,
    puzzles,
    passThreshold: 2,
  };
}

function generators(
  generatorId: string,
  seeds: [string, string, string],
): NodePuzzleSource[] {
  return seeds.map((seed) => ({ type: 'generator', generatorId, seed }));
}

function bankSlugs(slugs: [string, string, string]): NodePuzzleSource[] {
  return slugs.map((slug) => ({ type: 'bank_slug', slug }));
}

const UNITS: TrainingUnit[] = [
  {
    id: 'unit-1',
    title: 'Grid Basics',
    subtitle: 'Coordinate fluency',
    order: 1,
    nodeIds: ['node-1-1', 'node-1-2', 'node-1-3'],
  },
  {
    id: 'unit-2',
    title: 'Board Memory',
    subtitle: 'Static reconstruction',
    order: 2,
    nodeIds: ['node-2-1', 'node-2-2', 'node-2-3'],
  },
  {
    id: 'unit-3',
    title: 'Move Tracking',
    subtitle: 'Board maintenance',
    order: 3,
    nodeIds: ['node-3-1', 'node-3-2', 'node-3-3'],
  },
  {
    id: 'unit-4',
    title: 'Tactical Sight',
    subtitle: 'Functional geometry',
    order: 4,
    nodeIds: ['node-4-1', 'node-4-2', 'node-4-3'],
  },
  {
    id: 'unit-5',
    title: 'Lines in Your Head',
    subtitle: 'Shallow calculation',
    order: 5,
    nodeIds: ['node-5-1', 'node-5-2', 'node-5-3'],
  },
  {
    id: 'unit-6',
    title: 'Patterns',
    subtitle: 'Chunk recognition',
    order: 6,
    nodeIds: ['node-6-1', 'node-6-2', 'node-6-3'],
  },
];

const NODES: TrainingNode[] = [
  node(
    'node-1-1',
    'unit-1',
    1,
    'Square Colors',
    'coordinate',
    generators('coordinate_color', ['e4', 'a1', 'd5']),
  ),
  node(
    'node-1-2',
    'unit-1',
    2,
    'Neighbors',
    'coordinate',
    generators('coordinate_neighbor', ['e4:rank', 'c3:file', 'g7:rank']),
  ),
  node(
    'node-1-3',
    'unit-1',
    3,
    'Knight Reach',
    'coordinate',
    generators('coordinate_knight_reach', ['b1:g8', 'e4:f6', 'a1:h8']),
  ),
  node(
    'node-2-1',
    'unit-2',
    1,
    'Simple Endgame',
    'static_recall',
    generators('static_recall_2', ['0:0', '0:1', '1:0']),
  ),
  node(
    'node-2-2',
    'unit-2',
    2,
    'Four Pieces',
    'static_recall',
    generators('static_recall_4', ['0:0', '0:1', '0:2']),
  ),
  node(
    'node-2-3',
    'unit-2',
    3,
    'Six Pieces',
    'static_recall',
    generators('static_recall_6', ['0:0', '0:1', '0:2']),
  ),
  node(
    'node-3-1',
    'unit-3',
    1,
    'Landing Square',
    'move_update',
    generators('move_update_landing', ['0', '1', '2']),
  ),
  node(
    'node-3-2',
    'unit-3',
    2,
    'Vacated Square',
    'move_update',
    generators('move_update_vacated', ['0', '1', '2']),
  ),
  node(
    'node-3-3',
    'unit-3',
    3,
    'Capture Check',
    'move_update',
    generators('move_update_capture', ['0', '1', '2']),
  ),
  node(
    'node-4-1',
    'unit-4',
    1,
    'Pins',
    'functional_geometry',
    bankSlugs([
      'drill-pin-knight',
      'drill-pin-bishop',
      'drill-pin-rook-pawn',
    ]),
  ),
  node(
    'node-4-2',
    'unit-4',
    2,
    'Forks',
    'functional_geometry',
    bankSlugs([
      'drill-fork-knight',
      'drill-fork-royal-knight',
      'drill-fork-knight-dual',
    ]),
  ),
  node(
    'node-4-3',
    'unit-4',
    3,
    'Hanging Pieces',
    'functional_geometry',
    bankSlugs([
      'drill-hanging-queen-a4',
      'drill-hanging-queen-a7',
      'drill-hanging-knight-f6',
    ]),
  ),
  node(
    'node-5-1',
    'unit-5',
    1,
    'Check After Line',
    'story_check',
    bankSlugs([
      'drill-story-check',
      'drill-story-check-yes',
      'drill-story-check-white-no',
    ]),
  ),
  node(
    'node-5-2',
    'unit-5',
    2,
    'Piece Still There',
    'shallow_calc',
    generators('shallow_calc_state', ['0', '1', '2']),
  ),
  node(
    'node-5-3',
    'unit-5',
    3,
    'Attacked Square',
    'shallow_calc',
    generators('shallow_calc_attacked', ['0', '1', '2']),
  ),
  node(
    'node-6-1',
    'unit-6',
    1,
    'Castled King',
    'chunk',
    generators('chunk_castled', ['0', '1', '2']),
  ),
  node(
    'node-6-2',
    'unit-6',
    2,
    'Fianchetto',
    'chunk',
    generators('chunk_fianchetto', ['0', '1', '2']),
  ),
  node(
    'node-6-3',
    'unit-6',
    3,
    'Pawn Chain',
    'chunk',
    generators('chunk_pawn_chain', ['0', '1', '2']),
  ),
];

const nodesRecord = Object.fromEntries(
  NODES.map((trainingNode) => [trainingNode.id, trainingNode]),
) as Record<string, TrainingNode>;

export const CURRICULUM: TrainingCurriculum = {
  units: UNITS,
  nodes: nodesRecord,
  mainPathNodeIds: UNITS.flatMap((unit) => unit.nodeIds),
};

export function getNode(nodeId: string): TrainingNode | undefined {
  return CURRICULUM.nodes[nodeId];
}

export function getUnit(unitId: string): TrainingUnit | undefined {
  return CURRICULUM.units.find((unit) => unit.id === unitId);
}

export function getUnitForNode(nodeId: string): TrainingUnit | undefined {
  const trainingNode = getNode(nodeId);
  if (!trainingNode) return undefined;
  return getUnit(trainingNode.unitId);
}
