import { colors } from '@/theme';

export function getVisibleSquareColor(light: boolean): string {
  return light ? colors.surfaceContainerLow : colors.outlineVariant;
}

export function getInvisibleSquareColor(light: boolean): string {
  return light ? colors.recessedBg : colors.fogStone;
}
