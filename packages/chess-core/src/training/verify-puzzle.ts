import { Chess, type Color, type Square } from 'chess.js';
import { analyzePosition } from '../motifs/analyze-position';
import { detectOverloadedDefenders } from '../motifs/divergent';
import { buildInfluenceMap } from '../motifs/influence';
import { rankMotifs } from '../motifs/sorter';
import { buildPuzzleFromMotif } from '../motifs/questions';
import type { GeneratedTrainingPuzzle } from './generators/types';
import { isLightSquare } from './generators/coordinate';
import type { GeneratorId } from './generators/types';
import type { MotifType } from '../types/motifs';
import type { PuzzleKind } from '@mindboard/shared';
import {
  displayFen,
  extractSquareFromPrompt,
  hasCastledKingside,
  hasKingsideFianchetto,
  isColorInCheck,
  isPawnIsolated,
  loadFen,
  parsePieceFromPrompt,
  pawnDiagonallyDefends,
  previousFenFor,
  promptLeaksSquare,
} from './puzzle-semantics';

export interface VerifyIssue {
  puzzleRef: string;
  message: string;
}

export interface VerifyOptions {
  generatorId?: GeneratorId | string;
  category?: MotifType | PuzzleKind | string;
}

export function verifyGeneratedPuzzle(
  puzzle: GeneratedTrainingPuzzle,
  options: VerifyOptions = {},
): VerifyIssue[] {
  const issues: VerifyIssue[] = [];
  const ref = options.generatorId ?? puzzle.id;

  if (!puzzle.prompt?.trim()) {
    issues.push({ puzzleRef: ref, message: 'Missing prompt' });
  }
  if (!puzzle.expected?.trim()) {
    issues.push({ puzzleRef: ref, message: 'Missing expected answer' });
  }
  if (!puzzle.squaresTouched?.length) {
    issues.push({ puzzleRef: ref, message: 'Missing squaresTouched' });
  }

  const generatorId = options.generatorId ?? inferGeneratorId(puzzle.id);

  let chess: Chess | null = null;
  const skipBoardLoad = puzzle.showBoard === false;

  if (!skipBoardLoad) {
    try {
      const fen = displayFen(puzzle.fen, puzzle.moves);
      chess = loadFen(fen);
      if (!chess) {
        issues.push({ puzzleRef: ref, message: 'Invalid display FEN' });
        return issues;
      }
    } catch (error) {
      issues.push({
        puzzleRef: ref,
        message: `Illegal moves: ${error instanceof Error ? error.message : String(error)}`,
      });
      return issues;
    }
  }

  if (generatorId === 'coordinate_color') {
    const square = extractSquareFromPrompt(puzzle.prompt);
    if (square) {
      const expected = isLightSquare(square) ? 'yes' : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          puzzleRef: ref,
          message: `Light square mismatch for ${square}`,
        });
      }
    }
  }

  if (generatorId === 'coordinate_neighbor') {
    const match = puzzle.prompt.match(/(?:above|right of)\s+([a-h][1-8])/i);
    const square = match?.[1]?.toLowerCase() as Square | undefined;
    if (square) {
      const axis = puzzle.prompt.includes('rank') ? 'rank' : 'file';
      const file = square.charCodeAt(0);
      const rank = Number.parseInt(square[1]!, 10);
      const expected =
        axis === 'rank'
          ? (`${square[0]}${rank + 1}` as Square)
          : (`${String.fromCharCode(file + 1)}${square[1]}` as Square);
      if (puzzle.expected !== expected) {
        issues.push({
          puzzleRef: ref,
          message: `Neighbor mismatch: expected ${expected}, got ${puzzle.expected}`,
        });
      } else if (!/^[a-h][1-8]$/.test(expected)) {
        issues.push({ puzzleRef: ref, message: `Neighbor ${expected} off board` });
      }
    }
  }

  if (generatorId === 'coordinate_knight_reach') {
    const match = puzzle.prompt.match(
      /knight on ([a-h][1-8]) reach ([a-h][1-8])/i,
    );
    if (match) {
      const from = match[1]!.toLowerCase() as Square;
      const to = match[2]!.toLowerCase() as Square;
      const reachChess = new Chess();
      reachChess.remove('a1');
      reachChess.put({ type: 'n', color: 'w' }, from);
      const canReach = reachChess
        .moves({ square: from, verbose: true })
        .some((move) => move.to === to);
      const expected = canReach ? 'yes' : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          puzzleRef: ref,
          message: `Knight reach mismatch for ${from}→${to}`,
        });
      }
    }
  }

  if (generatorId?.startsWith('static_recall_')) {
    const recallChess = loadFen(puzzle.fen);
    if (!recallChess) {
      issues.push({ puzzleRef: ref, message: 'Invalid static recall FEN' });
    } else {
      const pieceSpec = parsePieceFromPrompt(puzzle.prompt);
      if (!pieceSpec) {
        issues.push({ puzzleRef: ref, message: 'Unparseable static recall prompt' });
      } else {
        const piece = recallChess.get(puzzle.expected as Square);
        if (
          !piece ||
          piece.type !== pieceSpec.type ||
          piece.color !== pieceSpec.color
        ) {
          issues.push({
            puzzleRef: ref,
            message: `Expected ${pieceSpec.color} ${pieceSpec.type} on ${puzzle.expected}`,
          });
        }
      }
      if (promptLeaksSquare(puzzle.prompt, puzzle.expected)) {
        issues.push({ puzzleRef: ref, message: 'Prompt leaks answer square' });
      }
    }
  }

  if (generatorId?.startsWith('move_update_')) {
    if (puzzle.moves.length !== 1) {
      issues.push({
        puzzleRef: ref,
        message: 'Move update must have exactly one move',
      });
    }
    const base = loadFen(puzzle.fen);
    if (!base) {
      issues.push({ puzzleRef: ref, message: 'Invalid base FEN' });
    } else {
      const move = base.move(puzzle.moves[0]!);
      if (!move) {
        issues.push({
          puzzleRef: ref,
          message: `Illegal move ${puzzle.moves[0]}`,
        });
      } else if (generatorId === 'move_update_landing' && puzzle.expected !== move.to) {
        issues.push({ puzzleRef: ref, message: 'Landing answer mismatch' });
      } else if (
        generatorId === 'move_update_vacated' &&
        puzzle.expected !== move.from
      ) {
        issues.push({ puzzleRef: ref, message: 'Vacated answer mismatch' });
      } else if (generatorId === 'move_update_capture') {
        const expected = move.captured ? 'yes' : 'no';
        if (puzzle.expected !== expected) {
          issues.push({ puzzleRef: ref, message: 'Capture answer mismatch' });
        }
      }
    }
    if (puzzle.narrationScript) {
      const lower = puzzle.narrationScript.toLowerCase();
      if (lower.includes('takes') || lower.includes('capture')) {
        issues.push({ puzzleRef: ref, message: 'Narration leaks capture' });
      }
      if (
        puzzle.answerType === 'square' &&
        promptLeaksSquare(puzzle.narrationScript, puzzle.expected)
      ) {
        issues.push({ puzzleRef: ref, message: 'Narration leaks answer square' });
      }
    }
  }

  if (
    generatorId === 'shallow_calc_state' ||
    generatorId === 'shallow_calc_attacked'
  ) {
    const baseChess = loadFen(displayFen(puzzle.fen, puzzle.moves));
    if (!baseChess) {
      issues.push({ puzzleRef: ref, message: 'Invalid shallow calc FEN' });
    } else if (generatorId === 'shallow_calc_state') {
      const pieceSpec = parsePieceFromPrompt(puzzle.prompt);
      const target = extractSquareFromPrompt(puzzle.prompt);
      if (!pieceSpec || !target) {
        issues.push({
          puzzleRef: ref,
          message: 'Unparseable piece-still-there prompt',
        });
      } else {
        const piece = baseChess.get(target);
        const expected =
          piece &&
          piece.color === pieceSpec.color &&
          piece.type === pieceSpec.type
            ? 'yes'
            : 'no';
        if (puzzle.expected !== expected) {
          issues.push({
            puzzleRef: ref,
            message: `Piece-still-there expected ${expected}, got ${puzzle.expected}`,
          });
        }
      }
    } else {
      const target = extractSquareFromPrompt(puzzle.prompt);
      const byWhite = puzzle.prompt.toLowerCase().includes('white');
      if (target) {
        const expected = baseChess.isAttacked(target, byWhite ? 'w' : 'b')
          ? 'yes'
          : 'no';
        if (puzzle.expected !== expected) {
          issues.push({
            puzzleRef: ref,
            message: `Attacked-square expected ${expected}, got ${puzzle.expected}`,
          });
        }
      }
    }
  }

  if (generatorId === 'chunk_castled' && chess) {
    const castled = hasCastledKingside(chess, 'w');
    if (puzzle.prompt.includes('castled')) {
      const expected = castled ? 'yes' : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          puzzleRef: ref,
          message: `Castled expected ${expected}, got ${puzzle.expected}`,
        });
      }
    } else {
      const king = chess.get(puzzle.expected as Square);
      if (!king || king.type !== 'k' || king.color !== 'w') {
        issues.push({ puzzleRef: ref, message: 'King square answer mismatch' });
      }
    }
  }

  if (generatorId === 'chunk_fianchetto' && chess) {
    if (puzzle.answerType === 'square') {
      const bishop = chess.get(puzzle.expected as Square);
      if (!bishop || bishop.type !== 'b') {
        issues.push({ puzzleRef: ref, message: 'Fianchetto bishop square wrong' });
      } else if (!hasKingsideFianchetto(chess, bishop.color)) {
        issues.push({
          puzzleRef: ref,
          message: 'Position is not a kingside fianchetto',
        });
      }
    } else if (puzzle.prompt.includes('Black')) {
      const expected = hasKingsideFianchetto(chess, 'b') ? 'yes' : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          puzzleRef: ref,
          message: `Black fianchetto expected ${expected}, got ${puzzle.expected}`,
        });
      }
    } else {
      const expected = hasKingsideFianchetto(chess, 'w') ? 'yes' : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          puzzleRef: ref,
          message: `White fianchetto expected ${expected}, got ${puzzle.expected}`,
        });
      }
    }
  }

  if (generatorId === 'chunk_pawn_chain' && chess) {
    if (puzzle.prompt.includes('isolated')) {
      const square = extractSquareFromPrompt(puzzle.prompt) ?? ('e4' as Square);
      const piece = chess.get(square);
      const color = piece?.color ?? 'w';
      const expected = isPawnIsolated(chess, square, color) ? 'yes' : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          puzzleRef: ref,
          message: `Isolated pawn expected ${expected}, got ${puzzle.expected}`,
        });
      }
    } else if (puzzle.prompt.includes('Black')) {
      const expected = pawnDiagonallyDefends(chess, 'e6', 'd5', 'b')
        ? 'yes'
        : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          puzzleRef: ref,
          message: `Black pawn chain expected ${expected}, got ${puzzle.expected}`,
        });
      }
    } else if (puzzle.prompt.includes('White')) {
      const expected = pawnDiagonallyDefends(chess, 'c4', 'd5', 'w')
        ? 'yes'
        : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          puzzleRef: ref,
          message: `White pawn chain expected ${expected}, got ${puzzle.expected}`,
        });
      }
    }
  }

  if (generatorId === 'story_check_line') {
    const display = displayFen(puzzle.fen, puzzle.moves);
    const colorMatch = puzzle.prompt.match(/(White|Black) King/i);
    const color = colorMatch?.[1]?.toLowerCase().startsWith('w') ? 'w' : 'b';
    const expected = isColorInCheck(display, color as Color) ? 'yes' : 'no';
    if (puzzle.expected !== expected) {
      issues.push({
        puzzleRef: ref,
        message: `story_check expected ${expected}, got ${puzzle.expected}`,
      });
    }
  }

  if (generatorId?.startsWith('motif_') && chess) {
    const motifType = motifTypeFromGeneratorId(generatorId);
    const prev = previousFenFor(puzzle.fen, puzzle.moves);
    const motif = resolveMotifForVerification(chess.fen(), prev, motifType);
    if (!motif) {
      issues.push({ puzzleRef: ref, message: 'Expected motif detection' });
    } else if (motif.type !== motifType) {
      issues.push({
        puzzleRef: ref,
        message: `Motif type mismatch: ${motif.type} vs ${motifType}`,
      });
    } else {
      const draft = buildPuzzleFromMotif(motif);
      if (draft.expected !== puzzle.expected) {
        issues.push({
          puzzleRef: ref,
          message: `Motif expected ${draft.expected}, got ${puzzle.expected}`,
        });
      }
    }
  }

  if (puzzle.answerType === 'square' && chess && generatorId?.startsWith('motif_')) {
    const influence = buildInfluenceMap(chess.fen());
    if (generatorId === 'motif_hanging' && influence) {
      const square = puzzle.expected as Square;
      const inf = influence[square];
      if (inf && (inf.attackers.length === 0 || inf.defenders.length > 0)) {
        issues.push({
          puzzleRef: ref,
          message: 'Hanging piece is not undefended',
        });
      }
    }
  }

  return issues;
}

