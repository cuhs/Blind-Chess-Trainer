import type { Square } from '@mindboard/shared';
import type { GeneratedTrainingPuzzle } from './types';
import { synthesizeSingleMove } from '../position-synthesis/opening-lines';
import { puzzleId } from '../seed';

function buildMoveUpdatePuzzle(
  generatorId: string,
  kind: 'landing' | 'vacated' | 'capture',
  seed: string,
): GeneratedTrainingPuzzle {
  const line = synthesizeSingleMove(
    `${generatorId}:${seed}`,
    kind === 'capture',
  );

  const base = {
    id: puzzleId(generatorId, seed),
    fen: line.fen,
    moves: [line.move],
    narrationScript: line.narration,
    squaresTouched: [line.from, line.to] as Square[],
    showBoard: true,
  };

  if (kind === 'landing') {
    return {
      ...base,
      prompt: 'Where did the piece land?',
      inputPlaceholder: 'e.g. a8',
      answerType: 'square',
      expected: line.to,
      subtitle: 'Hear the move, track where it lands.',
    };
  }

  if (kind === 'vacated') {
    return {
      ...base,
      prompt: 'Which square was vacated?',
      inputPlaceholder: 'e.g. a8',
      answerType: 'square',
      expected: line.from,
      subtitle: 'Hear the move, track the square it left.',
    };
  }

  return {
    ...base,
    prompt: 'Was a piece captured?',
    answerType: 'yes-no',
    expected: line.captured ? 'yes' : 'no',
    subtitle: 'Hear the move, notice if anything was taken.',
  };
}

export function buildMoveUpdateLandingPuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildMoveUpdatePuzzle('move_update_landing', 'landing', seed);
}

export function buildMoveUpdateVacatedPuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildMoveUpdatePuzzle('move_update_vacated', 'vacated', seed);
}

export function buildMoveUpdateCapturePuzzle(seed: string): GeneratedTrainingPuzzle {
  return buildMoveUpdatePuzzle('move_update_capture', 'capture', seed);
}
