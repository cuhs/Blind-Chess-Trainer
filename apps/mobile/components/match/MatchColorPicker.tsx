import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { MatchPlayerColor } from '@/lib/matchConstants';
import { colors, radius, spacing, touch, typography } from '@/theme';

interface MatchColorPickerProps {
  value: MatchPlayerColor;
  onChange: (color: MatchPlayerColor) => void;
}

const OPTIONS: { value: MatchPlayerColor; label: string }[] = [
  { value: 'w', label: 'White' },
  { value: 'b', label: 'Black' },
];

export function MatchColorPicker({ value, onChange }: MatchColorPickerProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Your color</Text>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityLabel={`Play as ${option.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <View
                style={[
                  styles.chip,
                  option.value === 'w' ? styles.chipWhite : styles.chipBlack,
                ]}
              />
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>
        {value === 'w' ? 'You move first' : 'Engine moves first'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    minHeight: touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
    borderBottomWidth: touch.buttonOffset,
    transform: [{ translateY: 1 }],
  },
  chip: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
  },
  chipWhite: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  chipBlack: {
    backgroundColor: colors.onSurface,
  },
  optionLabel: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
  optionLabelSelected: {
    color: colors.onPrimaryContainer,
  },
  hint: {
    ...typography.labelBold,
    color: colors.outline,
    textAlign: 'center',
  },
});
