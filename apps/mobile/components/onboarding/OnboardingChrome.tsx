import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface OnboardingChromeProps {
  label: string;
  percent: number;
}

export function OnboardingChrome({ label, percent }: OnboardingChromeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ProgressBar percent={percent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginBottom: spacing.sectionGap,
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
});
