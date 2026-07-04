import { View, StyleSheet } from 'react-native';
import { spacing } from '@/theme';
import { StatCard } from '@/components/ui/StatCard';

interface HeatmapStatsProps {
  clarityPercent: number;
  masteryCount: number;
}

export function HeatmapStats({
  clarityPercent,
  masteryCount,
}: HeatmapStatsProps) {
  return (
    <View style={styles.row}>
      <StatCard label="Clarity" value={`${clarityPercent}%`} />
      <StatCard label="Mastery" value={`${masteryCount} / 64`} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.gutter,
  },
});
