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
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <ProgressBar percent={percent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginBottom: spacing.sectionGap,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.labelBold,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  percent: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
});
