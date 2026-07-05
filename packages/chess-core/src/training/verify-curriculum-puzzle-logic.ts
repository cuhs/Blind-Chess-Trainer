import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';
import type { NodePuzzleSource } from '@mindboard/shared';
import { analyzePosition } from '../motifs/analyze-position';
import { buildPuzzleFromMotif } from '../motifs/questions';
import { buildInfluenceMap } from '../motifs/influence';
import fixtures from '../motifs/fixtures/puzzle-bank-fixtures.json';
import { applyMoves } from '../validate';
import { CURRICULUM } from './curriculum';
import { buildTrainingPuzzleSpec } from './generators';
import { isLightSquare } from './generators/coordinate';
import type { GeneratedTrainingPuzzle } from './generators/types';

export interface PuzzleLogicIssue {
  nodeId: string;
  puzzleRef: string;
  prompt: string;
  expected: string;
  computed: string | null;
  message: string;
}

type BankFixture = (typeof fixtures)[number];

const PIECE_WORD: Record<string, PieceSymbol> = {
  king: 'k',
  queen: 'q',
  rook: 'r',
  bishop: 'b',
  knight: 'n',
  pawn: 'p',
};

const FILES = 'abcdefgh';

function displayFen(fen: string, moves: string[]): string {
  return moves.length > 0 ? applyMoves(fen, moves) : fen;
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

function extractSquareFromPrompt(prompt: string): Square | null {
  const match = prompt.match(/\b([a-h][1-8])\b/i);
  return match ? (match[1]!.toLowerCase() as Square) : null;
}

function findPieceSquare(
  fen: string,
  color: Color,
  type: PieceSymbol,
): Square | null {
  const chess = new Chess(fen);
  for (let file = 0; file < 8; file += 1) {
    for (let rank = 1; rank <= 8; rank += 1) {
      const square = `${FILES[file]}${rank}` as Square;
      const piece = chess.get(square);
      if (piece && piece.color === color && piece.type === type) {
        return square;
      }
    }
  }
  return null;
}

function isPawnIsolated(chess: Chess, square: Square, color: Color): boolean {
  const piece = chess.get(square);
  if (!piece || piece.type !== 'p' || piece.color !== color) return false;

  const fileIndex = FILES.indexOf(square[0]!);
  for (const neighbor of [fileIndex - 1, fileIndex + 1]) {
    if (neighbor < 0 || neighbor > 7) continue;
    const neighborFile = FILES[neighbor]!;
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

function hasPawnChain(
  chess: Chess,
  sqA: Square,
  sqB: Square,
  color: Color,
): boolean {
  return (
    pawnDefendsFriendlyPawn(chess, sqA, sqB, color) ||
    pawnDefendsFriendlyPawn(chess, sqB, sqA, color)
  );
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
  return (
    king?.type === 'k' &&
    king.color === color &&
    rook?.type === 'r' &&
    rook.color === color
  );
}

function isColorInCheck(fen: string, color: Color): boolean {
  const chess = new Chess(fen);
  return chess.turn() === color && chess.inCheck();
}

function solveCoordinateNeighbor(seed: string): Square {
  const [square, axis] = seed.split(':') as [Square, 'rank' | 'file'];
  const file = square.charCodeAt(0);
  const rank = Number.parseInt(square[1]!, 10);
  if (axis === 'rank') {
    return `${square[0]}${rank + 1}` as Square;
  }
  return `${String.fromCharCode(file + 1)}${square[1]}` as Square;
}

function solveKnightReach(seed: string): 'yes' | 'no' {
  const [from, to] = seed.split(':') as [Square, Square];
  const chess = new Chess();
  chess.remove('a1');
  chess.put({ type: 'n', color: 'w' }, from);
  const canReach = chess
    .moves({ square: from, verbose: true })
    .some((move) => move.to === to);
  return canReach ? 'yes' : 'no';
}

function solveGeneratedPuzzle(
  generatorId: string,
  seed: string,
  puzzle: GeneratedTrainingPuzzle,
): string | null {
  if (generatorId === 'coordinate_color') {
    return isLightSquare(seed as Square) ? 'yes' : 'no';
  }

  if (generatorId === 'coordinate_neighbor') {
    return solveCoordinateNeighbor(seed);
  }

  if (generatorId === 'coordinate_knight_reach') {
    return solveKnightReach(seed);
  }

  if (generatorId.startsWith('static_recall_')) {
    const spec = parsePieceFromPrompt(puzzle.prompt);
    if (!spec) return null;
    return findPieceSquare(puzzle.fen, spec.color, spec.type);
  }

  if (generatorId.startsWith('move_update_')) {
    const chess = new Chess(puzzle.fen);
    const move = chess.move(puzzle.moves[0]!);
    if (!move) return null;
    if (generatorId === 'move_update_landing') return move.to;
    if (generatorId === 'move_update_vacated') return move.from;
    return move.captured ? 'yes' : 'no';
  }

  const afterFen = displayFen(puzzle.fen, puzzle.moves);
  const chess = new Chess(afterFen);

  if (generatorId === 'shallow_calc_state') {
    const spec = parsePieceFromPrompt(puzzle.prompt);
    const target = extractSquareFromPrompt(puzzle.prompt);
    if (!spec || !target) return null;
    const piece = chess.get(target);
    const stillThere =
      piece != null &&
      piece.color === spec.color &&
      piece.type === spec.type;
    return stillThere ? 'yes' : 'no';
  }

  if (generatorId === 'shallow_calc_attacked') {
    const target = extractSquareFromPrompt(puzzle.prompt);
    if (!target) return null;
    const byWhite = puzzle.prompt.toLowerCase().includes('white');
    return chess.isAttacked(target, byWhite ? 'w' : 'b') ? 'yes' : 'no';
  }

  if (generatorId === 'chunk_castled') {
    if (puzzle.prompt.includes('castled')) {
      return hasCastledKingside(chess, 'w') ? 'yes' : 'no';
    }
    return findPieceSquare(afterFen, 'w', 'k');
  }

  if (generatorId === 'chunk_fianchetto') {
    if (puzzle.answerType === 'square') {
      const color = hasKingsideFianchetto(chess, 'b')
        ? 'b'
        : hasKingsideFianchetto(chess, 'w')
          ? 'w'
          : null;
      if (!color) return null;
      return color === 'w' ? 'g2' : 'g7';
    }
    const color = puzzle.prompt.includes('Black') ? 'b' : 'w';
    return hasKingsideFianchetto(chess, color) ? 'yes' : 'no';
  }

  if (generatorId === 'chunk_pawn_chain') {
    if (puzzle.prompt.includes('isolated')) {
      const square = extractSquareFromPrompt(puzzle.prompt);
      if (!square) return null;
      const piece = chess.get(square);
      const color = piece?.color ?? 'w';
      return isPawnIsolated(chess, square, color) ? 'yes' : 'no';
    }

    const chainMatch = puzzle.prompt.match(
      /on ([a-h][1-8]) and ([a-h][1-8])/i,
    );
    if (!chainMatch) return null;
    const sqA = chainMatch[1]!.toLowerCase() as Square;
    const sqB = chainMatch[2]!.toLowerCase() as Square;
    const color = puzzle.prompt.includes('Black') ? 'b' : 'w';
    return hasPawnChain(chess, sqA, sqB, color) ? 'yes' : 'no';
  }

  if (generatorId === 'story_check_line') {
    const color = puzzle.prompt.toLowerCase().includes('white') ? 'w' : 'b';
    return isColorInCheck(afterFen, color) ? 'yes' : 'no';
  }

  if (generatorId.startsWith('motif_')) {
    const previousFen =
      puzzle.moves.length === 0
        ? undefined
        : puzzle.moves.length === 1
          ? puzzle.fen
          : applyMoves(puzzle.fen, puzzle.moves.slice(0, -1));
    const motif = analyzePosition(afterFen, previousFen);
    if (!motif) return null;
    return buildPuzzleFromMotif(motif).expected;
  }

  return null;
}

function parsePromptPieceType(prompt: string): PieceSymbol | null {
  const match = prompt.match(
    /\b(pinned|pinning|undefended|forked)?\s*(king|queen|rook|bishop|knight|pawn)\b/i,
  );
  if (!match?.[2]) return null;
  return PIECE_WORD[match[2].toLowerCase()] ?? null;
}

function solveBankPuzzle(fixture: BankFixture): string | null {
  const fen = displayFen(fixture.fen, fixture.moves);
  const prompt = fixture.nlpPrompt ?? '';

  if (fixture.motifJson.motif === 'story_check') {
    const color =
      fixture.checkColor ??
      (prompt.toLowerCase().includes('white') ? 'w' : 'b');
    return isColorInCheck(fen, color) ? 'yes' : 'no';
  }

  const motif = analyzePosition(fen);
  if (!motif) return null;

  const lower = prompt.toLowerCase();

  if (lower.includes('pinned')) {
    if (motif.type !== 'pin') return null;
    const type = parsePromptPieceType(prompt);
    if (type && motif.pinnedPiece.type === type) {
      return motif.pinnedPiece.square;
    }
  }

  if (lower.includes('pinning')) {
    if (motif.type !== 'pin') return null;
    const type = parsePromptPieceType(prompt);
    if (type && motif.attacker.type === type) {
      return motif.attacker.square;
    }
  }

  if (lower.includes('undefended') || lower.includes('in check')) {
    if (motif.type !== 'hanging_piece') return null;
    const type = parsePromptPieceType(prompt);
    if (type && motif.piece.type === type) {
      return motif.piece.square;
    }
    if (lower.includes('in check') && motif.piece.type === 'k') {
      return motif.piece.square;
    }
  }

  if (lower.includes('fork on') || lower.includes('forked')) {
    if (motif.type !== 'fork') return null;
    if (lower.includes('fork on')) return motif.attacker.square;
    const type = parsePromptPieceType(prompt);
    const target = type
      ? motif.targets.find((piece) => piece.type === type)
      : motif.targets[0];
    return target?.square ?? null;
  }

  return null;
}

function verifyGeneratedPuzzle(
  nodeId: string,
  generatorId: string,
  seed: string,
): PuzzleLogicIssue | null {
  const ref = `${generatorId}/${seed}`;
  const puzzle = buildTrainingPuzzleSpec(generatorId, seed);
  const computed = solveGeneratedPuzzle(generatorId, seed, puzzle);

  if (computed === null) {
    return {
      nodeId,
      puzzleRef: ref,
      prompt: puzzle.prompt,
      expected: puzzle.expected,
      computed: null,
      message: 'Could not independently solve puzzle from prompt/position',
    };
  }

  if (computed !== puzzle.expected) {
    return {
      nodeId,
      puzzleRef: ref,
      prompt: puzzle.prompt,
      expected: puzzle.expected,
      computed,
      message: `Independent solve got "${computed}", puzzle expects "${puzzle.expected}"`,
    };
  }

  return null;
}

function verifyBankPuzzle(
  nodeId: string,
  fixture: BankFixture,
): PuzzleLogicIssue | null {
  const computed = solveBankPuzzle(fixture);
  const expected = fixture.expectedAnswer;

  if (computed === null) {
    return {
      nodeId,
      puzzleRef: fixture.slug,
      prompt: fixture.nlpPrompt ?? '',
      expected,
      computed: null,
      message: 'Could not independently solve bank puzzle from prompt/position',
    };
  }

  if (computed !== expected) {
    return {
      nodeId,
      puzzleRef: fixture.slug,
      prompt: fixture.nlpPrompt ?? '',
      expected,
      computed,
      message: `Independent solve got "${computed}", seed expects "${expected}"`,
    };
  }

  return null;
}

function isOnBoard(square: string): boolean {
  return /^[a-h][1-8]$/.test(square);
}

function verifyGeneratedSemantics(
  nodeId: string,
  generatorId: string,
  seed: string,
  puzzle: GeneratedTrainingPuzzle,
): PuzzleLogicIssue | null {
  const ref = `${generatorId}/${seed}`;

  if (generatorId === 'coordinate_neighbor') {
    const computed = solveCoordinateNeighbor(seed);
    if (!isOnBoard(computed)) {
      return {
        nodeId,
        puzzleRef: ref,
        prompt: puzzle.prompt,
        expected: puzzle.expected,
        computed,
        message: `Neighbor ${computed} is off the board`,
      };
    }
  }

  if (generatorId.startsWith('move_update_') && puzzle.narrationScript) {
    const lower = puzzle.narrationScript.toLowerCase();
    if (lower.includes('takes') || lower.includes('capture')) {
      return {
        nodeId,
        puzzleRef: ref,
        prompt: puzzle.prompt,
        expected: puzzle.expected,
        computed: null,
        message: 'Narration spoils capture answer',
      };
    }
    if (
      puzzle.answerType === 'square' &&
      lower.includes(puzzle.expected.toLowerCase())
    ) {
      return {
        nodeId,
        puzzleRef: ref,
        prompt: puzzle.prompt,
        expected: puzzle.expected,
        computed: null,
        message: 'Narration spoils landing/vacated square',
      };
    }
  }

  if (generatorId.startsWith('static_recall_')) {
    if (puzzle.prompt.toLowerCase().includes(puzzle.expected.toLowerCase())) {
      return {
        nodeId,
        puzzleRef: ref,
        prompt: puzzle.prompt,
        expected: puzzle.expected,
        computed: null,
        message: 'Prompt leaks answer square',
      };
    }
  }

  if (generatorId === 'chunk_pawn_chain' && puzzle.prompt.includes('chain')) {
    const chainMatch = puzzle.prompt.match(
      /on ([a-h][1-8]) and ([a-h][1-8])/i,
    );
    if (chainMatch) {
      const chess = new Chess(puzzle.fen);
      const sqA = chainMatch[1]!.toLowerCase() as Square;
      const sqB = chainMatch[2]!.toLowerCase() as Square;
      const color = puzzle.prompt.includes('Black') ? 'b' : 'w';
      for (const sq of [sqA, sqB]) {
        const piece = chess.get(sq);
        if (!piece || piece.type !== 'p' || piece.color !== color) {
          return {
            nodeId,
            puzzleRef: ref,
            prompt: puzzle.prompt,
            expected: puzzle.expected,
            computed: null,
            message: `Chain square ${sq} is not a ${color} pawn`,
          };
        }
      }
    }
  }

  return null;
}

function verifyBankSemantics(
  nodeId: string,
  fixture: BankFixture,
): PuzzleLogicIssue | null {
  const fen = displayFen(fixture.fen, fixture.moves);
  const prompt = fixture.nlpPrompt ?? '';
  const motif = analyzePosition(fen);

  if (fixture.motifJson.motif === 'story_check') {
    if (fixture.expectedAnswer === 'yes') {
      const color =
        fixture.checkColor ??
        (prompt.toLowerCase().includes('white') ? 'w' : 'b');
      if (!isColorInCheck(fen, color)) {
        return {
          nodeId,
          puzzleRef: fixture.slug,
          prompt,
          expected: fixture.expectedAnswer,
          computed: 'no',
          message: 'Story-check yes answer but king is not in check on their turn',
        };
      }
    }
    return null;
  }

  if (!motif) {
    return {
      nodeId,
      puzzleRef: fixture.slug,
      prompt,
      expected: fixture.expectedAnswer,
      computed: null,
      message: 'No tactical motif detected in position',
    };
  }

  if (prompt.toLowerCase().includes('pinned')) {
    if (motif.type !== 'pin') {
      return {
        nodeId,
        puzzleRef: fixture.slug,
        prompt,
        expected: fixture.expectedAnswer,
        computed: null,
        message: `Prompt asks about a pin but motif is ${motif.type}`,
      };
    }
    if (motif.pinnedPiece.square !== fixture.expectedAnswer) {
      return {
        nodeId,
        puzzleRef: fixture.slug,
        prompt,
        expected: fixture.expectedAnswer,
        computed: motif.pinnedPiece.square,
        message: 'Expected answer is not the pinned piece square',
      };
    }
  }

  if (prompt.toLowerCase().includes('pinning')) {
    if (motif.type !== 'pin') {
      return {
        nodeId,
        puzzleRef: fixture.slug,
        prompt,
        expected: fixture.expectedAnswer,
        computed: null,
        message: `Prompt asks about pinning piece but motif is ${motif.type}`,
      };
    }
    if (motif.attacker.square !== fixture.expectedAnswer) {
      return {
        nodeId,
        puzzleRef: fixture.slug,
        prompt,
        expected: fixture.expectedAnswer,
        computed: motif.attacker.square,
        message: 'Expected answer is not the pinning piece square',
      };
    }
  }

  if (prompt.toLowerCase().includes('fork on')) {
    if (motif.type !== 'fork') {
      return {
        nodeId,
        puzzleRef: fixture.slug,
        prompt,
        expected: fixture.expectedAnswer,
        computed: null,
        message: `Prompt asks about fork but motif is ${motif.type}`,
      };
    }
    if (motif.targets.length < 2) {
      return {
        nodeId,
        puzzleRef: fixture.slug,
        prompt,
        expected: fixture.expectedAnswer,
        computed: null,
        message: `Fork only threatens ${motif.targets.length} piece(s)`,
      };
    }
    if (motif.attacker.square !== fixture.expectedAnswer) {
      return {
        nodeId,
        puzzleRef: fixture.slug,
        prompt,
        expected: fixture.expectedAnswer,
        computed: motif.attacker.square,
        message: 'Expected answer is not the forking piece square',
      };
    }
  }

  if (prompt.toLowerCase().includes('undefended')) {
    if (motif.type !== 'hanging_piece') {
      return {
        nodeId,
        puzzleRef: fixture.slug,
        prompt,
        expected: fixture.expectedAnswer,
        computed: null,
        message: `Prompt asks about undefended piece but motif is ${motif.type}`,
      };
    }
    if (motif.piece.square !== fixture.expectedAnswer) {
      return {
        nodeId,
        puzzleRef: fixture.slug,
        prompt,
        expected: fixture.expectedAnswer,
        computed: motif.piece.square,
        message: 'Expected answer is not the hanging piece square',
      };
    }
    const influence = buildInfluenceMap(fen);
    if (influence) {
      const defenders = influence[motif.piece.square as Square]?.defenders ?? [];
      if (defenders.length > 0) {
        return {
          nodeId,
          puzzleRef: fixture.slug,
          prompt,
          expected: fixture.expectedAnswer,
          computed: null,
          message: `Hanging target ${motif.piece.square} has ${defenders.length} defender(s)`,
        };
      }
    }
  }

  return null;
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

export function verifyCurriculumPuzzleLogic(): PuzzleLogicIssue[] {
  const issues: PuzzleLogicIssue[] = [];
  const bankBySlug = new Map(
    (fixtures as BankFixture[]).map((row) => [row.slug, row]),
  );

  for (const { nodeId, source } of collectCurriculumSources()) {
    if (source.type === 'generator') {
      const puzzle = buildTrainingPuzzleSpec(
        source.generatorId,
        source.seed,
      );
      const answerIssue = verifyGeneratedPuzzle(
        nodeId,
        source.generatorId,
        source.seed,
      );
      if (answerIssue) {
        issues.push(answerIssue);
        continue;
      }
      const semanticIssue = verifyGeneratedSemantics(
        nodeId,
        source.generatorId,
        source.seed,
        puzzle,
      );
      if (semanticIssue) issues.push(semanticIssue);
    } else {
      const row = bankBySlug.get(source.slug);
      if (!row) {
        issues.push({
          nodeId,
          puzzleRef: source.slug,
          prompt: '',
          expected: '',
          computed: null,
          message: 'Bank slug missing from fixtures',
        });
        continue;
      }
      const answerIssue = verifyBankPuzzle(nodeId, row);
      if (answerIssue) {
        issues.push(answerIssue);
        continue;
      }
      const semanticIssue = verifyBankSemantics(nodeId, row);
      if (semanticIssue) issues.push(semanticIssue);
    }
  }

  return issues;
}
