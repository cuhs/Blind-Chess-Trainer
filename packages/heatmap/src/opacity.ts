import { ALL_SQUARES, type Square } from '@mindboard/shared';
import { getThreshold } from './thresholds';

export function getFogOpacity(square: Square, interactions: number): number {
  const threshold = getThreshold(square);
  const opacity = 1 - interactions / threshold;
  return Math.max(0, Math.min(1, opacity));
}

export function isSquareCleared(square: Square, interactions: number): boolean {
  return interactions >= getThreshold(square);
}

export function getFogClearedPercent(
  ledger: Partial<Record<Square, number>>,
): number {
  let cleared = 0;
  for (const square of ALL_SQUARES) {
    const interactions = ledger[square] ?? 0;
    if (isSquareCleared(square, interactions)) {
      cleared += 1;
    }
  }
  return Math.round((cleared / ALL_SQUARES.length) * 100);
}

export function getClarityPercent(
  ledger: Partial<Record<Square, number>>,
): number {
  let totalOpacity = 0;
  for (const square of ALL_SQUARES) {
    const interactions = ledger[square] ?? 0;
    totalOpacity += 1 - getFogOpacity(square, interactions);
  }
  return Math.round((totalOpacity / ALL_SQUARES.length) * 100);
}

export function getMasteryCount(
  ledger: Partial<Record<Square, number>>,
): number {
  return ALL_SQUARES.filter((square) =>
    isSquareCleared(square, ledger[square] ?? 0),
  ).length;
}
