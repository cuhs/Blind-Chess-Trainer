import { useMemorizePhase } from './useMemorizePhase';

export type HookPhase = 'memorize' | 'invisible' | 'answering' | 'success';

export function useHookPhase() {
  const memorize = useMemorizePhase();

  return {
    phase: memorize.phase,
    peekVisible: memorize.peekVisible,
    showBoard: memorize.isMemorizing || memorize.peekVisible,
    markSuccess: memorize.markSuccess,
    triggerPeek: memorize.triggerPeek,
  };
}
