// TODO(stitch): HomeDashboard — extend 61ce6c33 + closed-loop spec
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
import { HabitHeader } from '@/components/home/HabitHeader';
import { InteractiveHeatmap } from '@/components/heatmap/InteractiveHeatmap';
import { HeatmapStats } from '@/components/heatmap/HeatmapStats';
import { HeatmapLegend } from '@/components/heatmap/HeatmapLegend';
import { DailyMatrixCard } from '@/components/home/DailyMatrixCard';
import { VoiceMatchCard } from '@/components/home/VoiceMatchCard';
import { useHabitStreak } from '@/hooks/useHabitStreak';
import { useFogClearedPercent } from '@/hooks/useFogClearedPercent';
import { useDailyMatrix } from '@/hooks/useDailyMatrix';
import { useGuestStore } from '@/stores/guestStore';

export function HomeDashboardScreen() {
  const { streakDays } = useHabitStreak();
  const { boardMappedPercent, clarityPercent, masteryCount } =
    useFogClearedPercent();
  const { puzzleCount, loopBadge } = useDailyMatrix();
  const matchElo = useGuestStore((s) => s.matchElo);

  const handleTraining = () => {
    Alert.alert(
      'Daily Matrix',
      'Training suite arrives in Phase 2. Your onboarding progress is saved.',
    );
  };

  const handleMatch = () => {
    Alert.alert(
      'Voice Match',
      'Voice match engine arrives in Phase 3. Set expectations — peek freely!',
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader />
        <HabitHeader
          boardMappedPercent={boardMappedPercent}
          streakDays={streakDays}
        />

        <Text style={styles.title}>Cognitive Heatmap</Text>
        <Text style={styles.subtitle}>
          Your mental map of the board. Clear the fog to master the game.
        </Text>

        <HeatmapStats
          clarityPercent={clarityPercent}
          masteryCount={masteryCount}
        />

        <InteractiveHeatmap />

        <HeatmapLegend />

        <View style={styles.cards}>
          <DailyMatrixCard
            loopBadge={loopBadge}
            onPress={handleTraining}
            puzzleCount={puzzleCount}
          />
          <VoiceMatchCard matchElo={matchElo} onPress={handleMatch} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.displayLgMobile,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  cards: {
    marginTop: spacing.sectionGap,
    gap: spacing.md,
  },
});
