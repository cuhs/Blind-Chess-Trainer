import type { ReactNode } from 'react';
import { View, Text, StyleSheet, type ViewProps } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Card } from '@/components/ui/Card';

interface StatCardProps extends ViewProps {
  label: string;
  value: string;
  leading?: ReactNode;
}

export function StatCard({ label, value, leading, style, ...props }: StatCardProps) {
  return (
    <Card style={[styles.card, style]} {...props}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        {leading}
        <Text style={styles.value}>{value}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    ...typography.statLabel,
    color: colors.outline,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    ...typography.statValue,
    color: colors.onSurface,
  },
});
