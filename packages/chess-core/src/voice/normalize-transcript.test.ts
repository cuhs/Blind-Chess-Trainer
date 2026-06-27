import { describe, expect, it } from 'vitest';
import { normalizeTranscriptForMatch } from './normalize-transcript';

describe('normalizeTranscriptForMatch', () => {
  it('should map common STT file homophones', () => {
    expect(normalizeTranscriptForMatch('knight to sea three')).toBe(
      'knight c three',
    );
    expect(normalizeTranscriptForMatch('bee file')).toBe('b file');
  });

  it('should map piece and rank garbles', () => {
    expect(normalizeTranscriptForMatch('rookie takes four')).toBe('rook four');
    expect(normalizeTranscriptForMatch('night takes half six')).toBe(
      'knight h six',
    );
    expect(normalizeTranscriptForMatch('bish up to a five')).toBe(
      'bishop a five',
    );
  });
});
