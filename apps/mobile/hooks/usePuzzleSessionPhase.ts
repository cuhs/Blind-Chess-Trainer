import { useCallback, useState } from 'react';
import { useMemorizePhase } from './useMemorizePhase';
import { useStoryNarration } from './useStoryNarration';
import { isStandardStartFen } from '@/data/puzzleFen';

export type PuzzleSessionPhase = 'memorize' | 'narrating' | 'answering' | 'success';

const PEEK_MS = 2000;

interface PuzzleSessionInput {
  /** Base position BEFORE moves[] — what the board renders on memorize/peek. */
  fen: string;
  moves?: string[];
}

/**
 * Sequences the prepare phases for a puzzle:
 *
 * - No moves            → memorize board (5s) → answer
 * - Moves + start FEN   → narrate (blank screen) → answer
 * - Moves + custom FEN  → memorize board (5s) → narrate (blank) → answer
 *
 * Narrated moves only make sense if the user knows the base position, so
 * custom positions are always shown before the story is read aloud.
 */
export function usePuzzleSessionPhase(
  resetKey: string,
  { fen, moves = [] }: PuzzleSessionInput,
) {
  const hasMoves = moves.length > 0;
  const memorizeBoard = !hasMoves || !isStandardStartFen(fen);
  const memorize = useMemorizePhase(resetKey, undefined, memorizeBoard);
  const memorizeDone = !memorizeBoard || memorize.phase !== 'memorize';
  const narration = useStoryNarration(moves, hasMoves && memorizeDone, resetKey);
  const [storyPeekVisible, setStoryPeekVisible] = useState(false);

  const phase: PuzzleSessionPhase = hasMoves
    ? narration.phase === 'success'
      ? 'success'
      : memorizeBoard && memorize.phase === 'memorize'
        ? 'memorize'
        : narration.phase === 'prompting'
          ? 'answering'
          : 'narrating'
    : memorize.phase === 'success'
      ? 'success'
      : memorize.phase === 'answering'
        ? 'answering'
        : 'memorize';

  const triggerStoryPeek = useCallback(() => {
    setStoryPeekVisible(true);
    setTimeout(() => setStoryPeekVisible(false), PEEK_MS);
  }, []);

  const peekVisible = hasMoves ? storyPeekVisible : memorize.peekVisible;
  const triggerPeek = hasMoves ? triggerStoryPeek : memorize.triggerPeek;
  const markSuccess = hasMoves ? narration.markSuccess : memorize.markSuccess;

  return {
    phase,
    isMemorizing: phase === 'memorize',
    isListening: phase === 'narrating',
    canAnswer: phase === 'answering',
    peekVisible,
    markSuccess,
    triggerPeek,
  };
}
