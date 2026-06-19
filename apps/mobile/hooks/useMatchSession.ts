import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { resolveMove, type MoveCandidate } from '@mindboard/chess-core';
import { getEngineMove, initEngine, disposeEngine } from '@/lib/engine/stockfishWorker';

import {
  MATCH_START_FEN,
  type MatchPlayerColor,
} from '@/lib/matchConstants';

export { MATCH_START_FEN };

export type MatchStatus = 'playing' | 'gameover';
export type GameResult = 'win' | 'loss' | 'draw';

export type MoveDisambiguationState = {
  prompt: string;
  candidates: MoveCandidate[];
};

function turnFromFen(fen: string): 'w' | 'b' {
  return fen.split(' ')[1] === 'b' ? 'b' : 'w';
}

export function useMatchSession(matchElo: number, playerColor: MatchPlayerColor) {
  const chessRef = useRef(new Chess(MATCH_START_FEN));
  const [fen, setFen] = useState(MATCH_START_FEN);
  const [status, setStatus] = useState<MatchStatus>('playing');
  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [lastEngineMove, setLastEngineMove] = useState<string | null>(null);
  const [lastPlayerMove, setLastPlayerMove] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [resigned, setResigned] = useState(false);
  const [disambiguation, setDisambiguation] =
    useState<MoveDisambiguationState | null>(null);
  const openingMoveSentRef = useRef(false);

  const turn = turnFromFen(fen);
  const isPlayerTurn =
    status === 'playing' && turn === playerColor && !isThinking;
  const isGameOver = status === 'gameover';

  useEffect(() => {
    void initEngine({ elo: matchElo });
    return () => {
      void disposeEngine();
    };
  }, [matchElo]);

  const syncFen = useCallback(() => {
    setFen(chessRef.current.fen());
  }, []);

  const finishIfGameOver = useCallback((): boolean => {
    const chess = chessRef.current;
    if (!chess.isGameOver()) return false;

    setStatus('gameover');
    if (chess.isCheckmate()) {
      setResult(chess.turn() === playerColor ? 'loss' : 'win');
    } else {
      setResult('draw');
    }
    return true;
  }, [playerColor]);

  const applyEngineMove = useCallback(async () => {
    if (turnFromFen(chessRef.current.fen()) === playerColor) return;

    setIsThinking(true);
    try {
      const san = await getEngineMove(chessRef.current.fen(), matchElo);
      if (!san) return;
      chessRef.current.move(san);
      setLastMove(san);
      setLastEngineMove(san);
      syncFen();
      finishIfGameOver();
    } catch {
      setMoveError('Engine failed to respond');
    } finally {
      setIsThinking(false);
    }
  }, [matchElo, playerColor, syncFen, finishIfGameOver]);

  useEffect(() => {
    if (openingMoveSentRef.current) return;
    if (playerColor !== 'b') return;
    if (status !== 'playing') return;
    if (turnFromFen(chessRef.current.fen()) !== 'w') return;

    openingMoveSentRef.current = true;
    void applyEngineMove();
  }, [playerColor, status, applyEngineMove]);

  const applySan = useCallback(
    async (san: string): Promise<boolean> => {
      setMoveError(null);
      setDisambiguation(null);
      chessRef.current.move(san);
      setLastMove(san);
      setLastPlayerMove(san);
      syncFen();

      if (finishIfGameOver()) return true;

      await applyEngineMove();
      return true;
    },
    [syncFen, finishIfGameOver, applyEngineMove],
  );

  const submitPlayerMove = useCallback(
    async (input: string): Promise<boolean> => {
      if (!isPlayerTurn) return false;

      const resolution = resolveMove(chessRef.current.fen(), input);
      if (resolution.ok) {
        return applySan(resolution.san);
      }

      if ('ambiguous' in resolution && resolution.ambiguous) {
        setMoveError(null);
        setDisambiguation({
          prompt: resolution.prompt,
          candidates: resolution.candidates,
        });
        return false;
      }

      setDisambiguation(null);
      setMoveError(
        resolution.reason === 'Illegal move'
          ? 'Illegal move — choose a legal move'
          : resolution.reason,
      );
      return false;
    },
    [isPlayerTurn, applySan],
  );

  const chooseDisambiguation = useCallback(
    async (san: string): Promise<boolean> => {
      if (!isPlayerTurn || !disambiguation) return false;
      return applySan(san);
    },
    [isPlayerTurn, disambiguation, applySan],
  );

  const cancelDisambiguation = useCallback(() => {
    setDisambiguation(null);
    setMoveError(null);
  }, []);

  const resetMatch = useCallback(() => {
    chessRef.current = new Chess(MATCH_START_FEN);
    openingMoveSentRef.current = false;
    setFen(MATCH_START_FEN);
    setStatus('playing');
    setIsThinking(false);
    setLastMove(null);
    setLastEngineMove(null);
    setLastPlayerMove(null);
    setResult(null);
    setMoveError(null);
    setResigned(false);
    setDisambiguation(null);
  }, []);

  const resignMatch = useCallback(() => {
    if (status === 'gameover') return;
    setIsThinking(false);
    setResigned(true);
    setStatus('gameover');
    setResult('loss');
    setMoveError(null);
    setDisambiguation(null);
  }, [status]);

  const clearMoveError = useCallback(() => {
    setMoveError(null);
  }, []);

  return {
    fen,
    status,
    turn,
    playerColor,
    isPlayerTurn,
    isThinking,
    isGameOver,
    lastMove,
    lastEngineMove,
    lastPlayerMove,
    result,
    moveError,
    resigned,
    disambiguation,
    submitPlayerMove,
    chooseDisambiguation,
    cancelDisambiguation,
    resetMatch,
    resignMatch,
    clearMoveError,
  };
}
