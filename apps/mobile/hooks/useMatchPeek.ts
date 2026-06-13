import { useCallback } from 'react';
import type { Square } from '@mindboard/shared';
import { useBlindfoldPeek } from '@/hooks/useBlindfoldPeek';
import { weaknessSquareFromFen } from '@/lib/peekPuzzles';
import { useGuestStore } from '@/stores/guestStore';

const FALLBACK_SQUARE: Square = 'e4';

export function useMatchPeek(fen: string) {
  const { peekVisible, triggerPeek } = useBlindfoldPeek();
  const addPeekEvent = useGuestStore((s) => s.addPeekEvent);
  const recordHeatmapInteractions = useGuestStore(
    (s) => s.recordHeatmapInteractions,
  );

  const onPeek = useCallback(() => {
    const timestamp = new Date().toISOString();
    const square = weaknessSquareFromFen(fen) ?? FALLBACK_SQUARE;
    addPeekEvent({ fen, square, timestamp });
    recordHeatmapInteractions([square], {
      isSuccess: false,
      interactionType: 'match_peek',
    });
    triggerPeek();
  }, [fen, addPeekEvent, recordHeatmapInteractions, triggerPeek]);

  return { peekVisible, onPeek };
}
