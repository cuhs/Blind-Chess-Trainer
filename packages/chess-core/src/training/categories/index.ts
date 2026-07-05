import type { PuzzleKind } from '@mindboard/shared';
import type { MotifType } from '../../types/motifs';
import type { GeneratorId } from '../generators/types';
import { buildTrainingPuzzleSpec } from '../generators';
import { buildMotifPuzzle, buildStoryCheckPuzzle } from '../position-synthesis/motifs';
import type { GeneratedTrainingPuzzle } from '../generators/types';

/** All categories that can produce puzzles from a seed. */
export type PuzzleCategoryId =
  | GeneratorId
  | MotifType
  | 'story_check'
  | PuzzleKind;

export interface PuzzleCategoryMeta {
  id: PuzzleCategoryId;
  puzzleKind: PuzzleKind;
  /** Daily drill spread bucket. */
  dailyBucket: string;
  description: string;
}

const MOTIF_TO_KIND: Record<MotifType, PuzzleKind> = {
  pin: 'functional_geometry',
  fork: 'functional_geometry',
  skewer: 'functional_geometry',
  hanging_piece: 'functional_geometry',
  discovered_attack: 'functional_geometry',
  overloaded_defender: 'functional_geometry',
};

const GENERATOR_KIND: Record<GeneratorId, PuzzleKind> = {
  coordinate_color: 'coordinate',
  coordinate_neighbor: 'coordinate',
  coordinate_knight_reach: 'coordinate',
  static_recall_2: 'static_recall',
  static_recall_4: 'static_recall',
  static_recall_6: 'static_recall',
  move_update_landing: 'move_update',
  move_update_vacated: 'move_update',
  move_update_capture: 'move_update',
  shallow_calc_state: 'shallow_calc',
  shallow_calc_attacked: 'shallow_calc',
  chunk_castled: 'chunk',
  chunk_fianchetto: 'chunk',
  chunk_pawn_chain: 'chunk',
  motif_pin: 'functional_geometry',
  motif_fork: 'functional_geometry',
  motif_skewer: 'functional_geometry',
  motif_hanging: 'functional_geometry',
  motif_discovered: 'functional_geometry',
  motif_overloaded: 'functional_geometry',
  story_check_line: 'story_check',
};

const GENERATOR_DAILY_BUCKET: Record<GeneratorId, string> = {
  coordinate_color: 'other',
  coordinate_neighbor: 'other',
  coordinate_knight_reach: 'other',
  static_recall_2: 'other',
  static_recall_4: 'other',
  static_recall_6: 'other',
  move_update_landing: 'other',
  move_update_vacated: 'other',
  move_update_capture: 'other',
  shallow_calc_state: 'yes-no',
  shallow_calc_attacked: 'yes-no',
  chunk_castled: 'yes-no',
  chunk_fianchetto: 'yes-no',
  chunk_pawn_chain: 'yes-no',
  motif_pin: 'pin',
  motif_fork: 'fork',
  motif_skewer: 'skewer',
  motif_hanging: 'hanging',
  motif_discovered: 'discovered',
  motif_overloaded: 'other',
  story_check_line: 'check',
};

const MOTIF_GENERATOR: Record<MotifType, GeneratorId> = {
  pin: 'motif_pin',
  fork: 'motif_fork',
  skewer: 'motif_skewer',
  hanging_piece: 'motif_hanging',
  discovered_attack: 'motif_discovered',
  overloaded_defender: 'motif_overloaded',
};

/** Default generators per PuzzleKind for daily drill rotation. */
export const DAILY_CATEGORY_ROTATION: PuzzleCategoryId[] = [
  'motif_pin',
  'motif_fork',
  'motif_hanging',
  'motif_skewer',
  'motif_discovered',
  'story_check_line',
  'static_recall_4',
  'move_update_landing',
];

