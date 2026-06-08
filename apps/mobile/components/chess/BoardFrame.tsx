import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing, touch } from '@/theme';

interface BoardFrameProps {
  children: ReactNode;
}

export function BoardFrame({ children }: BoardFrameProps) {
  return <View style={styles.frame}>{children}</View>;
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
});
