import { getFogClearedPercent, getClarityPercent, getMasteryCount } from '@mindboard/heatmap';
import { useHeatmapLedger } from './useHeatmapLedger';

export function useFogClearedPercent() {
  const { ledger } = useHeatmapLedger();

  return {
    boardMappedPercent: getFogClearedPercent(ledger),
    clarityPercent: getClarityPercent(ledger),
    masteryCount: getMasteryCount(ledger),
  };
}
