import { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';
import { ChevronDownIcon } from '@/components/ui/icons/ChevronDownIcon';

interface ScrollAnswerCueProps {
  /** Scrolls the answer controls into view. */
  onPress: () => void;
}

/**
 * Card-row hint shown between the prompt and the board when the answer
 * controls sit below the fold. Tapping it scrolls the controls into view.
 * Styled to match the SquareKeypad display card (white, 2pt stroke).
 */
export function ScrollAnswerCue({ onPress }: ScrollAnswerCueProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityLabel="Scroll down to enter your answer"
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.cue,
        {
          transform: [{ translateY: pressed ? touch.buttonOffset / 2 : 0 }],
        },
      ]}
    >
      <View style={styles.iconBadge}>
        <ChevronDownIcon color={colors.primary} size={18} />
      </View>
      <Text style={styles.label}>Scroll down to enter your answer</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.surfaceContainerHighest,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
});
