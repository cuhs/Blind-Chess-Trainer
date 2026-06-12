// Stitch frame: b1eff5fd32e743e2a7f8a4b78a340318 (MindBoard Home Enhanced Loop)
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
import { HabitHeader } from '@/components/home/HabitHeader';
import { HeroCopy } from '@/components/ui/HeroCopy';
import { InteractiveHeatmap } from '@/components/heatmap/InteractiveHeatmap';
import { DailyMatrixCard } from '@/components/home/DailyMatrixCard';
import { VoiceMatchCard } from '@/components/home/VoiceMatchCard';
import { useDailyMatrix } from '@/hooks/useDailyMatrix';
import { useHabitStreak } from '@/hooks/useHabitStreak';
import { useFogClearedPercent } from '@/hooks/useFogClearedPercent';
import { useGuestStore } from '@/stores/guestStore';

export function HomeDashboardScreen() {
  const { streakDays } = useHabitStreak();
  const { clarityPercent } = useFogClearedPercent();
  const { puzzleCount, loopBadge, isCompletedToday } = useDailyMatrix();
  const matchElo = useGuestStore((s) => s.matchElo);

  const handleStartTraining = () => {
    if (isCompletedToday) return;
    router.push('/(main)/training/drill' as never);
  };

  const handleMatch = () => {
    router.push('/(main)/match' as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        bordered
        onSettingsPress={() => router.push('/(main)/settings' as never)}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HabitHeader
          boardMappedPercent={clarityPercent}
          streakDays={streakDays}
        />

        <View style={styles.hero}>
          <HeroCopy
            title="Cognitive Heatmap"
            subtitle="Your mental map of the board. Clear the fog to master the game."
          />
        </View>

        <View style={styles.mapSection}>
          <InteractiveHeatmap
            fullWidthFrame={false}
            horizontalInset={spacing.marginMobile * 2 + spacing.md * 2}
            showLabels={false}
          />
        </View>

        <View style={styles.action}>
          <DailyMatrixCard
            completedToday={isCompletedToday}
            loopBadge={loopBadge}
            onPress={handleStartTraining}
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
    paddingBottom: layout.tabBarClearance,
    gap: spacing.md,
  },
  hero: {
    marginTop: spacing.xs,
  },
  mapSection: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  action: {
    gap: spacing.md,
  },
});
