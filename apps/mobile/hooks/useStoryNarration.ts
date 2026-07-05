import { useCallback, useEffect, useRef, useState } from 'react';
import { buildMoveNarrationScript } from './storyNarrationScript';
import { speakNarration, stopNarration } from '@/lib/speech';

export type NarrationPhase = 'pending' | 'narrating' | 'prompting' | 'success';

export { buildMoveNarrationScript } from './storyNarrationScript';

interface StoryNarrationOptions {
  fen?: string;
  stripCheck?: boolean;
}

export function useStoryNarration(
  moves: string[],
  enabled = true,
  resetKey = 'default',
  narrationOptions: StoryNarrationOptions = {},
  narrationScript?: string,
) {
  const active = enabled && (moves.length > 0 || Boolean(narrationScript?.trim()));
  const [phase, setPhase] = useState<NarrationPhase>(
    active ? 'narrating' : 'pending',
  );
  const generationRef = useRef(0);
  const cancelSpeakRef = useRef<(() => void) | null>(null);

  const spoken = active
    ? narrationScript?.trim() ||
      buildMoveNarrationScript(moves, narrationOptions)
    : '';

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