function inferGeneratorId(puzzleId: string): string | undefined {
  const match = puzzleId.match(/^gen-(.+?)-/);
  return match?.[1];
}

const GENERATOR_TO_MOTIF: Record<string, MotifType> = {
  motif_pin: 'pin',
  motif_fork: 'fork',
  motif_skewer: 'skewer',
  motif_hanging: 'hanging_piece',
  motif_discovered: 'discovered_attack',
  motif_overloaded: 'overloaded_defender',
};

export function motifTypeFromGeneratorId(generatorId: string): MotifType {
  const mapped = GENERATOR_TO_MOTIF[generatorId];
  if (mapped) return mapped;
  return generatorId.replace('motif_', '') as MotifType;
}

export function resolveMotifForVerification(
  fen: string,
  previousFen: string | undefined,
  motifType: MotifType,
): ReturnType<typeof analyzePosition> {
  const ranked = analyzePosition(fen, previousFen);
  if (ranked?.type === motifType) return ranked;

  if (motifType === 'overloaded_defender') {
    const influenceMap = buildInfluenceMap(fen);
    if (!influenceMap) return null;
    return rankMotifs(detectOverloadedDefenders(fen, influenceMap));
  }

  return null;
}

export function assertVerifiedPuzzle(
  puzzle: GeneratedTrainingPuzzle,
  options?: VerifyOptions,
): void {
  const issues = verifyGeneratedPuzzle(puzzle, options);
  if (issues.length > 0) {
    throw new Error(
      issues.map((issue) => `${issue.puzzleRef}: ${issue.message}`).join('; '),
    );
  }
}
