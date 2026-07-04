import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing, touch, typography } from '@/theme';
import { ChevronLeftIcon } from '@/components/ui/icons/ChevronLeftIcon';

interface ReplayBackLinkProps {
  onPress: () => void;
}

export function ReplayBackLink({ onPress }: ReplayBackLinkProps) {
  return (
    <Pressable
      accessibilityLabel="Back to match list"
      accessibilityRole="button"
      onPress={onPress}
      style={styles.link}
    >
      <ChevronLeftIcon color={colors.onSurfaceVariant} size={20} />
      <Text style={styles.label}>Match list</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: touch.min,
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    letterSpacing: 0,
  },
});
