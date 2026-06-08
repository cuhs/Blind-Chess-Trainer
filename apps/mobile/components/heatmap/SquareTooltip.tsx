import { Text, View, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import type { Square } from '@mindboard/shared';

interface SquareTooltipProps {
  square: Square;
  accuracy: number;
  weakness?: string;
  onDismiss: () => void;
}

export function SquareTooltip({
  square,
  accuracy,
  weakness,
  onDismiss,
}: SquareTooltipProps) {
  return (
    <Pressable onPress={onDismiss} style={styles.backdrop}>
      <View style={styles.tooltip}>
        <Text style={styles.title}>
          {square}: {accuracy}% accuracy
        </Text>
        {weakness ? (
          <Text style={styles.weakness}>Weakness: {weakness}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
  tooltip: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.cardStroke,
    padding: spacing.md,
    marginHorizontal: spacing.marginMobile,
  },
  title: {
    ...typography.labelBold,
    color: colors.onSurface,
  },
  weakness: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
});
