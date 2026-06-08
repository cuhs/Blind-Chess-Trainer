import { useEffect, useState } from 'react';
import * as Speech from 'expo-speech';

export type NarrationPhase = 'narrating' | 'prompting' | 'success';

function formatMoveForSpeech(san: string): string {
  return san
    .replace(/N/g, 'Knight ')
    .replace(/B/g, 'Bishop ')
    .replace(/R/g, 'Rook ')
    .replace(/Q/g, 'Queen ')
    .replace(/K/g, 'King ')
    .replace(/x/g, ' takes ')
    .replace(/\+/g, ', check')
    .replace(/#/g, ', checkmate');
}

export function useStoryNarration(moves: string[]) {
  const [phase, setPhase] = useState<NarrationPhase>('narrating');

  useEffect(() => {
    const spoken = moves
      .map((move, i) => {
        const color = i % 2 === 0 ? 'White plays' : 'Black plays';
        return `${color} ${formatMoveForSpeech(move)}`;
      })
      .join('. ');

    Speech.speak(spoken, {
      onDone: () => setPhase('prompting'),
      onStopped: () => setPhase('prompting'),
      onError: () => setPhase('prompting'),
    });

    return () => {
      void Speech.stop();
    };
  }, [moves]);

  const markSuccess = () => setPhase('success');

  return { phase, markSuccess };
}
