// Stitch frame: b1eff5fd32e743e2a7f8a4b78a340318 (MindBoard Home Enhanced Loop)
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
import { ScreenScroll } from '@/components/ui/ScreenScroll';
import { HabitHeader } from '@/components/home/HabitHeader';
import { HeroCopy } from '@/components/ui/HeroCopy';
import { InteractiveHeatmap } from '@/components/heatmap/InteractiveHeatmap';
import { DailyMatrixCard } from '@/components/home/DailyMatrixCard';
import { VoiceMatchCard } from '@/components/home/VoiceMatchCard';
import { useDailyMatrix } from '@/hooks/useDailyMatrix';
import { useHabitStreak } from '@/hooks/useHabitStreak';
import { useFogClearedPercent } from '@/hooks/useFogClearedPercent';

export function HomeDashboardScreen() {
  const { streakDays } = useHabitStreak();
  const { clarityPercent } = useFogClearedPercent();
  const { puzzleCount, loopBadge, isCompletedToday } = useDailyMatrix();

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
      <ScreenScroll gap={spacing.md}>
        <HabitHeader
          boardMappedPercent={clarityPercent}
          streakDays={streakDays}
        />

        <View style={styles.section}>
          <HeroCopy
            title="Cognitive Heatmap"
            subtitle="Your mental map of the board. Clear the fog to master the game."
          />
        </View>

        <View style={styles.section}>
          <InteractiveHeatmap
            fullWidthFrame={false}
            horizontalInset={spacing.marginMobile * 2 + spacing.md * 2}
            interactive={false}
            showLabels={false}
          />
        </View>

        <View style={styles.section}>
          <DailyMatrixCard
            completedToday={isCompletedToday}
            loopBadge={loopBadge}
            onPress={handleStartTraining}
            puzzleCount={puzzleCount}
          />
          <VoiceMatchCard onPress={handleMatch} />
        </View>
      </ScreenScroll>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginTop: spacing.sectionGap,
    gap: spacing.md,
  },
});
