import { Animated, StyleSheet } from 'react-native';
import { colors } from '@/theme';
import type { FlashKind } from '@/hooks/useAnswerFlash';

interface AnswerFlashOverlayProps {
  opacity: Animated.Value;
  kind: FlashKind;
}

/** Non-interactive color wash for answer feedback. Pair with `useAnswerFlash`. */
export function AnswerFlashOverlay({ opacity, kind }: AnswerFlashOverlayProps) {
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: kind === 'success' ? colors.success : colors.error,
          opacity,
        },
      ]}
    />
  );
}
