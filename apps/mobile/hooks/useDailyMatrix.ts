import { useGuestStore } from '@/stores/guestStore';

const DEFAULT_PUZZLE_COUNT = 3;

export function useDailyMatrix() {
  const peekEvents = useGuestStore((s) => s.peekEvents);

  const puzzleCount = DEFAULT_PUZZLE_COUNT;
  const peekGeneratedCount = peekEvents.length;

  const loopBadge =
    peekGeneratedCount > 0
      ? `Includes ${peekGeneratedCount} puzzle${peekGeneratedCount > 1 ? 's' : ''} generated from yesterday's match`
      : null;

  return { puzzleCount, loopBadge };
}
