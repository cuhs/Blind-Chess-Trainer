import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { buildMatchReplaySteps } from '@mindboard/chess-core';
import { AppHeader } from '@/components/ui/AppHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ReplayBackLink } from '@/components/replay/ReplayBackLink';
import { ReplayControls } from '@/components/replay/ReplayControls';
import { ReplayHeatmapBoard } from '@/components/replay/ReplayHeatmapBoard';
import { ReplayStepTimeline } from '@/components/replay/ReplayStepTimeline';
import { ReplayTurnNotice } from '@/components/replay/ReplayTurnNotice';
import { useMatchHistory } from '@/hooks/useMatchHistory';
import { colors, layout, spacing, typography } from '@/theme';
import {
  formatMatchDate,
  formatMatchResult,
  formatPlayerColor,
} from '@/lib/matchHistory';
import { weaknessSquaresForReplayStep } from '@/lib/replayWeakness';

export function ReplayScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { hasHydrated, getMatchById } = useMatchHistory();
  const [stepIndex, setStepIndex] = useState(0);
  const [fogDismissed, setFogDismissed] = useState(false);

  const record = matchId ? getMatchById(matchId) : undefined;
  const steps = useMemo(
    () => (record ? buildMatchReplaySteps(record) : []),
    [record],
  );
  const currentStep = steps[stepIndex];

  const weaknessSquares = useMemo(() => {
    if (!currentStep?.mentalMapBreak) return [];
    return weaknessSquaresForReplayStep(currentStep);
  }, [currentStep]);

  const showHeatmap = Boolean(currentStep?.mentalMapBreak && !fogDismissed);

  useEffect(() => {
    setFogDismissed(false);
  }, [stepIndex]);

  const goToMatchList = useCallback(() => {
    router.back();
  }, [router]);

  const goToPrevious = useCallback(() => {
    setStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  const goToNext = useCallback(() => {
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }, [steps.length]);

  const selectStep = useCallback((index: number) => {
    setStepIndex(index);
  }, []);

  if (!hasHydrated) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader bordered onSettingsPress={() => router.push('/(main)/settings' as never)} />
        <View style={styles.centered}>
          <Text style={styles.message}>Loading saved games…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!record || !currentStep) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader bordered onSettingsPress={() => router.push('/(main)/settings' as never)} />
        <View style={styles.centered}>
          <Text accessibilityRole="header" style={styles.message}>
            Match not found
          </Text>
          <Text style={styles.hint}>
            This replay is not in local storage. Finish a voice match to save one offline.
          </Text>
          <PrimaryButton
            accessibilityLabel="Back to match list"
            label="Back to list"
            onPress={() => router.back()}
            uppercase={false}
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        bordered
        onSettingsPress={() => router.push('/(main)/settings' as never)}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ReplayBackLink onPress={goToMatchList} />

        <Text style={styles.subheading}>
          {formatMatchDate(record.finishedAt)} · {formatMatchResult(record)} ·{' '}
          {formatPlayerColor(record.playerColor)}
        </Text>

        <View style={styles.boardWrap}>
          <ReplayHeatmapBoard
            fen={currentStep.fen}
            showHeatmap={showHeatmap}
            weaknessSquares={weaknessSquares}
          />
        </View>

        {currentStep.kind === 'peek' && showHeatmap ? (
          <ReplayTurnNotice
            stepKind="peek"
            title={currentStep.title}
            weaknessSquares={weaknessSquares}
            onShowClearBoard={() => setFogDismissed(true)}
          />
        ) : null}

        {currentStep.kind === 'illegal_attempt' && showHeatmap ? (
          <ReplayTurnNotice
            stepKind="illegal_attempt"
            title={currentStep.title}
            weaknessSquares={weaknessSquares}
            onShowClearBoard={() => setFogDismissed(true)}
          />
        ) : null}

        {(currentStep.kind === 'peek' ||
          currentStep.kind === 'illegal_attempt') &&
        fogDismissed ? (
          <Text style={styles.clearHint}>Board shown without fog overlay.</Text>
        ) : null}

        <ReplayControls
          onNext={goToNext}
          onPrevious={goToPrevious}
          positionCount={steps.length}
          positionIndex={stepIndex}
        />

        <View style={styles.timelineSection}>
          <Text accessibilityRole="header" style={styles.timelineHeading}>
            Timeline
          </Text>
          <ReplayStepTimeline
            onSelectStep={selectStep}
            selectedIndex={stepIndex}
            steps={steps}
          />
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
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.sm,
    paddingBottom: layout.tabBarClearance,
    gap: spacing.sm,
  },
  subheading: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: 'center',
    paddingHorizontal: spacing.marginMobile,
  },
  boardWrap: {
    alignItems: 'center',
  },
  clearHint: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: 'center',
    paddingHorizontal: spacing.marginMobile,
  },
  timelineSection: {
    gap: spacing.sm,
  },
  timelineHeading: {
    ...typography.labelBold,
    color: colors.outline,
    paddingHorizontal: spacing.marginMobile,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.sm,
  },
  message: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: 'center',
  },
  hint: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: 'center',
  },
});
