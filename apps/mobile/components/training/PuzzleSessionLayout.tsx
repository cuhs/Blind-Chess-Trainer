import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { AppHeader } from '@/components/ui/AppHeader';
import { PromptText } from '@/components/ui/PromptText';
import { PuzzleBoard } from '@/components/chess/PuzzleBoard';
import { AnswerFlashOverlay } from '@/components/ui/AnswerFlashOverlay';
import { ScrollAnswerCue } from '@/components/training/ScrollAnswerCue';
import { PeekButton } from '@/components/onboarding/PeekButton';
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
  /**
   * Pass the screen's `triggerPeek` while the user may answer. Renders the
   * peek chip directly under the board so the reveal happens where they tap.
   */
  onPeek?: () => void;
  /** Answer controls (SquareKeypad, YesNoZone, buttons). Rendered in a spaced container when present. */
  children?: ReactNode;
  /** Optional answer-feedback color wash driven by `useAnswerFlash`. */
  flash?: { opacity: Animated.Value; kind: FlashKind };
}

/**
 * Shared shell for active-recall puzzle drills (onboarding hook/story/reward +
 * DailyDrill). Owns the SafeArea + scroll + header + memorize-prompt logic,
 * plus the scroll-to-answer cue and peek affordance, so each screen only
 * supplies its chrome, copy, board data, and controls.
 */
export function PuzzleSessionLayout({
  chrome,
  isMemorizing,
  isListening = false,
  prompt,
  memorizeSubtitle,
  board,
  onPeek,
  children,
  flash,
}: PuzzleSessionLayoutProps) {
  const scrollRef = useRef<ScrollView>(null);
  const boardYRef = useRef(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const isPreparing = isMemorizing || isListening;
  const preparingPrompt = isListening
    ? LISTENING_PROMPT
    : isMemorizing
      ? MEMORIZE_PROMPT
      : prompt;
  const showBoard = board.showBoard ?? isMemorizing;
  const hasControls = children != null;
  const isAnswering = hasControls && !isPreparing;
  const contentOverflows =
    viewportHeight > 0 && contentHeight > viewportHeight + 1;
  // Only hint at scrolling when the controls are actually below the fold.
  const showAnswerCue = isAnswering && contentOverflows;
  const showPeek = onPeek != null && !isPreparing;

  useEffect(() => {
    if (!isAnswering) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [isAnswering, board.boardKey]);

  const handlePeek = () => {
    onPeek?.();
    // Bring the revealed board fully into view so the peek lands on-screen.
    scrollRef.current?.scrollTo({
      y: Math.max(boardYRef.current - spacing.sm, 0),
      animated: true,
    });
  };

  const handleCuePress = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={(_width, height) => setContentHeight(height)}
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
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

        {showAnswerCue ? <ScrollAnswerCue onPress={handleCuePress} /> : null}

        <View
          style={styles.boardWrap}
          onLayout={(event) => {
            boardYRef.current = event.nativeEvent.layout.y;
          }}
        >
          <PuzzleBoard
            boardKey={board.boardKey}
            fen={board.fen}
            isMemorizing={showBoard}
            peekVisible={board.peekVisible}
          />
          {showPeek ? <PeekButton onPress={handlePeek} /> : null}
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
    gap: spacing.md,
    marginBottom: spacing.sectionGap,
  },
  controls: {
    gap: spacing.md,
  },
});
