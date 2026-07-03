import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { resolveMove } from '../match-move';
import {
  AMBIGUITY_MARGIN,
  MAX_DISTANCE_RATIO,
  matchConfidence,
  minConfidenceForTranscript,
  resolveNoisyTranscript,
  SHORT_PHRASE_MAX_DISTANCE_RATIO,
  SHORT_TRANSCRIPT_MIN_CONFIDENCE,
} from './resolver';

const START =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const RE4 = '4k3/8/8/4p3/8/4R3/8/4K3 w - - 0 1';
const NXH6 = '4k3/8/8/7p/6N1/8/8/4K3 w - - 0 1';
const BA5 = '4k3/8/8/8/1B6/8/8/4K3 w - - 0 1';
const CASTLE = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
const AMBIGUOUS_KNIGHTS = 'k7/8/8/8/8/5N2/8/1N4K1 w - - 0 1';
const AMBIGUOUS_ROOKS_E1 = '4k3/8/8/8/8/8/8/R4R1K w - - 0 1';

describe('resolveNoisyTranscript', () => {
  it.each([
    { fen: RE4, transcript: 'rookie four', expectedSan: 'Re4' },
    { fen: START, transcript: 'knight to sea three', expectedSan: 'Nc3' },
    { fen: NXH6, transcript: 'night takes half six', expectedSan: 'Nh6' },
    { fen: BA5, transcript: 'bish up to a five', expectedSan: 'Ba5' },
    { fen: CASTLE, transcript: 'castle king side', expectedSan: 'O-O' },
    { fen: START, transcript: 'e four', expectedSan: 'e4' },
    { fen: START, transcript: 'Nf3', expectedSan: 'Nf3' },
  ])(
    'should match garbled transcript "$transcript" to $expectedSan',
    ({ fen, transcript, expectedSan }) => {
      expect(new Chess(fen).moves()).toContain(expectedSan);
      const result = resolveNoisyTranscript(transcript, fen);
      expect(result.matched).toBe(true);
      if (!result.matched) return;
      expect(result.san).toBe(expectedSan);
      expect(resolveMove(fen, result.san).ok).toBe(true);
    },
  );

  it('should match disambiguation candidate phrases only', () => {
    const result = resolveNoisyTranscript('bee file', AMBIGUOUS_KNIGHTS, {
      candidates: [
        { san: 'Nbd2', label: 'Knight on b1 to d2' },
        { san: 'Nfd2', label: 'Knight on f1 to d2' },
      ],
    });
    expect(result.matched).toBe(true);
    if (!result.matched) return;
    expect(result.san).toBe('Nbd2');
  });

  it.each([
    { transcript: 'hello world', fen: START },
    { transcript: '', fen: START },
    { transcript: '   ', fen: START },
    {
      transcript: 'the weather is nice today and chess is fun',
      fen: START,
    },
  ])('should reject unrelated transcript "$transcript"', ({ transcript, fen }) => {
    expect(resolveNoisyTranscript(transcript, fen)).toEqual({ matched: false });
  });

  it('should return ambiguous candidates when tied rooks match the same score', () => {
    expect(new Chess(AMBIGUOUS_ROOKS_E1).moves()).toEqual(
      expect.arrayContaining(['Rae1+', 'Rfe1+']),
    );
    const result = resolveNoisyTranscript('rook e one', AMBIGUOUS_ROOKS_E1);
    expect(result.matched).toBe(false);
    if (result.matched || !('ambiguous' in result) || !result.ambiguous) {
      throw new Error(`expected ambiguous result, got ${JSON.stringify(result)}`);
    }
    expect(result.prompt).toBe('Which rook?');
    expect(result.candidates.map((c) => c.san).sort()).toEqual(['Rae1+', 'Rfe1+']);
  });

  it('should return ambiguous candidates when tied knights match the same score', () => {
    const result = resolveNoisyTranscript('knight d2', AMBIGUOUS_KNIGHTS);
    expect(result.matched).toBe(false);
    if (result.matched || !('ambiguous' in result) || !result.ambiguous) {
      throw new Error('expected ambiguous result');
    }
    expect(result.prompt).toBe('Which knight?');
    expect(result.candidates.map((c) => c.san).sort()).toEqual(['Nbd2', 'Nfd2']);
  });

  it('should expose threshold constants', () => {
    expect(MAX_DISTANCE_RATIO).toBe(0.4);
    expect(SHORT_PHRASE_MAX_DISTANCE_RATIO).toBe(0.25);
    expect(AMBIGUITY_MARGIN).toBe(0.05);
  });

  it('matchConfidence uses percentage of maxLen, not flat edit count', () => {
    const tight = matchConfidence('abc', 'abc');
    const loose = matchConfidence('abc', 'ab');
    expect(tight.confidence).toBe(1);
    expect(loose.confidence).toBe(1 - 1 / 3);
    expect(loose.distance).toBe(1);
  });

  it('should require higher confidence for short transcripts', () => {
    expect(minConfidenceForTranscript(6)).toBe(SHORT_TRANSCRIPT_MIN_CONFIDENCE);
    expect(minConfidenceForTranscript(20)).toBe(1 - MAX_DISTANCE_RATIO);
  });

  it('should reject short premature STT fragments below the length bar', () => {
    expect(resolveNoisyTranscript('night two', AMBIGUOUS_KNIGHTS)).toEqual({
      matched: false,
    });
  });

  it('should produce lower confidence for noisier matches', () => {
    const clean = resolveNoisyTranscript('e4', START);
    const noisy = resolveNoisyTranscript('e four', START);
    expect(clean.matched).toBe(true);
    expect(noisy.matched).toBe(true);
    if (!clean.matched || !noisy.matched) return;
    expect(noisy.confidence).toBeLessThanOrEqual(clean.confidence);
  });

  describe('short-string collisions (ratio-based, not raw edit count)', () => {
    it.each([
      { transcript: 'ate three', reason: 'e3 and a3 tie on ratio' },
      { transcript: 'eight three', reason: 'multiple knights tie on ratio' },
      { transcript: 'hey three', reason: 'e3 and h3 tie on ratio' },
    ])('should reject ambiguous "$transcript" ($reason)', ({ transcript }) => {
      const result = resolveNoisyTranscript(transcript, START);
      expect(result.matched).toBe(false);
      if ('ambiguous' in result) {
        expect(result.ambiguous).toBeFalsy();
      }
    });

    it.each([
      { transcript: 'e 3', expectedSan: 'e3' },
      { transcript: 'a 3', expectedSan: 'a3' },
      { transcript: 'e three', expectedSan: 'e3' },
    ])(
      'should accept unambiguous short square "$transcript" → $expectedSan',
      ({ transcript, expectedSan }) => {
        const result = resolveNoisyTranscript(transcript, START);
        expect(result.matched).toBe(true);
        if (!result.matched) return;
        expect(result.san).toBe(expectedSan);
        expect(result.confidence).toBe(1);
      },
    );

    it('should score confidence as 1 - (edits / maxLen), not raw edit count', () => {
      const result = resolveNoisyTranscript('e four', START);
      expect(result.matched).toBe(true);
      if (!result.matched) return;
      const maxLen = Math.max('e four'.length, 'e four'.length);
      expect(result.confidence).toBeCloseTo(1 - result.distance / maxLen, 5);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should reject fuzzy match to short square when ratio exceeds strict cap', () => {
      expect(resolveNoisyTranscript('ate 3', START)).toEqual({ matched: false });
    });

    it('should not match pawn move when transcript names rook (illegal Re4 at start)', () => {
      expect(resolveNoisyTranscript('rook e four', START)).toEqual({
        matched: false,
      });
      expect(resolveNoisyTranscript('rook to e four', START)).toEqual({
        matched: false,
      });
    });
  });
});
