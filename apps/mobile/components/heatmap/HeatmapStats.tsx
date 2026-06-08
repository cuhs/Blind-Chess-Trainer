import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface HeatmapStatsProps {
  clarityPercent: number;
  masteryCount: number;
  boardMappedPercent?: number;
}

export function HeatmapStats({
  clarityPercent,
  masteryCount,
  boardMappedPercent,
}: HeatmapStatsProps) {
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
        <Text style={styles.value}>
          {masteryCount} / 64
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
