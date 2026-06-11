import { Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';
import { ChevronDownIcon } from '@/components/ui/icons/ChevronDownIcon';

/**
 * Bridge between the puzzle prompt and answer controls when the keypad
 * sits below the fold. Mirrors the SquareKeypad selection display so the
 * flow feels continuous.
 */
export function ScrollAnswerCue() {
  return (
    <View
      accessibilityLabel="Scroll down to enter your answer"
      accessibilityRole="text"
      style={styles.cue}
    >
      <Text style={styles.eyebrow}>Your answer</Text>
      <Text style={styles.message}>Scroll down to enter your answer</Text>
      <View style={styles.iconBadge}>
        <ChevronDownIcon color={colors.primary} size={20} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cue: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.surfaceContainerHighest,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  eyebrow: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  message: {
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    borderWidth: touch.strokeWidth,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
});
