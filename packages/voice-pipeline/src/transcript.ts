/** Strip trailing punctuation STT often adds to chess move phrases. */
export function prepareMoveTranscript(raw: string): string {
  return raw.trim().replace(/[.,!?;:]+$/g, '').trim();
}
