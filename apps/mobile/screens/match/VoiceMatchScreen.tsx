// TODO(stitch): Animated Match Engine frame 2cbaa7be4acd4190a3f95dae66d1b0bc
import { useState, useEffect, useRef, useCallback } from 'react';
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
import { DisambiguationOverlay } from '@/components/match/DisambiguationOverlay';
import { useMatchSession } from '@/hooks/useMatchSession';
import { useMatchPeek } from '@/hooks/useMatchPeek';
import { useMatchSpeech } from '@/hooks/useMatchSpeech';
import { useGuestStore } from '@/stores/guestStore';
import {
  HIGH_CONFIDENCE,
  minAutoSubmitConfidence,
  normalizeSpokenMove,
  type VoiceResolveResult,
} from '@mindboard/voice-pipeline';

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
  const voiceListenMode = useGuestStore((s) => s.voiceListenMode);
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
    status,
    submitPlayerMove,
    chooseDisambiguation,
    cancelDisambiguation,
    presentVoiceDisambiguation,
    resignMatch,
    clearMoveError,
    recordPeek,
  } = useMatchSession(matchElo, matchPlayerColor);
  const { peekVisible, onPeek } = useMatchPeek(fen, recordPeek);
  const [fullyCovered, setFullyCovered] = useState(false);
  const habitRecorded = useRef(false);
  const recordHabitActivity = useGuestStore((s) => s.recordHabitActivity);
  const prevVoiceEnabledRef = useRef(false);
  const autoStartedRef = useRef(false);

  const [moveDraft, setMoveDraft] = useState('');
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);

  const voiceEnabled =
    isPlayerTurn && !isThinking && !isGameOver && !isSubmittingMove;

  const waitingForEngine =
    !isGameOver &&
    !disambiguation &&
    (isThinking || (!isPlayerTurn && status === 'playing'));

  const showMoveInput =
    !waitingForEngine && (isPlayerTurn || isSubmittingMove);

  const applyMoveWithFeedback = useCallback(
    (apply: () => boolean) => {
      if (isSubmittingMove) return;
      setIsSubmittingMove(true);
      clearMoveError();
      // Defer apply until after paint so "Sending…" appears immediately.
      requestAnimationFrame(() => {
        try {
          const applied = apply();
          if (applied) {
            setMoveDraft('');
            setVoiceHint(null);
          }
        } finally {
          setIsSubmittingMove(false);
        }
      });
    },
    [clearMoveError, isSubmittingMove],
  );

  const handleSubmitMove = useCallback(
    (move: string) => {
      const trimmed = normalizeSpokenMove(move);
      if (!trimmed) return;
      applyMoveWithFeedback(() => submitPlayerMove(trimmed));
    },
    [applyMoveWithFeedback, submitPlayerMove],
  );

  const handleVoiceTranscript = useCallback(
    (result: VoiceResolveResult) => {
      if (!result.displayText.trim()) return;
      setMoveDraft(result.displayText);
      if (result.ambiguous && result.prompt && result.candidates?.length) {
        setVoiceHint(null);
        presentVoiceDisambiguation(
          result.submitText,
          result.prompt,
          result.candidates,
        );
        return;
      }
      const minConfidence = minAutoSubmitConfidence(result.submitText.length);
      if (result.matched && result.confidence >= minConfidence) {
        setVoiceHint(null);
        void handleSubmitMove(result.submitText);
        return;
      }
      if (result.illegal) {
        setVoiceHint('Illegal move');
        return;
      }
      setVoiceHint('Check move and tap Play');
    },
    [handleSubmitMove, presentVoiceDisambiguation],
  );

  const {
    status: speechStatus,
    isListening,
    listeningSource,
    interimTranscript,
    speechError,
    startListening,
    stopListening,
    toggleListening,
    clearSpeechError,
  } = useMatchSpeech({
    enabled: voiceEnabled,
    fen,
    listenMode: voiceListenMode,
    disambiguation,
    onTranscript: handleVoiceTranscript,
  });

  const submitMoveFromPanel = useCallback(
    (move: string) => {
      clearSpeechError();
      setVoiceHint(null);
      void handleSubmitMove(move);
    },
    [clearSpeechError, handleSubmitMove],
  );

  useEffect(() => {
    if (isListening && interimTranscript) {
      setMoveDraft(interimTranscript);
    }
  }, [isListening, interimTranscript]);

  useEffect(() => {
    if (!voiceEnabled) {
      setMoveDraft('');
      autoStartedRef.current = false;
    }
  }, [voiceEnabled]);

  useEffect(() => {
    const becameEnabled = voiceEnabled && !prevVoiceEnabledRef.current;
    prevVoiceEnabledRef.current = voiceEnabled;

    if (!becameEnabled || voiceListenMode !== 'auto') return;
    if (autoStartedRef.current) return;

    autoStartedRef.current = true;
    void startListening('auto');
  }, [voiceEnabled, voiceListenMode, startListening]);

  useEffect(() => {
    if (!disambiguation || voiceListenMode !== 'auto' || !voiceEnabled) return;
    if (isListening) return;
    void startListening('auto');
  }, [disambiguation, voiceListenMode, voiceEnabled, isListening, startListening]);

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
        : isSubmittingMove
          ? { text: 'Sending your move…', tone: 'action' }
          : waitingForEngine
            ? { text: 'Engine thinking…', tone: 'action' }
            : { text: `Your move — you play ${colorLabel}`, tone: 'action' };

  const handleMicTap = useCallback(() => {
    clearMoveError();
    clearSpeechError();
    if (voiceListenMode === 'auto') {
      if (isListening) {
        void stopListening({ submit: false });
      } else {
        void startListening('manual');
      }
      return;
    }
    void toggleListening();
  }, [
    clearMoveError,
    clearSpeechError,
    isListening,
    startListening,
    stopListening,
    toggleListening,
    voiceListenMode,
  ]);

  const handleMicHoldStart = useCallback(() => {
    clearMoveError();
    clearSpeechError();
    void startListening('hold');
  }, [clearMoveError, clearSpeechError, startListening]);

  const handleMicHoldEnd = useCallback(() => {
    void stopListening({ submit: true });
  }, [stopListening]);

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
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <MatchStatusBar
            elo={matchElo}
            loading={isSubmittingMove || waitingForEngine}
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
              {!disambiguation ? (
                <MatchMovePanel
                  inputDisabled={!voiceEnabled || waitingForEngine}
                  showMoveInput={showMoveInput}
                  isListening={isListening}
                  isSubmittingMove={isSubmittingMove}
                  lastEngineMove={lastEngineMove}
                  lastPlayerMove={lastPlayerMove}
                  listeningSource={listeningSource}
                  moveDraft={moveDraft}
                  moveError={moveError}
                  onClearError={() => {
                    clearMoveError();
                    clearSpeechError();
                  }}
                  onMicHoldEnd={handleMicHoldEnd}
                  onMicHoldStart={handleMicHoldStart}
                  onMicTap={handleMicTap}
                  onMoveDraftChange={setMoveDraft}
                  onSubmit={submitMoveFromPanel}
                  speechError={speechError}
                  voiceHint={voiceHint}
                  speechStatus={speechStatus}
                  waitingForEngine={waitingForEngine}
                />
              ) : null}
              <MatchControlBar
                covered={fullyCovered}
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

      <DisambiguationOverlay
        candidates={disambiguation?.candidates ?? []}
        inputDisabled={!voiceEnabled || isSubmittingMove}
        isListening={isListening}
        listeningSource={listeningSource}
        moveDraft={moveDraft}
        moveError={moveError}
        onCancel={cancelDisambiguation}
        onClearError={() => {
          clearMoveError();
          clearSpeechError();
        }}
        onMicHoldEnd={handleMicHoldEnd}
        onMicHoldStart={handleMicHoldStart}
        onMicTap={handleMicTap}
        onMoveDraftChange={setMoveDraft}
        onSelect={(san) => {
          applyMoveWithFeedback(() => chooseDisambiguation(san));
        }}
        onSubmit={submitMoveFromPanel}
        prompt={disambiguation?.prompt ?? ''}
        speechError={speechError}
        speechStatus={speechStatus}
        voiceHint={voiceHint}
        visible={Boolean(disambiguation)}
      />
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
