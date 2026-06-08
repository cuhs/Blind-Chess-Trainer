import { useEffect } from 'react';
import { useGuestStore } from '@/stores/guestStore';

export function useGuestSession() {
  const isReady = useGuestStore((s) => s._hasHydrated);

  useEffect(() => {
    const finishHydration = () => {
      useGuestStore.getState().setHasHydrated(true);
    };

    if (useGuestStore.persist.hasHydrated()) {
      finishHydration();
      return;
    }

    return useGuestStore.persist.onFinishHydration(finishHydration);
  }, []);

  return { isReady, hydrate: () => {} };
}
