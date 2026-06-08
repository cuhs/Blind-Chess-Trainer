import { useCallback, useEffect, useState } from 'react';

export type MemorizePhase = 'memorize' | 'answering' | 'success';

const DEFAULT_MEMORIZE_MS = 5000;
const PEEK_MS = 2000;

export function useMemorizePhase(resetKey = 'default', memorizeMs = DEFAULT_MEMORIZE_MS) {
  const [phase, setPhase] = useState<MemorizePhase>('memorize');
  const [peekVisible, setPeekVisible] = useState(false);

  useEffect(() => {
    setPhase('memorize');
    setPeekVisible(false);

    const timeout = setTimeout(() => {
      setPhase('answering');
    }, memorizeMs);

    return () => clearTimeout(timeout);
  }, [memorizeMs, resetKey]);

  const markSuccess = useCallback(() => setPhase('success'), []);

  const triggerPeek = useCallback(() => {
    setPeekVisible(true);
    setTimeout(() => setPeekVisible(false), PEEK_MS);
  }, []);

  const isMemorizing = phase === 'memorize';
  const canAnswer = phase === 'answering';

  return {
    phase,
    peekVisible,
    isMemorizing,
    canAnswer,
    markSuccess,
    triggerPeek,
  };
}
