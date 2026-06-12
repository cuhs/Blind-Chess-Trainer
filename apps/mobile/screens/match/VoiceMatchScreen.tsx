// TODO(stitch): Animated Match Engine frame 2cbaa7be4acd4190a3f95dae66d1b0bc
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, layout, spacing, typography } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { BlindfoldBoard } from '@/components/chess/BlindfoldBoard';
import {
  MatchStatusBar,
  type MatchStatusTone,
} from '@/components/match/MatchStatusBar';
import { MatchControlBar } from '@/components/match/MatchControlBar';
import { MatchSecondaryActions } from '@/components/match/MatchSecondaryActions';
import { DevMoveInput } from '@/components/match/DevMoveInput';
import { useMatchSession } from '@/hooks/useMatchSession';
import { useMatchPeek } from '@/hooks/useMatchPeek';
import { useGuestStore } from '@/stores/guestStore';

/** Shrinks the board so status bar, controls, and input fit in one viewport. */
const BOARD_EXTRA_INSET = spacing.marginMobile * 2 + spacing.xl * 2;

interface MatchStatus {
  text: string;
  tone: MatchStatusTone;
}

function resultStatus(
  result: 'win' | 'loss' | 'draw',
  resigned: boolean,
): MatchStatus {
  if (resigned) return { text: 'You resigned', tone: 'alert' };
  if (result === 'win') return { text: 'Checkmate — you win', tone: 'success' };
  if (result === 'loss') return { text: 'Checkmate — engine wins', tone: 'alert' };
  return { text: 'Game drawn', tone: 'neutral' };
}

export function VoiceMatchScreen() {
  const router = useRouter();
  const matchElo = useGuestStore((s) => s.matchElo);
  const {
    fen,
    isPlayerTurn,
    isThinking,
    isGameOver,
    lastMove,
    result,
    turn,
    moveError,
    resigned,
    submitPlayerMove,
    resetMatch,
    resignMatch,
    clearMoveError,
  } = useMatchSession(matchElo);
  const { peekVisible, onPeek } = useMatchPeek(fen);
  const [fullyCovered, setFullyCovered] = useState(false);

  const matchStatus: MatchStatus =
    isGameOver && result
      ? resultStatus(result, resigned)
      : moveError
        ? { text: moveError, tone: 'alert' }
        : isThinking
          ? { text: 'Engine thinking…', tone: 'neutral' }
          : lastMove && turn === 'w'
            ? { text: `Engine played ${lastMove} — your move`, tone: 'action' }
            : { text: 'Your move — you play White', tone: 'action' };

  const handleSubmitMove = (move: string) => {
    void submitPlayerMove(move);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        bordered
        onSettingsPress={() => router.push('/(main)/settings' as never)}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MatchStatusBar
          elo={matchElo}
          statusText={matchStatus.text}
          statusTone={matchStatus.tone}
        />

        <View style={styles.boardWrap}>
          <BlindfoldBoard
            fen={fen}
            fullyCovered={fullyCovered}
            horizontalInset={BOARD_EXTRA_INSET}
            peekVisible={peekVisible}
          />
        </View>

        {isGameOver ? (
          <View style={styles.gameOverActions}>
            <PrimaryButton
              accessibilityLabel="Play again"
              label="Play again"
              onPress={() => {
                setFullyCovered(false);
                resetMatch();
              }}
              uppercase={false}
            />
            <PrimaryButton
              accessibilityLabel="Back to home"
              label="Back to home"
              onPress={() => router.replace('/(main)')}
              uppercase={false}
              variant="secondary"
            />
          </View>
        ) : (
          <>
            <MatchControlBar
              covered={fullyCovered}
              micDisabled
              onCoverPress={() => setFullyCovered((value) => !value)}
              onPeekPress={onPeek}
            />
            <MatchSecondaryActions
              disabled={isThinking}
              onNewGame={() => {
                setFullyCovered(false);
                resetMatch();
              }}
              onResign={resignMatch}
            />
            <Text style={styles.peekHint}>
              Peeks build tomorrow&apos;s puzzles
            </Text>
            <DevMoveInput
              disabled={!isPlayerTurn || isThinking}
              error={moveError}
              onClearError={clearMoveError}
              onSubmit={handleSubmitMove}
            />
          </>
        )}
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
  boardWrap: {
    alignItems: 'center',
  },
  peekHint: {
    ...typography.labelBold,
    color: colors.outline,
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
  gameOverActions: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
});
