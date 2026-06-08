import { Text, StyleSheet, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

interface VoiceMatchCardProps {
  matchElo: number;
  onPress: () => void;
}

export function VoiceMatchCard({ matchElo, onPress }: VoiceMatchCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Start Voice Match</Text>
      <View style={styles.eloChip}>
        <Text style={styles.eloText}>Opponent: {matchElo}</Text>
      </View>
      <PrimaryButton label="Enter Arena" onPress={onPress} variant="secondary" />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  eloChip: {
    backgroundColor: colors.recessedBg,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  eloText: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
});
