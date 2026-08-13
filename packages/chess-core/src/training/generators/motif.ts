import type { GeneratedTrainingPuzzle } from './types';
import {
  buildMotifPuzzle,
  buildStoryCheckPuzzle,
} from '../position-synthesis/motifs';

export function buildMotifPinPuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildMotifPuzzle('motif_pin', 'pin', seed);
}

export function buildMotifForkPuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildMotifPuzzle('motif_fork', 'fork', seed);
}

export function buildMotifSkewerPuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildMotifPuzzle('motif_skewer', 'skewer', seed);
}

export function buildMotifHangingPuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildMotifPuzzle('motif_hanging', 'hanging_piece', seed);
}

export function buildMotifDiscoveredPuzzle(
  seed: string,
): GeneratedTrainingPuzzle {
  return buildMotifPuzzle('motif_discovered', 'discovered_attack', seed);
}

export function buildMotifOverloadedPuzzle(
  seed: string,
): GeneratedTrainingPuzzle {
  return buildMotifPuzzle('motif_overloaded', 'overloaded_defender', seed);
}

export function buildStoryCheckLinePuzzle(
  seed: string,
): GeneratedTrainingPuzzle {
  return buildStoryCheckPuzzle(seed);
}
