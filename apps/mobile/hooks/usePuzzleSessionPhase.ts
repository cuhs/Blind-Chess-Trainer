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
  /** When false, no board is shown and peek is disabled. */
  showBoard?: boolean;
  /** Hide spoken "check" / "checkmate" so yes-no check puzzles stay fair. */
  narrationStripCheck?: boolean;
  /** Custom TTS line when SAN would leak the answer. */
  narrationScript?: string;
}

/**
 * Sequences the prepare phases for a puzzle:
 *
 * - showBoard false     → answer immediately (blank screen, no peek)
 * - No moves            → memorize board (5s) → answer
 * - Moves + start FEN   → narrate (blank screen) → answer
 * - Moves + custom FEN  → memorize board (5s) → narrate (blank) → answer
 */
export function usePuzzleSessionPhase(
  resetKey: string,
  {
    fen,
    moves = [],
    showBoard = true,
    narrationStripCheck = false,
    narrationScript,
  }: PuzzleSessionInput,
) {
  const hasNarration = moves.length > 0 || Boolean(narrationScript?.trim());
  const memorizeBoard = showBoard && (!hasNarration || !isStandardStartFen(fen));
  const memorize = useMemorizePhase(resetKey, undefined, memorizeBoard);
  const memorizeDone = !memorizeBoard || memorize.phase !== 'memorize';
  const narration = useStoryNarration(
    moves,
    hasNarration && memorizeDone,
    resetKey,
    { fen, stripCheck: narrationStripCheck },
    narrationScript,
  );
  const [storyPeekVisible, setStoryPeekVisible] = useState(false);

  const phase: PuzzleSessionPhase = hasNarration
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

  const peekVisible = hasNarration ? storyPeekVisible : memorize.peekVisible;
  const triggerPeek = hasNarration ? triggerStoryPeek : memorize.triggerPeek;
  const markSuccess = hasNarration ? narration.markSuccess : memorize.markSuccess;

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
