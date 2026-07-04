import { useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, touch, typography } from '@/theme';
import { CheckIcon } from '@/components/ui/icons/CheckIcon';
import { CloseIcon } from '@/components/ui/icons/CloseIcon';

type YesNo = 'yes' | 'no';

interface YesNoZoneProps {
  /** Fires with the registered answer. */
  onAnswer: (value: YesNo) => void;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 56;
const LOCK_MS = 550;

/**
 * Gesture answer zone for `yes-no` puzzles. Swipe right / tap the right half =
 * Yes; swipe left / tap the left half = No. Each choice briefly flashes its
 * side and fires a directional haptic before reporting the answer.
 */
export function YesNoZone({ onAnswer, disabled }: YesNoZoneProps) {
  const [active, setActive] = useState<YesNo | null>(null);
  const lockedRef = useRef(false);

  const choose = (value: YesNo) => {
    if (disabled || lockedRef.current) return;
    lockedRef.current = true;
    setActive(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAnswer(value);
    setTimeout(() => {
      setActive(null);
      lockedRef.current = false;
    }, LOCK_MS);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_e, g) => {
        if (g.dx >= SWIPE_THRESHOLD) choose('yes');
        else if (g.dx <= -SWIPE_THRESHOLD) choose('no');
      },
    }),
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Pressable
        accessibilityHint="Tap or swipe left"
        accessibilityLabel="No"
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => choose('no')}
        style={[
          styles.half,
          styles.halfLeft,
          styles.noHalf,
          active === 'no' && styles.noActive,
        ]}
      >
        <CloseIcon
          color={active === 'no' ? colors.onError : colors.error}
          size={40}
        />
        <Text style={[styles.label, active === 'no' && styles.labelActive]}>
          No
        </Text>
        <Text style={[styles.hint, active === 'no' && styles.hintActive]}>
          Tap or swipe ←
        </Text>
      </Pressable>

      <Pressable
        accessibilityHint="Tap or swipe right"
        accessibilityLabel="Yes"
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => choose('yes')}
        style={[
          styles.half,
          styles.halfRight,
          styles.yesHalf,
          active === 'yes' && styles.yesActive,
        ]}
      >
        <CheckIcon
          color={active === 'yes' ? colors.onPrimary : colors.primary}
          size={40}
        />
        <Text style={[styles.label, active === 'yes' && styles.labelActive]}>
          Yes
        </Text>
        <Text style={[styles.hint, active === 'yes' && styles.hintActive]}>
          → Tap or swipe
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 200,
  },
  half: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: touch.strokeWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  halfLeft: {},
  halfRight: {},
  noHalf: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
  },
  noActive: {
    backgroundColor: colors.error,
  },
  yesHalf: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.primary,
  },
  yesActive: {
    backgroundColor: colors.primaryContainer,
  },
  label: {
    ...typography.headlineLg,
    color: colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelActive: {
    color: colors.onPrimary,
  },
  hint: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hintActive: {
    color: colors.onPrimary,
  },
});
