import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, radius, spacing, touch, typography } from '@/theme';
import {
  MATCH_ELO_MAX,
  MATCH_ELO_MIN,
  eloTierLabel,
  usesCalibratedUciElo,
} from '@/lib/engine/engineElo';

interface MatchEloSliderProps {
  value: number;
  onChange: (elo: number) => void;
}

export function MatchEloSlider({ value, onChange }: MatchEloSliderProps) {
  const calibrated = usesCalibratedUciElo(value);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Opponent strength</Text>
        <Text accessibilityLabel={`Opponent rating ${value} Elo`} style={styles.elo}>
          {value} Elo
        </Text>
      </View>
      <Text style={styles.tier}>{eloTierLabel(value)}</Text>
      <Slider
        accessibilityLabel="Opponent Elo slider"
        maximumTrackTintColor={colors.surfaceContainerHigh}
        maximumValue={MATCH_ELO_MAX}
        minimumTrackTintColor={colors.primary}
        minimumValue={MATCH_ELO_MIN}
        onValueChange={(next) => onChange(Math.round(next))}
        step={50}
        thumbTintColor={colors.primary}
        value={value}
      />
      <View style={styles.rangeRow}>
        <Text style={styles.range}>{MATCH_ELO_MIN}</Text>
        <Text style={styles.range}>{MATCH_ELO_MAX}</Text>
      </View>
      <Text style={styles.hint}>
        {calibrated
          ? 'Calibrated Stockfish strength'
          : 'Skill-based weakening below 1320'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    borderColor: colors.cardStroke,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  elo: {
    ...typography.headlineLg,
    color: colors.onSurface,
    fontVariant: ['tabular-nums'],
  },
  tier: {
    ...typography.bodyMd,
    color: colors.tertiary,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  range: {
    ...typography.labelBold,
    color: colors.outline,
    fontVariant: ['tabular-nums'],
  },
  hint: {
    ...typography.labelBold,
    color: colors.outline,
    textAlign: 'center',
  },
});
