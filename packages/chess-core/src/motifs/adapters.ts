import type { PieceSymbol } from 'chess.js';
import type { Motif, MotifResult, PieceMap } from '../types/motifs';

const SAN_LETTERS: Record<Exclude<PieceSymbol, 'p'>, string> = {
  n: 'N',
  b: 'B',
  r: 'R',
  q: 'Q',
  k: 'K',
};

export function pieceToSanRef(piece: PieceMap): string {
  if (piece.type === 'p') {
    return piece.square;
  }
  return `${SAN_LETTERS[piece.type]}${piece.square}`;
}

export function motifToResult(motif: Motif): MotifResult {
  switch (motif.type) {
    case 'pin':
      return {
        motif: 'pin',
        attacker: pieceToSanRef(motif.attacker),
        target: pieceToSanRef(motif.pinnedPiece),
        pinned_to: pieceToSanRef(motif.kingBehind),
      };
    case 'skewer':
      return {
        motif: 'skewer',
        attacker: pieceToSanRef(motif.attacker),
        target: pieceToSanRef(motif.frontPiece),
        square: motif.rearPiece.square,
      };
    case 'fork':
      return {
        motif: 'fork',
        attacker: pieceToSanRef(motif.attacker),
        target: pieceToSanRef(motif.targets[0]),
        square: motif.attacker.square,
      };
    case 'hanging_piece':
      return {
        motif: 'hanging_piece',
        attacker: pieceToSanRef(motif.attackers[0]),
        target: pieceToSanRef(motif.piece),
        square: motif.piece.square,
      };
    case 'overloaded_defender':
      return {
        motif: 'overloaded_defender',
        attacker: pieceToSanRef(motif.defender),
        target: pieceToSanRef(motif.threatenedPieces[0]),
        square: motif.defender.square,
      };
    case 'discovered_attack':
      return {
        motif: 'discovered_attack',
        attacker: pieceToSanRef(motif.attacker),
        target: pieceToSanRef(motif.target),
        square: motif.unmaskedBy.square,
      };
  }
}
