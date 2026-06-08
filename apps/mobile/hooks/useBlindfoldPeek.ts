import { useState, useCallback } from 'react';

const PEEK_MS = 2000;

export function useBlindfoldPeek() {
  const [peekVisible, setPeekVisible] = useState(false);

  const triggerPeek = useCallback(() => {
    setPeekVisible(true);
    setTimeout(() => setPeekVisible(false), PEEK_MS);
  }, []);

  return { peekVisible, triggerPeek };
}
