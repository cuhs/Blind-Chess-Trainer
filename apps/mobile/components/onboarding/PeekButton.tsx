import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { LightbulbIcon } from '@/components/ui/icons/LightbulbIcon';

interface PeekButtonProps {
  onPress: () => void;
}

export function PeekButton({ onPress }: PeekButtonProps) {
  return (
    <Pressable
      accessibilityLabel="I forgot... need a peek?"
      accessibilityRole="button"
      onPress={onPress}
      style={styles.button}
    >
      <View style={styles.chip}>
        <LightbulbIcon color={colors.secondary} size={18} />
        <Text style={styles.text}>I forgot... need a peek?</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 223, 146, 0.3)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(117, 91, 0, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    ...typography.labelBold,
    color: colors.onSecondaryFixedVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
