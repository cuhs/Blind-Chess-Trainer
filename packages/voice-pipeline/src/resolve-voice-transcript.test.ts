import { describe, expect, it } from 'vitest';
import {
  minAutoSubmitConfidence,
  resolveVoiceTranscript,
} from './resolve-voice-transcript';

const START =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const RE4 = '4k3/8/8/4p3/8/4R3/8/4K3 w - - 0 1';
const AMBIGUOUS_KNIGHTS = 'k7/8/8/8/8/5N2/8/1N4K1 w - - 0 1';

describe('resolveVoiceTranscript', () => {
  it('should prefer a fast-path alternative that parses to a legal move', () => {
    const result = resolveVoiceTranscript(['e two', 'e4', 'bee four'], START);
    expect(result.matched).toBe(true);
    expect(result.san).toBe('e4');
    expect(result.confidence).toBe(1);
    expect(result.displayText).toBe('e4');
  });

  it('should recover garbled STT via fuzzy legal-move matching', () => {
    const result = resolveVoiceTranscript(['rookie four'], RE4);
    expect(result.matched).toBe(true);
    expect(result.san).toBe('Re4');
    expect(result.displayText).toBe('Re4');
  });

  it('should pick the best-scoring alternative', () => {
    const result = resolveVoiceTranscript(['hello world', 'e4'], START);
    expect(result.matched).toBe(true);
    expect(result.san).toBe('e4');
  });

  it('should pass disambiguation candidates to the fuzzy resolver', () => {
    const result = resolveVoiceTranscript(['bee file'], AMBIGUOUS_KNIGHTS, {
      candidates: [
        { san: 'Nbd2', label: 'Knight on b1 to d2' },
        { san: 'Nfd2', label: 'Knight on f1 to d2' },
      ],
    });
    expect(result.matched).toBe(true);
    expect(result.san).toBe('Nbd2');
  });

  it('should fall back to cleaned text on low confidence', () => {
    const result = resolveVoiceTranscript(['hello world'], START);
    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.displayText).toBe('hello world');
  });

  it('should not fuzzy-match illegal explicit piece move to a pawn push', () => {
    const result = resolveVoiceTranscript(['rook e four'], START);
    expect(result.matched).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.displayText).toBe('Re4');
    expect(result.submitText).toBe('Re4');
    expect(result.illegal).toBe(true);
  });

  it('should surface fuzzy ties as disambiguation candidates', () => {
    const FEN = '4k3/8/8/8/8/8/8/R4R1K w - - 0 1';
    const result = resolveVoiceTranscript(['rook e one'], FEN);
    expect(result.matched).toBe(false);
    expect(result.ambiguous).toBe(true);
    expect(result.prompt).toBe('Which rook?');
    expect(result.candidates?.map((c) => c.san).sort()).toEqual(['Rae1+', 'Rfe1+']);
  });
});

describe('minAutoSubmitConfidence', () => {
  it('should require 90% for very short transcripts', () => {
    expect(minAutoSubmitConfidence(6)).toBe(0.9);
  });

  it('should require 80% for medium transcripts', () => {
    expect(minAutoSubmitConfidence(10)).toBe(0.8);
  });

  it('should use the baseline gate for longer phrases', () => {
    expect(minAutoSubmitConfidence(20)).toBe(0.72);
  });
});
