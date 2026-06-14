import { useCallback, useEffect, useRef, useState } from 'react';
import { buildMoveNarrationScript } from './storyNarrationScript';
import { speakNarration, stopNarration } from '@/lib/speech';

export type NarrationPhase = 'pending' | 'narrating' | 'prompting' | 'success';

export { buildMoveNarrationScript } from './storyNarrationScript';

export function useStoryNarration(
  moves: string[],
  enabled = true,
  resetKey = 'default',
) {
  const active = enabled && moves.length > 0;
  const [phase, setPhase] = useState<NarrationPhase>(
    active ? 'narrating' : 'pending',
  );
  const generationRef = useRef(0);
  const cancelSpeakRef = useRef<(() => void) | null>(null);

  const spoken = active ? buildMoveNarrationScript(moves) : '';

  useEffect(() => {
    cancelSpeakRef.current?.();
    cancelSpeakRef.current = null;

    if (!active) {
      setPhase('pending');
      return;
    }

    const generation = ++generationRef.current;
    setPhase('narrating');

    cancelSpeakRef.current = speakNarration(spoken, {
      onDone: () => {
        if (generation !== generationRef.current) return;
        setPhase('prompting');
      },
      onError: () => {
        if (generation !== generationRef.current) return;
        setPhase('prompting');
      },
    });

    return () => {
      generationRef.current += 1;
      cancelSpeakRef.current?.();
      cancelSpeakRef.current = null;
      void stopNarration();
    };
  }, [active, resetKey, spoken]);

  const markSuccess = useCallback(() => {
    cancelSpeakRef.current?.();
    cancelSpeakRef.current = null;
    void stopNarration();
    setPhase('success');
  }, []);

  return { phase, markSuccess };
}
