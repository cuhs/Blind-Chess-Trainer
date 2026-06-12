import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { validateMove } from '@mindboard/chess-core';
import { getEngineMove, initEngine, disposeEngine } from '@/lib/engine/stockfishWorker';

export const MATCH_START_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const PLAYER_COLOR = 'w' as const;

export type MatchStatus = 'playing' | 'gameover';
export type GameResult = 'win' | 'loss' | 'draw';

function turnFromFen(fen: string): 'w' | 'b' {
  return fen.split(' ')[1] === 'b' ? 'b' : 'w';
}

export function useMatchSession(matchElo: number) {
  const chessRef = useRef(new Chess(MATCH_START_FEN));
  const [fen, setFen] = useState(MATCH_START_FEN);
  const [status, setStatus] = useState<MatchStatus>('playing');
  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [resigned, setResigned] = useState(false);

  const turn = turnFromFen(fen);
  const isPlayerTurn =
    status === 'playing' && turn === PLAYER_COLOR && !isThinking;
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
      setResult(chess.turn() === PLAYER_COLOR ? 'loss' : 'win');
    } else {
      setResult('draw');
    }
    return true;
  }, []);

  const applyEngineMove = useCallback(async () => {
    if (turnFromFen(chessRef.current.fen()) === PLAYER_COLOR) return;

    setIsThinking(true);
    try {
      const san = await getEngineMove(chessRef.current.fen(), matchElo);
      if (!san) return;
      chessRef.current.move(san);
      setLastMove(san);
      syncFen();
      finishIfGameOver();
    } catch {
      setMoveError('Engine failed to respond');
    } finally {
      setIsThinking(false);
    }
  }, [matchElo, syncFen, finishIfGameOver]);

  const submitPlayerMove = useCallback(
    async (input: string): Promise<boolean> => {
      if (!isPlayerTurn) return false;

      const validation = validateMove(chessRef.current.fen(), input);
      if (!validation.ok) {
        setMoveError(
          validation.reason === 'Illegal move'
            ? 'Illegal move — choose a legal move'
            : validation.reason,
        );
        return false;
      }

      setMoveError(null);
      chessRef.current.move(validation.san);
      setLastMove(validation.san);
      syncFen();

      if (finishIfGameOver()) return true;

      await applyEngineMove();
      return true;
    },
    [isPlayerTurn, syncFen, finishIfGameOver, applyEngineMove],
  );

  const resetMatch = useCallback(() => {
    chessRef.current = new Chess(MATCH_START_FEN);
    setFen(MATCH_START_FEN);
    setStatus('playing');
    setIsThinking(false);
    setLastMove(null);
    setResult(null);
    setMoveError(null);
    setResigned(false);
  }, []);

  const resignMatch = useCallback(() => {
    if (status === 'gameover') return;
    setIsThinking(false);
    setResigned(true);
    setStatus('gameover');
    setResult('loss');
    setMoveError(null);
  }, [status]);

  const clearMoveError = useCallback(() => {
    setMoveError(null);
  }, []);

  return {
    fen,
    status,
    turn,
    isPlayerTurn,
    isThinking,
    isGameOver,
    lastMove,
    result,
    moveError,
    resigned,
    submitPlayerMove,
    resetMatch,
    resignMatch,
    clearMoveError,
  };
}
