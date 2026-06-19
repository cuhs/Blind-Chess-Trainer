import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { buildMatchReplaySteps } from '@mindboard/chess-core';
import { AppHeader } from '@/components/ui/AppHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { ReplayControls } from '@/components/replay/ReplayControls';
import { useMatchHistory } from '@/hooks/useMatchHistory';
import { colors, layout, spacing, typography } from '@/theme';
import {
  formatMatchDate,
  formatMatchResult,
  formatPlayerColor,
} from '@/lib/matchHistory';

export function ReplayScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { hasHydrated, getMatchById } = useMatchHistory();
  const [stepIndex, setStepIndex] = useState(0);

  const record = matchId ? getMatchById(matchId) : undefined;
  const steps = useMemo(
    () => (record ? buildMatchReplaySteps(record) : []),
    [record],
  );
  const currentStep = steps[stepIndex];

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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PrimaryButton
          accessibilityLabel="Back to match list"
          label="Back to list"
          onPress={() => router.back()}
          uppercase={false}
          variant="secondary"
        />

        <Text accessibilityRole="header" style={styles.heading}>
          Game replay
        </Text>
        <Text style={styles.subheading}>
          {formatMatchDate(record.finishedAt)} · {formatMatchResult(record)} ·{' '}
          {formatPlayerColor(record.playerColor)}
        </Text>

        <View style={styles.boardWrap}>
          <ChessBoard fen={currentStep.fen} />
        </View>

        <ReplayControls
          onNext={() => setStepIndex((index) => Math.min(index + 1, steps.length - 1))}
          onPrevious={() => setStepIndex((index) => Math.max(index - 1, 0))}
          stepCount={steps.length}
          stepDetail={currentStep.detail}
          stepIndex={stepIndex}
          stepTitle={currentStep.title}
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
    paddingTop: spacing.md,
    paddingBottom: layout.tabBarClearance,
    gap: spacing.md,
  },
  heading: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  subheading: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  boardWrap: {
    alignItems: 'center',
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
