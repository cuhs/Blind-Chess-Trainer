import type { Motif } from '../types/motifs';
import { buildInfluenceMap } from './influence';
import { detectLinearMotifs } from './linear';
import {
  detectForks,
  detectHangingPieces,
  detectOverloadedDefenders,
} from './divergent';
import { detectDiscoveredAttacks } from './discovered';
import { rankMotifs } from './sorter';

export function analyzePosition(fen: string, previousFen?: string): Motif | null {
  const influenceMap = buildInfluenceMap(fen);
  if (!influenceMap) return null;

  const motifs: Motif[] = [
    ...detectLinearMotifs(fen, influenceMap),
    ...detectForks(fen, influenceMap),
    ...detectHangingPieces(fen, influenceMap),
    ...detectOverloadedDefenders(fen, influenceMap),
  ];

  if (previousFen) {
    motifs.push(...detectDiscoveredAttacks(previousFen, fen));
  }

  return rankMotifs(motifs);
}

export { buildInfluenceMap } from './influence';
export { detectLinearMotifs } from './linear';
export {
  detectForks,
  detectHangingPieces,
  detectOverloadedDefenders,
  detectDivergentMotifs,
} from './divergent';
export { detectDiscoveredAttacks } from './discovered';
export { rankMotifs } from './sorter';
export { motifToResult, pieceToSanRef } from './adapters';
export { buildPuzzleFromMotif } from './questions';
export { resolveTrainingPuzzle } from './resolve-training-puzzle';
export type {
  ResolvedTrainingPuzzle,
  TrainingPuzzleInput,
} from './resolve-training-puzzle';
