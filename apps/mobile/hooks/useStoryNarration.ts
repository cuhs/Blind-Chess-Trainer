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

  const spoken = active ? buildMoveNarrationScript(moves) : '';

  useEffect(() => {
    if (!active) {
      setPhase('pending');
      return;
    }

    const generation = ++generationRef.current;
    setPhase('narrating');

    void speakNarration(spoken, {
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
      void stopNarration();
    };
  }, [active, resetKey, spoken]);

  const markSuccess = useCallback(() => setPhase('success'), []);

  return { phase, markSuccess };
}
