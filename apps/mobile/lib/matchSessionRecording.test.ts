import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { createMatchRecorder, resolveMove } from '@mindboard/chess-core';
import type { Square } from '@mindboard/shared';

const MATCH_START_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function turnFromFen(fen: string): 'w' | 'b' {
  return fen.split(' ')[1] === 'b' ? 'b' : 'w';
}

/**
 * Exercises the same recording sequence useMatchSession performs, without React.
 */
describe('match session recording flow', () => {
  it('captures a full game with peeks, illegal input, disambiguation, and resign', () => {
    const chess = new Chess(MATCH_START_FEN);
    const recorder = createMatchRecorder({
      id: 'integration-1',
      startedAt: '2026-06-19T10:00:00.000Z',
      startFen: MATCH_START_FEN,
      playerColor: 'w',
      engineElo: 800,
    });

    const recordMove = (san: string) => {
      const color = turnFromFen(chess.fen());
      chess.move(san);
      recorder.recordMove(san, color, chess.fen(), `move-${san}`);
    };

    const submitPlayerMove = (input: string) => {
      const fen = chess.fen();
      const resolution = resolveMove(fen, input);
      if (resolution.ok) {
        recordMove(resolution.san);
        return 'applied' as const;
      }
      if ('ambiguous' in resolution && resolution.ambiguous) {
        recorder.recordDisambiguation(
          input,
          resolution.prompt,
          resolution.candidates,
          fen,
          `ambig-${input}`,
        );
        return 'ambiguous' as const;
      }
      recorder.recordIllegalAttempt(
        input,
        resolution.reason,
        fen,
        `illegal-${input}`,
      );
      return 'illegal' as const;
    };

    const recordPeek = (square: Square) => {
      recorder.recordPeek(chess.fen(), square, `peek-${square}`);
    };

    expect(submitPlayerMove('e4')).toBe('applied');
    recordPeek('e4');
    expect(submitPlayerMove('Qh9')).toBe('illegal');
    recordMove('e5');

    const ambiguousFen = 'k7/8/8/8/8/5N2/8/1N4K1 w - - 0 1';
    chess.load(ambiguousFen);
    expect(submitPlayerMove('Nd2')).toBe('ambiguous');
    recorder.recordDisambiguationCancelled(ambiguousFen, 'cancel');
    recordMove('Nbd2');

    recorder.recordResign(chess.fen(), 'resign');
    const record = recorder.finalize({
      result: 'loss',
      resigned: true,
      finalFen: chess.fen(),
      finishedAt: '2026-06-19T10:20:00.000Z',
    });

    expect(record.events.map((event) => event.kind)).toEqual([
      'move',
      'peek',
      'illegal_attempt',
      'move',
      'disambiguation',
      'disambiguation_cancelled',
      'move',
      'resign',
    ]);
    expect(record.resigned).toBe(true);
    expect(record.result).toBe('loss');
    expect(record.events.filter((event) => event.kind === 'move')).toHaveLength(3);
  });

  it('records repeated peeks at the same position for replay', () => {
    const chess = new Chess(MATCH_START_FEN);
    const recorder = createMatchRecorder({
      id: 'integration-2',
      startedAt: '2026-06-19T10:00:00.000Z',
      startFen: MATCH_START_FEN,
      playerColor: 'w',
      engineElo: 1200,
    });

    recorder.recordPeek(chess.fen(), 'e4', 'peek-1');
    recorder.recordPeek(chess.fen(), 'e4', 'peek-2');

    const record = recorder.finalize({
      result: 'draw',
      resigned: false,
      finalFen: chess.fen(),
      finishedAt: '2026-06-19T10:05:00.000Z',
    });

    expect(record.events.filter((event) => event.kind === 'peek')).toHaveLength(2);
  });
});
