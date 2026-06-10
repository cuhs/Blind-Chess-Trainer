import type { Square } from '@mindboard/shared';
import type { Color, PieceSymbol } from 'chess.js';
import type {
  DiscoveredAttackMotif,
  ForkMotif,
  HangingPieceMotif,
  Motif,
  OverloadedDefenderMotif,
  PieceMap,
  PuzzleDraft,
} from '../types/motifs';
import { motifToResult } from './adapters';

const PIECE_NAMES: Record<PieceSymbol, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

function colorLabel(color: Color): string {
  return color === 'w' ? 'White' : 'Black';
}

function pieceLabel(piece: PieceMap): string {
  const name = PIECE_NAMES[piece.type];
  const titled = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  return `${colorLabel(piece.color)} ${titled}`;
}

function uniqueSquares(squares: Square[]): Square[] {
  return [...new Set(squares)];
}

function collectFromPieces(...pieces: PieceMap[]): Square[] {
  return uniqueSquares(pieces.map((piece) => piece.square));
}

function squarePuzzle(
  motif: Motif,
  prompt: string,
  answerSquare: Square,
  squaresTouched: Square[],
): PuzzleDraft {
  return {
    motifResult: motifToResult(motif),
    prompt,
    inputPlaceholder: 'e.g. a8',
    answerType: 'square',
    expected: answerSquare,
    answerSquare,
    squaresTouched: uniqueSquares(squaresTouched),
  };
}

function discoveredAttackPrompt(motif: DiscoveredAttackMotif): string {
  return `What square does the ${pieceLabel(motif.attacker)} attack from?`;
}

function forkPrompt(motif: ForkMotif): string {
  return `What square is the ${PIECE_NAMES[motif.attacker.type]} fork on?`;
}

function overloadedDefenderPrompt(motif: OverloadedDefenderMotif): string {
  return `What square is the ${pieceLabel(motif.defender)} that defends multiple attacked pieces on?`;
}

function hangingPiecePrompt(motif: HangingPieceMotif): string {
  if (motif.piece.type === 'k') {
    return `The ${pieceLabel(motif.piece)} is in check — what square is it on?`;
  }
  return `What square is the undefended ${PIECE_NAMES[motif.piece.type]} on?`;
}

export function buildPuzzleFromMotif(motif: Motif): PuzzleDraft {
  switch (motif.type) {
    case 'pin':
      return squarePuzzle(
        motif,
        `What square is the pinned ${PIECE_NAMES[motif.pinnedPiece.type]} on?`,
        motif.pinnedPiece.square,
        collectFromPieces(motif.attacker, motif.pinnedPiece, motif.kingBehind),
      );
    case 'discovered_attack':
      return squarePuzzle(
        motif,
        discoveredAttackPrompt(motif),
        motif.attacker.square,
        collectFromPieces(motif.attacker, motif.target, motif.unmaskedBy),
      );
    case 'overloaded_defender':
      return squarePuzzle(
        motif,
        overloadedDefenderPrompt(motif),
        motif.defender.square,
        [
          motif.defender.square,
          ...motif.threatenedPieces.map((piece) => piece.square),
        ],
      );
    case 'fork':
      return squarePuzzle(
        motif,
        forkPrompt(motif),
        motif.attacker.square,
        collectFromPieces(motif.attacker, ...motif.targets),
      );
    case 'skewer':
      return squarePuzzle(
        motif,
        `What square is the ${pieceLabel(motif.frontPiece)} on?`,
        motif.frontPiece.square,
        collectFromPieces(motif.attacker, motif.frontPiece, motif.rearPiece),
      );
    case 'hanging_piece':
      return squarePuzzle(
        motif,
        hangingPiecePrompt(motif),
        motif.piece.square,
        collectFromPieces(motif.piece, ...motif.attackers),
      );
  }
}
