import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
import { PromptText } from '@/components/ui/PromptText';
import { PuzzleBoard } from '@/components/chess/PuzzleBoard';
import { AnswerFlashOverlay } from '@/components/ui/AnswerFlashOverlay';
import { ScrollAnswerCue } from '@/components/training/ScrollAnswerCue';
import type { FlashKind } from '@/hooks/useAnswerFlash';

export const MEMORIZE_PROMPT = 'Look closely. You have 5 seconds.';
export const LISTENING_PROMPT = 'Listen closely. Moves are read aloud.';

interface PuzzleSessionLayoutProps {
  /** Progress chrome element (e.g. <ProgressChrome />). */
  chrome: ReactNode;
  isMemorizing: boolean;
  /** Move narration in progress — blank screen, no board. */
  isListening?: boolean;
  /** Prompt shown once the board is hidden (puzzle question / result copy). */
  prompt: string;
  /** Subtitle shown during board memorize only — never during move narration. */
  memorizeSubtitle?: string;
  board: {
    fen: string;
    boardKey?: string;
    peekVisible: boolean;
    /** Defaults to `isMemorizing`; pass explicitly to keep the board hidden (e.g. on completion). */
    showBoard?: boolean;
  };
  /** Answer controls (SquareKeypad, YesNoZone, buttons). Rendered in a spaced container when present. */
  children?: ReactNode;
  /** Optional answer-feedback color wash driven by `useAnswerFlash`. */
  flash?: { opacity: Animated.Value; kind: FlashKind };
}

/**
 * Shared shell for active-recall puzzle drills (onboarding hook/story/reward +
 * DailyDrill). Owns the SafeArea + scroll + header + memorize-prompt logic so
 * each screen only supplies its chrome, copy, board data, and controls.
 */
export function PuzzleSessionLayout({
  chrome,
  isMemorizing,
  isListening = false,
  prompt,
  memorizeSubtitle,
  board,
  children,
  flash,
}: PuzzleSessionLayoutProps) {
  const scrollRef = useRef<ScrollView>(null);

  const isPreparing = isMemorizing || isListening;
  const preparingPrompt = isListening
    ? LISTENING_PROMPT
    : isMemorizing
      ? MEMORIZE_PROMPT
      : prompt;
  const showBoard = board.showBoard ?? isMemorizing;
  const hasControls = children != null;
  const showAnswerCue = hasControls && !isPreparing;

  useEffect(() => {
    if (!showAnswerCue) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [showAnswerCue, board.boardKey]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        <AppHeader showSettings={false} />

        {chrome}

        <PromptText
          highlight={isMemorizing ? '5' : undefined}
          subtitle={isMemorizing ? memorizeSubtitle : undefined}
          variant={isPreparing ? 'hero' : 'default'}
        >
          {isPreparing ? preparingPrompt : prompt}
        </PromptText>

        {showAnswerCue ? <ScrollAnswerCue /> : null}

        <View style={styles.boardWrap}>
          <PuzzleBoard
            boardKey={board.boardKey}
            fen={board.fen}
            isMemorizing={showBoard}
            peekVisible={board.peekVisible}
          />
        </View>

        {children ? <View style={styles.controls}>{children}</View> : null}
      </ScrollView>

      {flash ? (
        <AnswerFlashOverlay kind={flash.kind} opacity={flash.opacity} />
      ) : null}
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
    paddingBottom: spacing.xl,
  },
  boardWrap: {
    alignItems: 'center',
    marginBottom: spacing.sectionGap,
  },
  controls: {
    gap: spacing.md,
  },
});
