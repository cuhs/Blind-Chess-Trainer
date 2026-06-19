import type { MatchRecord } from '@mindboard/shared';

export function formatMatchResult(record: MatchRecord): string {
  if (record.resigned) return 'Resigned';
  if (record.result === 'win') return 'Win';
  if (record.result === 'loss') return 'Loss';
  return 'Draw';
}

export function formatMatchDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatPlayerColor(color: MatchRecord['playerColor']): string {
  return color === 'w' ? 'White' : 'Black';
}
