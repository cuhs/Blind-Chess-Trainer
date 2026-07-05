import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';
import type { NodePuzzleSource } from '@mindboard/shared';
import { applyMoves } from '../validate';
import { validatePuzzleBankFixtures } from '../motifs/validate-puzzle-bank';
import fixtures from '../motifs/fixtures/puzzle-bank-fixtures.json';
import { CURRICULUM } from './curriculum';
import { buildTrainingPuzzleSpec } from './generators';
import { isLightSquare } from './generators/coordinate';

export interface CurriculumValidationIssue {
  nodeId: string;
  puzzleRef: string;
  message: string;
}

type PuzzleBankFixture = (typeof fixtures)[number];

const PIECE_WORD: Record<string, PieceSymbol> = {
  king: 'k',
  queen: 'q',
  rook: 'r',
  bishop: 'b',
  knight: 'n',
  pawn: 'p',
};

function displayFen(fen: string, moves: string[]): string {
  return moves.length > 0 ? applyMoves(fen, moves) : fen;
}

function loadFen(fen: string): Chess | null {
  try {
    return new Chess(fen);
  } catch {
    return null;
  }
}

function parsePieceFromPrompt(prompt: string): {
  color: Color;
  type: PieceSymbol;
} | null {
  const match = prompt.match(
    /\b(white|black)\s+(king|queen|rook|bishop|knight|pawn)\b/i,
  );
  if (!match) return null;
  return {
    color: match[1]!.toLowerCase().startsWith('w') ? 'w' : 'b',
    type: PIECE_WORD[match[2]!.toLowerCase()]!,
  };
}

function promptLeaksSquare(prompt: string, square: string): boolean {
  return prompt.toLowerCase().includes(square.toLowerCase());
}

function isPawnIsolated(chess: Chess, square: Square, color: Color): boolean {
  const piece = chess.get(square);
  if (!piece || piece.type !== 'p' || piece.color !== color) return false;

  const files = 'abcdefgh';
  const fileIndex = files.indexOf(square[0]!);
  for (const neighbor of [fileIndex - 1, fileIndex + 1]) {
    if (neighbor < 0 || neighbor > 7) continue;
    const neighborFile = files[neighbor]!;
    for (let rank = 1; rank <= 8; rank += 1) {
      const neighborPiece = chess.get(`${neighborFile}${rank}` as Square);
      if (
        neighborPiece &&
        neighborPiece.color === color &&
        neighborPiece.type === 'p'
      ) {
        return false;
      }
    }
  }
  return true;
}

function pawnDefendsFriendlyPawn(
  chess: Chess,
  defender: Square,
  target: Square,
  color: Color,
): boolean {
  const defenderPiece = chess.get(defender);
  const targetPiece = chess.get(target);
  if (
    !defenderPiece ||
    !targetPiece ||
    defenderPiece.type !== 'p' ||
    targetPiece.type !== 'p' ||
    defenderPiece.color !== color ||
    targetPiece.color !== color
  ) {
    return false;
  }

  const defenderFile = defender.charCodeAt(0) - 'a'.charCodeAt(0);
  const defenderRank = Number.parseInt(defender[1]!, 10);
  const targetFile = target.charCodeAt(0) - 'a'.charCodeAt(0);
  const targetRank = Number.parseInt(target[1]!, 10);
  const fileDelta = Math.abs(targetFile - defenderFile);
  const rankDelta = targetRank - defenderRank;

  if (fileDelta !== 1) return false;
  return color === 'w' ? rankDelta === 1 : rankDelta === -1;
}

function pawnDiagonallyDefends(
  chess: Chess,
  defender: Square,
  defended: Square,
  color: Color,
): boolean {
  return pawnDefendsFriendlyPawn(chess, defender, defended, color);
}

function hasKingsideFianchetto(chess: Chess, color: Color): boolean {
  const bishopSquare = color === 'w' ? 'g2' : 'g7';
  const pawnSquare = color === 'w' ? 'g3' : 'g6';
  const bishop = chess.get(bishopSquare);
  const pawn = chess.get(pawnSquare);
  return (
    bishop?.type === 'b' &&
    bishop.color === color &&
    pawn?.type === 'p' &&
    pawn.color === color
  );
}

