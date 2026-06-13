import { useGuestStore } from '@/stores/guestStore';
import { useDailySession } from './useDailySession';

export function useDailyMatrix() {
  const peekEvents = useGuestStore((s) => s.peekEvents);
  const { puzzleCount, isCompletedToday } = useDailySession();

  const peekGeneratedCount = peekEvents.length;

  const loopBadge =
    peekGeneratedCount > 0 ? 'Includes puzzles from your matches' : null;

  return { puzzleCount, loopBadge, isCompletedToday };
}
