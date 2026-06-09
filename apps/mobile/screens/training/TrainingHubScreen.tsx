// TODO(stitch): TrainingHub — infer from StoryPuzzle + DailyDrill
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
import { HeroCopy } from '@/components/ui/HeroCopy';
import { DailyMatrixCard } from '@/components/home/DailyMatrixCard';
import { useDailyMatrix } from '@/hooks/useDailyMatrix';

export function TrainingHubScreen() {
  const { puzzleCount, loopBadge } = useDailyMatrix();

  const handleStartTraining = () => {
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
            subtitle="Active recall drills to sharpen your mental map. Text input only — no voice."
            variant="section"
          />
        </View>

        <DailyMatrixCard
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
