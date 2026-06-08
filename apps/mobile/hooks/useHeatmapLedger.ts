import { useGuestStore } from '@/stores/guestStore';
import type { Square } from '@mindboard/shared';

export function useHeatmapLedger() {
  const ledger = useGuestStore((s) => s.heatmapLedger);
  const recordSquareInteraction = useGuestStore((s) => s.recordSquareInteraction);

  const getInteractions = (square: Square): number => ledger[square] ?? 0;

  return { ledger, getInteractions, recordSquareInteraction };
}
