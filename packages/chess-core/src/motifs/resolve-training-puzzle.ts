import type { AnswerType, Square } from '@mindboard/shared';
import { applyMoves } from '../validate';
import { collectMotifs } from './analyze-position';
import { buildPuzzleFromMotif } from './questions';
import { rankMotifs } from './sorter';

export interface TrainingPuzzleInput {
  id: string;
  fen: string;
  moves: string[];
  prompt: string;
  answerType: AnswerType;
  expected: string;
  squaresTouched: Square[];
  showBoard?: boolean;
}

export interface ResolvedTrainingPuzzle extends TrainingPuzzleInput {
  displayFen: string;
  engineBacked: boolean;
}

function displayFenFor(puzzle: TrainingPuzzleInput): string {
  return puzzle.moves.length > 0
    ? applyMoves(puzzle.fen, puzzle.moves)
    : puzzle.fen;
}

function previousFenFor(puzzle: TrainingPuzzleInput): string | undefined {
  if (puzzle.moves.length === 0) return undefined;
  if (puzzle.moves.length === 1) return puzzle.fen;
  return applyMoves(puzzle.fen, puzzle.moves.slice(0, -1));
}

export function resolveTrainingPuzzle(
  puzzle: TrainingPuzzleInput,
): ResolvedTrainingPuzzle {
  const displayFen = displayFenFor(puzzle);

  if (puzzle.answerType !== 'square') {
    return { ...puzzle, displayFen, engineBacked: false };
  }

  const matching = collectMotifs(displayFen, previousFenFor(puzzle)).filter(
    (motif) => buildPuzzleFromMotif(motif).expected === puzzle.expected,
  );
  const motif = rankMotifs(matching);
  if (!motif) {
    return { ...puzzle, displayFen, engineBacked: false };
  }

  const draft = buildPuzzleFromMotif(motif);

  return {
    ...puzzle,
    displayFen,
    engineBacked: true,
    prompt: draft.prompt,
    expected: draft.expected,
    answerType: draft.answerType,
    squaresTouched: draft.squaresTouched,
  };
}
