import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { buildMoveReplayData } from '@mindboard/chess-core';
import { AppHeader } from '@/components/ui/AppHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { ReplayBackLink } from '@/components/replay/ReplayBackLink';
import { ReplayControls } from '@/components/replay/ReplayControls';
import { ReplayMoveTimeline } from '@/components/replay/ReplayMoveTimeline';
import { ReplayTurnNotice } from '@/components/replay/ReplayTurnNotice';
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
  const [positionIndex, setPositionIndex] = useState(0);

  const record = matchId ? getMatchById(matchId) : undefined;
  const replay = useMemo(
    () => (record ? buildMoveReplayData(record) : null),
    [record],
  );
  const currentPosition = replay?.positions[positionIndex];
  const activeMove = replay?.moves.find(
    (move) => move.positionIndex === positionIndex,
  );

  const goToMatchList = useCallback(() => {
    router.back();
  }, [router]);

  const goToPrevious = useCallback(() => {
    setPositionIndex((index) => Math.max(index - 1, 0));
  }, []);

  const goToNext = useCallback(() => {
    if (!replay) return;
    setPositionIndex((index) => Math.min(index + 1, replay.positions.length - 1));
  }, [replay]);

  const selectMove = useCallback((index: number) => {
    setPositionIndex(index);
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

  if (!record || !replay || !currentPosition) {
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
          <ChessBoard fen={currentPosition.fen} />
        </View>

        {activeMove?.turnFlags ? (
          <ReplayTurnNotice
            moveNumber={activeMove.moveNumber}
            turnFlags={activeMove.turnFlags}
          />
        ) : null}

        <ReplayControls
          onNext={goToNext}
          onPrevious={goToPrevious}
          positionCount={replay.positions.length}
          positionIndex={positionIndex}
        />

        <View style={styles.timelineSection}>
          <Text accessibilityRole="header" style={styles.timelineHeading}>
            Move history
          </Text>
          <ReplayMoveTimeline
            moves={replay.moves}
            onSelectMove={selectMove}
            selectedPositionIndex={positionIndex}
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
