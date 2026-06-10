import type { Motif } from '../types/motifs';
import { PIECE_VALUES } from './primitives';

function motifPieceValueSum(motif: Motif): number {
  const pieces: { type: keyof typeof PIECE_VALUES }[] = [];

  switch (motif.type) {
    case 'pin':
      pieces.push(motif.attacker, motif.pinnedPiece, motif.kingBehind);
      break;
    case 'skewer':
      pieces.push(motif.attacker, motif.frontPiece, motif.rearPiece);
      break;
    case 'fork':
      pieces.push(motif.attacker, ...motif.targets);
      break;
    case 'hanging_piece':
      pieces.push(motif.piece, ...motif.attackers);
      break;
    case 'overloaded_defender':
      pieces.push(motif.defender, ...motif.threatenedPieces);
      break;
    case 'discovered_attack':
      pieces.push(motif.attacker, motif.target, motif.unmaskedBy);
      break;
  }

  return pieces.reduce((sum, piece) => sum + PIECE_VALUES[piece.type], 0);
}

export function rankMotifs(motifs: Motif[]): Motif | null {
  if (motifs.length === 0) return null;

  return motifs.reduce((best, current) => {
    if (current.forcingWeight > best.forcingWeight) return current;
    if (current.forcingWeight < best.forcingWeight) return best;
    return motifPieceValueSum(current) > motifPieceValueSum(best) ? current : best;
  });
}
