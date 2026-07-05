import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { HeroCopy } from '@/components/ui/HeroCopy';
import { ScreenScroll } from '@/components/ui/ScreenScroll';
import { StatCard } from '@/components/ui/StatCard';
import { DailyMatrixCard } from '@/components/home/DailyMatrixCard';
import { TrainingPathMap } from '@/components/training/TrainingPathMap';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useDailyMatrix } from '@/hooks/useDailyMatrix';
import { useDailySession } from '@/hooks/useDailySession';
import { useTrainingPath } from '@/hooks/useTrainingPath';
import { useGuestStore } from '@/stores/guestStore';
import { completedIdsForToday } from '@/lib/drillProgress';
import { todayKey } from '@/lib/dateKey';

export function TrainingHubScreen() {
  const { puzzleCount, loopBadge, isCompletedToday } = useDailyMatrix();
  const { puzzles } = useDailySession();
  const { activeNode } = useTrainingPath();
  const drillProgress = useGuestStore((s) => s.drillProgress);
  const today = todayKey();
  const completedIds = completedIdsForToday(drillProgress, today);
  const completedCount = completedIds.length;
  const peekSlots = puzzles.filter((p) => p.source === 'peek').length;
  const hasPartialSession =
    completedCount > 0 && completedCount < puzzleCount && !isCompletedToday;

  const handleStartTraining = () => {
    if (isCompletedToday) return;
    router.push('/(main)/training/drill' as never);
  };

  const handleStartActiveNode = () => {
    if (!activeNode) return;
    router.push(`/(main)/training/node/${activeNode.id}` as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        bordered
        onSettingsPress={() => router.push('/(main)/settings' as never)}
      />
      <ScreenScroll>
        <HeroCopy
          title="Training Path"
          subtitle="Build blindfold skill step by step, then review with the daily matrix."
          variant="section"
        />

        {activeNode ? (
          <PrimaryButton
            accessibilityLabel={`Continue training: ${activeNode.title}`}
            label={`Continue: ${activeNode.title}`}
            onPress={handleStartActiveNode}
            uppercase={false}
          />
        ) : null}

        <TrainingPathMap />

        <HeroCopy
          title="Daily Matrix"
          subtitle="Three puzzles a day — bank plus peek-generated review."
          variant="section"
        />

        <View style={styles.statsRow}>
          <StatCard
            label="Today's Progress"
            value={`${completedCount} / ${puzzleCount}`}
          />
          <StatCard label="Peek Slots" value={`${peekSlots}`} />
        </View>

        <DailyMatrixCard
          completedToday={isCompletedToday}
          loopBadge={loopBadge}
          onPress={handleStartTraining}
          puzzleCount={puzzleCount}
        />

        {hasPartialSession ? (
          <PrimaryButton
            accessibilityLabel="Resume drill"
            label="Resume drill"
            onPress={handleStartTraining}
            uppercase={false}
            variant="ghost"
          />
        ) : null}

        <Card variant="recessed">
          <Text style={styles.loopTitle}>Closed loop</Text>
          <Text style={styles.loopBody}>
            Your peeks become custom training drills. Play a blindfold match, peek
            when you need to, and tomorrow&apos;s matrix picks up where your mental
            map broke.
          </Text>
        </Card>
      </ScreenScroll>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  loopTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  loopBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
