// TODO(stitch): Animated Match Engine frame 2cbaa7be4acd4190a3f95dae66d1b0bc
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
import { MatchMovePanel } from '@/components/match/MatchMovePanel';
import { MoveDisambiguation } from '@/components/match/MoveDisambiguation';
import { useMatchSession } from '@/hooks/useMatchSession';
import { useMatchPeek } from '@/hooks/useMatchPeek';
import { useGuestStore } from '@/stores/guestStore';

/** Shrinks the board so status, move panel, and controls fit without overlap. */
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
  const matchPlayerColor = useGuestStore((s) => s.matchPlayerColor);
  const {
    fen,
    isPlayerTurn,
    isThinking,
    isGameOver,
    lastEngineMove,
    lastPlayerMove,
    result,
    playerColor,
    moveError,
    resigned,
    disambiguation,
    completedMatchRecord,
    submitPlayerMove,
    chooseDisambiguation,
    cancelDisambiguation,
    resignMatch,
    clearMoveError,
    recordPeek,
  } = useMatchSession(matchElo, matchPlayerColor);
  const { peekVisible, onPeek } = useMatchPeek(fen, recordPeek);
  const [fullyCovered, setFullyCovered] = useState(false);
  const habitRecorded = useRef(false);
  const recordHabitActivity = useGuestStore((s) => s.recordHabitActivity);

  useEffect(() => {
    if (!isGameOver || habitRecorded.current) return;
    habitRecorded.current = true;
    recordHabitActivity();
  }, [isGameOver, recordHabitActivity]);

  const colorLabel = playerColor === 'w' ? 'White' : 'Black';

  const matchStatus: MatchStatus =
    isGameOver && result
      ? resultStatus(result, resigned)
      : disambiguation
        ? { text: disambiguation.prompt, tone: 'action' }
        : isThinking
          ? { text: 'Engine thinking…', tone: 'neutral' }
          : { text: `Your move — you play ${colorLabel}`, tone: 'action' };

  const handleSubmitMove = (move: string) => {
    void submitPlayerMove(move);
  };

  const handleNewMatch = () => {
    setFullyCovered(false);
    router.replace('/(main)/match' as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        bordered
        onSettingsPress={() => router.push('/(main)/settings' as never)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.flex}
      >
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
              {completedMatchRecord ? (
                <PrimaryButton
                  accessibilityLabel="Review this game"
                  label="Review game"
                  onPress={() =>
                    router.push(
                      `/(main)/analysis/${completedMatchRecord.id}` as never,
                    )
                  }
                  uppercase={false}
                />
              ) : null}
              <PrimaryButton
                accessibilityLabel="New match"
                label="New match"
                onPress={handleNewMatch}
                uppercase={false}
                variant={completedMatchRecord ? 'secondary' : undefined}
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
              {disambiguation ? (
                <MoveDisambiguation
                  candidates={disambiguation.candidates}
                  onCancel={cancelDisambiguation}
                  onSelect={(san) => {
                    void chooseDisambiguation(san);
                  }}
                  prompt={disambiguation.prompt}
                />
              ) : (
                <MatchMovePanel
                  error={moveError}
                  inputDisabled={!isPlayerTurn || isThinking}
                  isThinking={isThinking}
                  lastEngineMove={lastEngineMove}
                  lastPlayerMove={lastPlayerMove}
                  onClearError={clearMoveError}
                  onSubmit={handleSubmitMove}
                />
              )}
              <MatchControlBar
                covered={fullyCovered}
                micDisabled
                onCoverPress={() => setFullyCovered((value) => !value)}
                onPeekPress={onPeek}
              />
              <View style={styles.footerRow}>
                <Text
                  accessibilityLabel="Your peeks become custom training drills"
                  style={styles.peekHint}
                >
                  Your peeks become custom training drills
                </Text>
                <MatchSecondaryActions
                  disabled={isThinking}
                  onResign={resignMatch}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
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
  footerRow: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: -spacing.sm,
  },
  peekHint: {
    ...typography.labelBold,
    color: colors.outline,
    textAlign: 'center',
  },
  gameOverActions: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
});
