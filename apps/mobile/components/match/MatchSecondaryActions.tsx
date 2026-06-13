import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';

interface MatchSecondaryActionsProps {
  onResign: () => void;
  disabled?: boolean;
}

export function MatchSecondaryActions({
  onResign,
  disabled = false,
}: MatchSecondaryActionsProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel="Resign match"
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onResign}
        style={[styles.action, disabled && styles.actionDisabled]}
      >
        <Text style={[styles.label, styles.resignLabel]}>Resign</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  action: {
    minHeight: touch.min,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDisabled: {
    opacity: 0.45,
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
  resignLabel: {
    color: colors.error,
  },
});
