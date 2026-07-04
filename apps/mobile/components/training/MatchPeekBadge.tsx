import { Text, StyleSheet, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { PeekIcon } from '@/components/ui/icons/PeekIcon';

export function MatchPeekBadge() {
  return (
    <View
      accessibilityLabel="From your match"
      accessibilityRole="text"
      style={styles.badge}
    >
      <PeekIcon color={colors.onSecondaryContainer} size={16} />
      <Text style={styles.label}>From your match</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.labelBold,
    color: colors.contrastInk,
    letterSpacing: 0,
  },
});
