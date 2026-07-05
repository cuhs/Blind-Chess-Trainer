import type { GeneratedTrainingPuzzle, GeneratorId } from './types';
import {
  buildCoordinateColorPuzzle,
  buildCoordinateKnightReachPuzzle,
  buildCoordinateNeighborPuzzle,
} from './coordinate';
import {
  buildMoveUpdateCapturePuzzle,
  buildMoveUpdateLandingPuzzle,
  buildMoveUpdateVacatedPuzzle,
} from './move-update';
import {
  buildStaticRecall2Puzzle,
  buildStaticRecall4Puzzle,
  buildStaticRecall6Puzzle,
} from './static-recall';
import {
  buildShallowCalcAttackedPuzzle,
  buildShallowCalcStatePuzzle,
} from './shallow-calc';
import {
  buildChunkCastledPuzzle,
  buildChunkFianchettoPuzzle,
  buildChunkPawnChainPuzzle,
} from './chunk';

const GENERATORS: Record<
  GeneratorId,
  (seed: string) => GeneratedTrainingPuzzle
> = {
  coordinate_color: buildCoordinateColorPuzzle,
  coordinate_neighbor: buildCoordinateNeighborPuzzle,
  coordinate_knight_reach: buildCoordinateKnightReachPuzzle,
  static_recall_2: buildStaticRecall2Puzzle,
  static_recall_4: buildStaticRecall4Puzzle,
  static_recall_6: buildStaticRecall6Puzzle,
  move_update_landing: buildMoveUpdateLandingPuzzle,
  move_update_vacated: buildMoveUpdateVacatedPuzzle,
  move_update_capture: buildMoveUpdateCapturePuzzle,
  shallow_calc_state: buildShallowCalcStatePuzzle,
  shallow_calc_attacked: buildShallowCalcAttackedPuzzle,
  chunk_castled: buildChunkCastledPuzzle,
  chunk_fianchetto: buildChunkFianchettoPuzzle,
  chunk_pawn_chain: buildChunkPawnChainPuzzle,
};

export function isGeneratorId(value: string): value is GeneratorId {
  return value in GENERATORS;
}

export function buildTrainingPuzzleSpec(
  generatorId: string,
  seed: string,
): GeneratedTrainingPuzzle {
  if (!isGeneratorId(generatorId)) {
    throw new Error(`Unknown generator: ${generatorId}`);
  }
  return GENERATORS[generatorId](seed);
}

export type { GeneratedTrainingPuzzle, GeneratorId } from './types';