/** Generators available per curriculum PuzzleKind. */
export const GENERATORS_BY_KIND: Record<PuzzleKind, GeneratorId[]> = {
  coordinate: [
    'coordinate_color',
    'coordinate_neighbor',
    'coordinate_knight_reach',
  ],
  static_recall: ['static_recall_2', 'static_recall_4', 'static_recall_6'],
  move_update: [
    'move_update_landing',
    'move_update_vacated',
    'move_update_capture',
  ],
  functional_geometry: [
    'motif_pin',
    'motif_fork',
    'motif_skewer',
    'motif_hanging',
    'motif_discovered',
    'motif_overloaded',
  ],
  shallow_calc: ['shallow_calc_state', 'shallow_calc_attacked'],
  chunk: ['chunk_castled', 'chunk_fianchetto', 'chunk_pawn_chain'],
  story_check: ['story_check_line'],
};

function metaFor(id: PuzzleCategoryId): PuzzleCategoryMeta {
  if (id === 'story_check') {
    return {
      id,
      puzzleKind: 'story_check',
      dailyBucket: 'check',
      description: 'Check after a move line',
    };
  }

  if (id in MOTIF_TO_KIND) {
    const motif = id as MotifType;
    return {
      id,
      puzzleKind: MOTIF_TO_KIND[motif],
      dailyBucket: GENERATOR_DAILY_BUCKET[MOTIF_GENERATOR[motif]],
      description: `${motif} tactical motif`,
    };
  }

  if (id in GENERATOR_KIND) {
    const generatorId = id as GeneratorId;
    return {
      id,
      puzzleKind: GENERATOR_KIND[generatorId],
      dailyBucket: GENERATOR_DAILY_BUCKET[generatorId],
      description: generatorId.replace(/_/g, ' '),
    };
  }

  const kind = id as PuzzleKind;
  return {
    id: kind,
    puzzleKind: kind,
    dailyBucket: 'other',
    description: `${kind} family`,
  };
}

export function listCategories(): PuzzleCategoryMeta[] {
  const ids: PuzzleCategoryId[] = [
    ...Object.keys(GENERATOR_KIND),
    'story_check',
  ] as PuzzleCategoryId[];
  return ids.map(metaFor);
}

/** Accept generator ids, motif aliases, puzzle kinds, and story_check. */
export function isKnownCategory(value: string): value is PuzzleCategoryId {
  return (
    value in GENERATOR_KIND ||
    isMotifType(value) ||
    isPuzzleKind(value) ||
    value === 'story_check'
  );
}

export function isMotifType(value: string): value is MotifType {
  return value in MOTIF_TO_KIND;
}

export function isPuzzleKind(value: string): value is PuzzleKind {
  return value in GENERATORS_BY_KIND;
}

export function resolveCategoryGenerator(
  category: PuzzleCategoryId,
  seed: string,
): { generatorId: GeneratorId; seed: string } {
  if (category in GENERATOR_KIND) {
    return { generatorId: category as GeneratorId, seed };
  }

  if (isMotifType(category)) {
    return { generatorId: MOTIF_GENERATOR[category], seed };
  }

  if (category === 'story_check') {
    return { generatorId: 'story_check_line', seed };
  }

  if (isPuzzleKind(category)) {
    const generators = GENERATORS_BY_KIND[category];
    const index =
      Math.abs(hashString(`${category}:${seed}`)) % generators.length;
    return { generatorId: generators[index]!, seed };
  }

  throw new Error(`Unknown category: ${category}`);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

export function buildPuzzleFromCategory(
  category: PuzzleCategoryId,
  seed: string,
): GeneratedTrainingPuzzle {
  if (isMotifType(category)) {
    return buildMotifPuzzle(MOTIF_GENERATOR[category], category, seed);
  }

  if (category === 'story_check') {
    return buildStoryCheckPuzzle(seed);
  }

  const { generatorId, seed: resolvedSeed } = resolveCategoryGenerator(
    category,
    seed,
  );
  return buildTrainingPuzzleSpec(generatorId, resolvedSeed);
}

export function categoryDailyBucket(category: PuzzleCategoryId): string {
  return metaFor(category).dailyBucket;
}

export { MOTIF_GENERATOR };