function hasCastledKingside(chess: Chess, color: Color): boolean {
  const kingSquare = color === 'w' ? 'g1' : 'g8';
  const rookSquare = color === 'w' ? 'f1' : 'f8';
  const king = chess.get(kingSquare);
  const rook = chess.get(rookSquare);
  return king?.type === 'k' && king.color === color && rook?.type === 'r' && rook.color === color;
}

function validateGeneratedPuzzle(
  nodeId: string,
  generatorId: string,
  seed: string,
): CurriculumValidationIssue[] {
  const issues: CurriculumValidationIssue[] = [];
  const ref = `${generatorId}/${seed}`;

  let puzzle;
  try {
    puzzle = buildTrainingPuzzleSpec(generatorId, seed);
  } catch (error) {
    issues.push({
      nodeId,
      puzzleRef: ref,
      message: `Failed to build: ${error instanceof Error ? error.message : String(error)}`,
    });
    return issues;
  }

  let chess: Chess | null;
  const skipBoardLoad = puzzle.showBoard === false;
  if (!skipBoardLoad) {
    try {
      const fen = displayFen(puzzle.fen, puzzle.moves);
      chess = loadFen(fen);
      if (!chess) {
        issues.push({ nodeId, puzzleRef: ref, message: 'Invalid display FEN' });
        return issues;
      }
    } catch (error) {
      issues.push({
        nodeId,
        puzzleRef: ref,
        message: `Illegal moves: ${error instanceof Error ? error.message : String(error)}`,
      });
      return issues;
    }
  } else {
    chess = null;
  }

  if (generatorId === 'coordinate_color') {
    const square = seed as Square;
    const expected = isLightSquare(square) ? 'yes' : 'no';
    if (puzzle.expected !== expected) {
      issues.push({
        nodeId,
        puzzleRef: ref,
        message: `Light square mismatch for ${square}`,
      });
    }
  }

  if (generatorId === 'coordinate_neighbor') {
    const [square, axis] = seed.split(':') as [Square, 'rank' | 'file'];
    const file = square.charCodeAt(0);
    const rank = Number.parseInt(square[1]!, 10);
    const expected =
      axis === 'rank'
        ? (`${square[0]}${rank + 1}` as Square)
        : (`${String.fromCharCode(file + 1)}${square[1]}` as Square);
    if (puzzle.expected !== expected) {
      issues.push({
        nodeId,
        puzzleRef: ref,
        message: `Neighbor mismatch: expected ${expected}, got ${puzzle.expected}`,
      });
    } else if (!/^[a-h][1-8]$/.test(expected)) {
      issues.push({ nodeId, puzzleRef: ref, message: `Neighbor ${expected} off board` });
    }
  }

  if (generatorId === 'coordinate_knight_reach') {
    const [from, to] = seed.split(':') as [Square, Square];
    const reachChess = new Chess();
    reachChess.remove('a1');
    reachChess.put({ type: 'n', color: 'w' }, from);
    const canReach = reachChess
      .moves({ square: from, verbose: true })
      .some((move) => move.to === to);
    const expected = canReach ? 'yes' : 'no';
    if (puzzle.expected !== expected) {
      issues.push({
        nodeId,
        puzzleRef: ref,
        message: `Knight reach mismatch for ${from}→${to}`,
      });
    }
  }

  if (generatorId.startsWith('static_recall_')) {
    const recallChess = loadFen(puzzle.fen);
    if (!recallChess) {
      issues.push({ nodeId, puzzleRef: ref, message: 'Invalid static recall FEN' });
      return issues;
    }
    const pieceSpec = parsePieceFromPrompt(puzzle.prompt);
    if (!pieceSpec) {
      issues.push({ nodeId, puzzleRef: ref, message: 'Unparseable static recall prompt' });
    } else {
      const piece = recallChess.get(puzzle.expected as Square);
      if (
        !piece ||
        piece.type !== pieceSpec.type ||
        piece.color !== pieceSpec.color
      ) {
        issues.push({
          nodeId,
          puzzleRef: ref,
          message: `Expected ${pieceSpec.color} ${pieceSpec.type} on ${puzzle.expected}, found ${piece ? `${piece.color} ${piece.type}` : 'empty'}`,
        });
      }
    }
    if (promptLeaksSquare(puzzle.prompt, puzzle.expected)) {
      issues.push({ nodeId, puzzleRef: ref, message: 'Prompt leaks answer square' });
    }
  }

  if (generatorId.startsWith('move_update_')) {
    if (puzzle.moves.length !== 1) {
      issues.push({ nodeId, puzzleRef: ref, message: 'Move update must have exactly one move' });
    }
    const base = loadFen(puzzle.fen);
    if (!base) {
      issues.push({ nodeId, puzzleRef: ref, message: 'Invalid base FEN' });
    } else {
      const move = base.move(puzzle.moves[0]!);
      if (!move) {
        issues.push({ nodeId, puzzleRef: ref, message: `Illegal move ${puzzle.moves[0]}` });
      } else if (generatorId === 'move_update_landing' && puzzle.expected !== move.to) {
        issues.push({ nodeId, puzzleRef: ref, message: 'Landing answer mismatch' });
      } else if (generatorId === 'move_update_vacated' && puzzle.expected !== move.from) {
        issues.push({ nodeId, puzzleRef: ref, message: 'Vacated answer mismatch' });
      } else if (generatorId === 'move_update_capture') {
        const expected = move.captured ? 'yes' : 'no';
        if (puzzle.expected !== expected) {
          issues.push({ nodeId, puzzleRef: ref, message: 'Capture answer mismatch' });
        }
      }
    }
    if (puzzle.narrationScript) {
      const lower = puzzle.narrationScript.toLowerCase();
      if (lower.includes('takes') || lower.includes('capture')) {
        issues.push({ nodeId, puzzleRef: ref, message: 'Narration leaks capture' });
      }
      if (
        puzzle.answerType === 'square' &&
        promptLeaksSquare(puzzle.narrationScript, puzzle.expected)
      ) {
        issues.push({ nodeId, puzzleRef: ref, message: 'Narration leaks answer square' });
      }
    }
  }

    if (generatorId === 'shallow_calc_state' || generatorId === 'shallow_calc_attacked') {
      const baseChess = loadFen(displayFen(puzzle.fen, puzzle.moves));
      if (!baseChess) {
        issues.push({ nodeId, puzzleRef: ref, message: 'Invalid shallow calc FEN' });
        return issues;
      }

      if (generatorId === 'shallow_calc_state') {
        const pieceSpec = parsePieceFromPrompt(puzzle.prompt);
        const target = extractSquareFromPrompt(puzzle.prompt);
        if (!pieceSpec || !target) {
          issues.push({ nodeId, puzzleRef: ref, message: 'Unparseable piece-still-there prompt' });
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
              nodeId,
              puzzleRef: ref,
              message: `Piece-still-there expected ${expected}, got ${puzzle.expected}`,
            });
          }
        }
      }

      if (generatorId === 'shallow_calc_attacked') {
        const target = extractSquareFromPrompt(puzzle.prompt);
        const byWhite = puzzle.prompt.toLowerCase().includes('white');
        if (target) {
          const expected = baseChess.isAttacked(target, byWhite ? 'w' : 'b')
            ? 'yes'
            : 'no';
          if (puzzle.expected !== expected) {
            issues.push({
              nodeId,
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
          nodeId,
          puzzleRef: ref,
          message: `Castled expected ${expected}, got ${puzzle.expected}`,
        });
      }
    } else {
      const king = chess.get(puzzle.expected as Square);
      if (!king || king.type !== 'k' || king.color !== 'w') {
        issues.push({ nodeId, puzzleRef: ref, message: 'King square answer mismatch' });
      }
    }
  }

  if (generatorId === 'chunk_fianchetto' && chess) {
    if (puzzle.answerType === 'square') {
      const bishop = chess.get(puzzle.expected as Square);
      if (!bishop || bishop.type !== 'b') {
        issues.push({ nodeId, puzzleRef: ref, message: 'Fianchetto bishop square wrong' });
      } else if (!hasKingsideFianchetto(chess, bishop.color)) {
        issues.push({ nodeId, puzzleRef: ref, message: 'Position is not a kingside fianchetto' });
      }
    } else if (puzzle.prompt.includes('Black')) {
      const expected = hasKingsideFianchetto(chess, 'b') ? 'yes' : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          nodeId,
          puzzleRef: ref,
          message: `Black fianchetto expected ${expected}, got ${puzzle.expected}`,
        });
      }
    } else {
      const expected = hasKingsideFianchetto(chess, 'w') ? 'yes' : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          nodeId,
          puzzleRef: ref,
          message: `White fianchetto expected ${expected}, got ${puzzle.expected}`,
        });
      }
    }
  }

  if (generatorId === 'chunk_pawn_chain' && chess) {
    if (puzzle.prompt.includes('isolated')) {
      const expected = isPawnIsolated(chess, 'e4', 'w') ? 'yes' : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          nodeId,
          puzzleRef: ref,
          message: `Isolated pawn expected ${expected}, got ${puzzle.expected}`,
        });
      }
    } else if (puzzle.prompt.includes('Black')) {
      const expected = pawnDiagonallyDefends(chess, 'e6', 'd5', 'b') ? 'yes' : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          nodeId,
          puzzleRef: ref,
          message: `Black pawn chain expected ${expected}, got ${puzzle.expected}`,
        });
      }
    } else if (puzzle.prompt.includes('White')) {
      const expected = pawnDiagonallyDefends(chess, 'c4', 'd5', 'w') ? 'yes' : 'no';
      if (puzzle.expected !== expected) {
        issues.push({
          nodeId,
          puzzleRef: ref,
          message: `White pawn chain expected ${expected}, got ${puzzle.expected}`,
        });
      }
    }
  }

  return issues;
}

