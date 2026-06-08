import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export function HeatmapLegend() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>MAP LEGEND</Text>
      <View style={styles.row}>
        <View style={[styles.swatch, { backgroundColor: colors.fogStone }]} />
        <Text style={styles.label}>Fog: Unknown tactics</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.swatch, { backgroundColor: colors.primaryContainer }]} />
        <Text style={styles.label}>Green: Concept Acquired</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.swatch, { backgroundColor: colors.secondaryContainer }]} />
        <Text style={styles.label}>Gold: Strategic Mastery</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  heading: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  label: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
});
