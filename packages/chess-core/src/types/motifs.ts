import type { Square } from '@mindboard/shared';
import type { Color, PieceSymbol } from 'chess.js';

export interface PieceMap {
  square: Square;
  type: PieceSymbol;
  color: Color;
}

export interface SquareInfluence {
  square: Square;
  attackers: PieceMap[];
  defenders: PieceMap[];
}

export type MotifType =
  | 'pin'
  | 'skewer'
  | 'fork'
  | 'discovered_attack'
  | 'hanging_piece'
  | 'overloaded_defender';

export interface BaseMotif {
  type: MotifType;
  fen: string;
  forcingWeight: number;
}

export interface PinMotif extends BaseMotif {
  type: 'pin';
  attacker: PieceMap;
  pinnedPiece: PieceMap;
  kingBehind: PieceMap;
  pinKind: 'absolute' | 'relative';
}

export interface SkewerMotif extends BaseMotif {
  type: 'skewer';
  attacker: PieceMap;
  frontPiece: PieceMap;
  rearPiece: PieceMap;
}

export interface ForkMotif extends BaseMotif {
  type: 'fork';
  attacker: PieceMap;
  targets: PieceMap[];
  isRoyalFork: boolean;
}

export interface HangingPieceMotif extends BaseMotif {
  type: 'hanging_piece';
  piece: PieceMap;
  attackers: PieceMap[];
}

export interface OverloadedDefenderMotif extends BaseMotif {
  type: 'overloaded_defender';
  defender: PieceMap;
  defendedSquares: Square[];
  threatenedPieces: PieceMap[];
}

export interface DiscoveredAttackMotif extends BaseMotif {
  type: 'discovered_attack';
  attacker: PieceMap;
  target: PieceMap;
  unmaskedBy: PieceMap;
  isCheck: boolean;
}

export type Motif =
  | PinMotif
  | SkewerMotif
  | ForkMotif
  | HangingPieceMotif
  | OverloadedDefenderMotif
  | DiscoveredAttackMotif;

/** JSON shape for LLM templating or deterministic question builders. */
export interface MotifResult {
  motif: MotifType;
  attacker: string;
  target: string;
  pinned_to?: string;
  square?: string;
}

/** Training puzzle fields derived from a detected motif. */
export interface PuzzleDraft {
  motifResult: MotifResult;
  prompt: string;
  inputPlaceholder: string;
  answerType: 'square';
  expected: string;
  answerSquare: string;
  squaresTouched: Square[];
}
