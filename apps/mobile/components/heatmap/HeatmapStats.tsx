import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Card } from '@/components/ui/Card';

interface HeatmapStatsProps {
  clarityPercent: number;
  masteryCount: number;
  boardMappedPercent?: number;
  variant?: 'row' | 'cards';
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.card} accessibilityRole="text">
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </Card>
  );
}

export function HeatmapStats({
  clarityPercent,
  masteryCount,
  boardMappedPercent,
  variant = 'row',
}: HeatmapStatsProps) {
  if (variant === 'cards') {
    return (
      <View style={styles.cardsRow}>
        <StatCard label="Clarity" value={`${clarityPercent}%`} />
        <StatCard label="Mastery" value={`${masteryCount} / 64`} />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.stat}>
        <Text style={styles.label}>CLARITY</Text>
        <Text style={styles.value}>{clarityPercent}%</Text>
      </View>
      {boardMappedPercent !== undefined ? (
        <View style={styles.stat}>
          <Text style={styles.label}>BOARD MAPPED</Text>
          <Text style={styles.value}>{boardMappedPercent}%</Text>
        </View>
      ) : null}
      <View style={styles.stat}>
        <Text style={styles.label}>MASTERY</Text>
        <Text style={styles.value}>{masteryCount} / 64</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.gutter,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 0,
  },
  cardLabel: {
    ...typography.labelBold,
    color: colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  cardValue: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  value: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
});