function extractSquareFromPrompt(prompt: string): Square | null {
  const match = prompt.match(/\b([a-h][1-8])\b/i);
  return match ? (match[1]!.toLowerCase() as Square) : null;
}

function collectCurriculumSources(): Array<{
  nodeId: string;
  source: NodePuzzleSource;
}> {
  const rows: Array<{ nodeId: string; source: NodePuzzleSource }> = [];
  for (const nodeId of CURRICULUM.mainPathNodeIds) {
    const node = CURRICULUM.nodes[nodeId]!;
    for (const source of node.puzzles) {
      rows.push({ nodeId, source });
    }
  }
  return rows;
}

export function validateCurriculumPuzzles(): CurriculumValidationIssue[] {
  const issues: CurriculumValidationIssue[] = [];
  const bankSlugs = new Set<string>();

  for (const { nodeId, source } of collectCurriculumSources()) {
    if (source.type === 'generator') {
      issues.push(
        ...validateGeneratedPuzzle(nodeId, source.generatorId, source.seed),
      );
    } else if (source.type === 'bank_slug') {
      bankSlugs.add(source.slug);
    }
  }

  const bankRows = (fixtures as PuzzleBankFixture[]).filter((row) =>
    bankSlugs.has(row.slug),
  );
  const missingSlugs = [...bankSlugs].filter(
    (slug) => !bankRows.some((row) => row.slug === slug),
  );
  for (const slug of missingSlugs) {
    issues.push({
      nodeId: 'bank',
      puzzleRef: slug,
      message: 'Curriculum bank slug missing from puzzle-bank-fixtures.json',
    });
  }

  for (const bankIssue of validatePuzzleBankFixtures(bankRows)) {
    issues.push({
      nodeId: 'bank',
      puzzleRef: bankIssue.slug,
      message: bankIssue.message,
    });
  }

  return issues;
}
