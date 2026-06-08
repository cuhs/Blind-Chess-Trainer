import { getFogOpacity } from '@mindboard/heatmap';
import type { Square } from '@mindboard/shared';
import { useHeatmapLedger } from './useHeatmapLedger';

export function useFogOpacity() {
  const { getInteractions } = useHeatmapLedger();

  const getOpacity = (square: Square): number =>
    getFogOpacity(square, getInteractions(square));

  return { getOpacity };
}
