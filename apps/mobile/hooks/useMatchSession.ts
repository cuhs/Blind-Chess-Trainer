import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import {
  createMatchRecorder,
  resolveDisambiguationVoice,
  resolveMove,
  type MatchRecorder,
  type MoveCandidate,
} from '@mindboard/chess-core';
import type { MatchRecord, Square } from '@mindboard/shared';
import { getEngineMove, initEngine, disposeEngine } from '@/lib/engine/stockfishWorker';
import { useGuestStore } from '@/stores/guestStore';

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

function createRecorderId(): string {
  return `match-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createSessionRecorder(
  matchElo: number,
  playerColor: MatchPlayerColor,
): MatchRecorder {
  return createMatchRecorder({
    id: createRecorderId(),
    startedAt: new Date().toISOString(),
    startFen: MATCH_START_FEN,
    playerColor,
    engineElo: matchElo,
  });
}

export function useMatchSession(matchElo: number, playerColor: MatchPlayerColor) {
  const chessRef = useRef(new Chess(MATCH_START_FEN));
  const recorderRef = useRef<MatchRecorder>(
    createSessionRecorder(matchElo, playerColor),
  );
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
  const [completedMatchRecord, setCompletedMatchRecord] =
    useState<MatchRecord | null>(null);
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

  const finalizeMatch = useCallback(
    (
      nextResult: GameResult,
      nextResigned: boolean,
      options?: { recordResign?: boolean },
    ) => {
      if (recorderRef.current.isFinalized()) return;

      const timestamp = new Date().toISOString();
      if (options?.recordResign) {
        recorderRef.current.recordResign(chessRef.current.fen(), timestamp);
      }

      const record = recorderRef.current.finalize({
        result: nextResult,
        resigned: nextResigned,
        finalFen: chessRef.current.fen(),
        finishedAt: timestamp,
      });
      setCompletedMatchRecord(record);
      useGuestStore.getState().addMatchRecord(record);
    },
    [],
  );

  const finishIfGameOver = useCallback((): boolean => {
    const chess = chessRef.current;
    if (!chess.isGameOver()) return false;

    setStatus('gameover');
    const nextResult: GameResult = chess.isCheckmate()
      ? chess.turn() === playerColor
        ? 'loss'
        : 'win'
      : 'draw';
    setResult(nextResult);
    finalizeMatch(nextResult, false);
    return true;
  }, [playerColor, finalizeMatch]);

  const applyEngineMove = useCallback(async () => {
    if (turnFromFen(chessRef.current.fen()) === playerColor) return;

    setIsThinking(true);
    try {
      const san = await getEngineMove(chessRef.current.fen(), matchElo);
      if (!san) return;
      const movingColor = turnFromFen(chessRef.current.fen());
      chessRef.current.move(san);
      recorderRef.current.recordMove(
        san,
        movingColor,
        chessRef.current.fen(),
        new Date().toISOString(),
      );
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
      const movingColor = turnFromFen(chessRef.current.fen());
      chessRef.current.move(san);
      recorderRef.current.recordMove(
        san,
        movingColor,
        chessRef.current.fen(),
        new Date().toISOString(),
      );
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

      const currentFen = chessRef.current.fen();

      if (disambiguation) {
        const voiceResolution = resolveDisambiguationVoice(
          currentFen,
          disambiguation.candidates,
          input,
        );
        if (voiceResolution.ok) {
          return applySan(voiceResolution.san);
        }
      }

      const resolution = resolveMove(currentFen, input);
      if (resolution.ok) {
        return applySan(resolution.san);
      }

      const timestamp = new Date().toISOString();
      if ('ambiguous' in resolution && resolution.ambiguous) {
        setMoveError(null);
        recorderRef.current.recordDisambiguation(
          input,
          resolution.prompt,
          resolution.candidates,
          currentFen,
          timestamp,
        );
        setDisambiguation({
          prompt: resolution.prompt,
          candidates: resolution.candidates,
        });
        return false;
      }

      setDisambiguation(null);
      const reason =
        'reason' in resolution ? resolution.reason : 'Could not parse move';
      recorderRef.current.recordIllegalAttempt(
        input,
        reason,
        currentFen,
        timestamp,
      );
      setMoveError(
        reason === 'Illegal move'
          ? 'Illegal move — choose a legal move'
          : reason,
      );
      return false;
    },
    [isPlayerTurn, disambiguation, applySan],
  );

  const chooseDisambiguation = useCallback(
    async (san: string): Promise<boolean> => {
      if (!isPlayerTurn || !disambiguation) return false;
      return applySan(san);
    },
    [isPlayerTurn, disambiguation, applySan],
  );

  const cancelDisambiguation = useCallback(() => {
    recorderRef.current.recordDisambiguationCancelled(
      chessRef.current.fen(),
      new Date().toISOString(),
    );
    setDisambiguation(null);
    setMoveError(null);
  }, []);

  const resetMatch = useCallback(() => {
    chessRef.current = new Chess(MATCH_START_FEN);
    recorderRef.current = createSessionRecorder(matchElo, playerColor);
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
    setCompletedMatchRecord(null);
  }, [matchElo, playerColor]);

  const resignMatch = useCallback(() => {
    if (status === 'gameover') return;
    setIsThinking(false);
    setResigned(true);
    setStatus('gameover');
    setResult('loss');
    setMoveError(null);
    setDisambiguation(null);
    finalizeMatch('loss', true, { recordResign: true });
  }, [status, finalizeMatch]);

  const clearMoveError = useCallback(() => {
    setMoveError(null);
  }, []);

  const recordPeek = useCallback((square: Square) => {
    if (recorderRef.current.isFinalized()) return;
    recorderRef.current.recordPeek(
      chessRef.current.fen(),
      square,
      new Date().toISOString(),
    );
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
    completedMatchRecord,
    submitPlayerMove,
    chooseDisambiguation,
    cancelDisambiguation,
    resetMatch,
    resignMatch,
    clearMoveError,
    recordPeek,
  };
}
