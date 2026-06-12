// TODO(stitch): infer from DailyDrill + HomeDashboard card patterns
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
import { HeroCopy } from '@/components/ui/HeroCopy';
import { DailyMatrixCard } from '@/components/home/DailyMatrixCard';
import { useDailyMatrix } from '@/hooks/useDailyMatrix';

export function TrainingHubScreen() {
  const { puzzleCount, loopBadge, isCompletedToday } = useDailyMatrix();

  const handleStartTraining = () => {
    if (isCompletedToday) return;
    router.push('/(main)/training/drill' as never);
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
        <View style={styles.hero}>
          <HeroCopy
            title="Story of the Position"
            subtitle="Active recall drills to sharpen your mental map."
            variant="section"
          />
        </View>

        <DailyMatrixCard
          completedToday={isCompletedToday}
          loopBadge={loopBadge}
          onPress={handleStartTraining}
          puzzleCount={puzzleCount}
        />
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
    paddingVertical: spacing.md,
  },
});
