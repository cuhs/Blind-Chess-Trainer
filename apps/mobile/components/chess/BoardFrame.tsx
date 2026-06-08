import type { ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing, touch } from '@/theme';

interface BoardFrameProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: 'sm' | 'md';
}

export function BoardFrame({ children, style, padding = 'sm' }: BoardFrameProps) {
  return (
    <View
      style={[
        styles.frame,
        padding === 'md' && styles.frameMd,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.surfaceContainerHighest,
    padding: spacing.xs,
    marginBottom: touch.buttonOffset,
  },
  frameMd: {
    padding: spacing.md,
    borderColor: colors.cardStroke,
  },
});
