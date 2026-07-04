import { View, StyleSheet, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing, touch } from '@/theme';

export type CardVariant = 'flat' | 'recessed' | 'elevated';

interface CardProps extends ViewProps {
  variant?: CardVariant;
}

export function Card({
  style,
  children,
  variant = 'flat',
  ...props
}: CardProps) {
  return (
    <View style={[styles.base, variantStyles[variant], style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    padding: spacing.md,
  },
});

const variantStyles: Record<CardVariant, StyleProp<ViewStyle>> = {
  flat: {
    backgroundColor: colors.surfaceContainerLowest,
    marginBottom: 0,
  },
  recessed: {
    backgroundColor: colors.recessedBg,
    marginBottom: 0,
  },
  elevated: {
    backgroundColor: colors.surfaceContainerLowest,
    marginBottom: touch.buttonOffset,
  },
};
