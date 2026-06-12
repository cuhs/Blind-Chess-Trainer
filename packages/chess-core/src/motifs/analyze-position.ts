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
