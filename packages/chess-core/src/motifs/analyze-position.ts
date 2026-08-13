import type { Motif } from '../types/motifs';
import { detectDiscoveredAttacks } from './discovered';
import {
  detectForks,
  detectHangingPieces,
  detectOverloadedDefenders,
} from './divergent';
import { buildInfluenceMap } from './influence';
import { detectLinearMotifs } from './linear';
import { rankMotifs } from './sorter';

export function collectMotifs(fen: string, previousFen?: string): Motif[] {
  const influenceMap = buildInfluenceMap(fen);
  if (!influenceMap) return [];

  const motifs: Motif[] = [
    ...detectLinearMotifs(fen, influenceMap),
    ...detectForks(fen, influenceMap),
    ...detectHangingPieces(fen, influenceMap),
    ...detectOverloadedDefenders(fen, influenceMap),
  ];

  if (previousFen) {
    motifs.push(...detectDiscoveredAttacks(previousFen, fen));
  }

  return motifs;
}

export function analyzePosition(fen: string, previousFen?: string): Motif | null {
  return rankMotifs(collectMotifs(fen, previousFen));
}
