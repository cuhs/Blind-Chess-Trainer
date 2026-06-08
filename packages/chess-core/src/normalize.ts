import { isSquare, type Square } from '@mindboard/shared';

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export function normalizeSquare(input: string): Result<Square, string> {
  const trimmed = input.trim().toLowerCase();
  if (isSquare(trimmed)) {
    return { ok: true, value: trimmed };
  }
  return { ok: false, error: 'Invalid square notation' };
}

export function normalizeYesNo(input: string): Result<'yes' | 'no', string> {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === 'yes' || trimmed === 'y') {
    return { ok: true, value: 'yes' };
  }
  if (trimmed === 'no' || trimmed === 'n') {
    return { ok: true, value: 'no' };
  }
  return { ok: false, error: 'Answer must be Yes or No' };
}
