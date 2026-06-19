import { useGuestStore } from '@/stores/guestStore';
import { sortMatchHistoryNewestFirst } from '@mindboard/chess-core';

export function useMatchHistory() {
  const hasHydrated = useGuestStore((s) => s._hasHydrated);
  const matchHistory = useGuestStore((s) => s.matchHistory);

  return {
    hasHydrated,
    matches: sortMatchHistoryNewestFirst(matchHistory),
    getMatchById: (id: string) => matchHistory.find((record) => record.id === id),
  };
}
