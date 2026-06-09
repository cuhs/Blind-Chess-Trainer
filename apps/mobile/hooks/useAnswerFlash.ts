import { useCallback, useRef, useState } from 'react';
import { Animated } from 'react-native';

export type FlashKind = 'success' | 'error';

/**
 * Brief full-screen color flash for answer feedback. `success` = green,
 * `error` = a soft red (gentle — peek is a feature, not a failure). Returns the
 * animated `opacity`/`kind` so the consumer can render an overlay, plus a
 * `flash` trigger to fire after submitting an answer.
 */
export function useAnswerFlash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const [kind, setKind] = useState<FlashKind>('success');

  const flash = useCallback(
    (next: FlashKind) => {
      setKind(next);
      opacity.stopAnimation();
      opacity.setValue(0);
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: next === 'error' ? 0.42 : 0.32,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 340,
          delay: 70,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [opacity],
  );

  return { flash, opacity, kind };
}
