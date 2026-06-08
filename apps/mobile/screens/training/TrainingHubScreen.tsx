// TODO(stitch): TrainingHub — infer from StoryPuzzle + DailyDrill
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
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
          <Text style={styles.title}>Story of the Position</Text>
          <Text style={styles.subtitle}>
            Active recall drills to sharpen your mental map. Text input only —
            no voice.
          </Text>
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
    paddingBottom: 128,
    gap: spacing.md,
  },
  hero: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
