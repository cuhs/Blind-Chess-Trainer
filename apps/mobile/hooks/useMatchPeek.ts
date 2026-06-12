import { useCallback } from 'react';
import type { Square } from '@mindboard/shared';
import { useBlindfoldPeek } from '@/hooks/useBlindfoldPeek';
import { useGuestStore } from '@/stores/guestStore';

const PEEK_SQUARE: Square = 'e4';

export function useMatchPeek(fen: string) {
  const { peekVisible, triggerPeek } = useBlindfoldPeek();
  const addPeekEvent = useGuestStore((s) => s.addPeekEvent);
  const recordHeatmapInteractions = useGuestStore(
    (s) => s.recordHeatmapInteractions,
  );

  const onPeek = useCallback(() => {
    const timestamp = new Date().toISOString();
    addPeekEvent({ fen, square: PEEK_SQUARE, timestamp });
    recordHeatmapInteractions([PEEK_SQUARE], {
      isSuccess: false,
      interactionType: 'match_peek',
    });
    triggerPeek();
  }, [fen, addPeekEvent, recordHeatmapInteractions, triggerPeek]);

  return { peekVisible, onPeek };
}
