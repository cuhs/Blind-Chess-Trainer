import { Pressable, StyleSheet, Text } from 'react-native';
import { ChevronLeftIcon } from '@/components/ui/icons/ChevronLeftIcon';
import { colors, spacing, typography } from '@/theme';

interface ReplayBackLinkProps {
  onPress: () => void;
}

export function ReplayBackLink({ onPress }: ReplayBackLinkProps) {
  return (
    <Pressable
      accessibilityLabel="Back to match list"
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={styles.link}
    >
      <ChevronLeftIcon color={colors.tertiary} size={20} />
      <Text style={styles.label}>Match list</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.labelBold,
    color: colors.tertiary,
    letterSpacing: 0,
  },
});
