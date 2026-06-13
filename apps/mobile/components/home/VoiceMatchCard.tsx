import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, touch, typography } from '@/theme';
import { Card } from '@/components/ui/Card';
import { BlindfoldIcon } from '@/components/ui/icons/BlindfoldIcon';
import { ChevronRightIcon } from '@/components/ui/icons/ChevronRightIcon';

interface VoiceMatchCardProps {
  onPress: () => void;
}

export function VoiceMatchCard({ onPress }: VoiceMatchCardProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityLabel="Start Blindfold Match"
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.pressable,
        {
          transform: [{ translateY: pressed ? touch.buttonOffset : 0 }],
          marginBottom: pressed ? 0 : touch.buttonOffset,
        },
      ]}
    >
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.lead}>
            <View style={styles.iconCircle}>
              <BlindfoldIcon color={colors.onSecondaryContainer} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>Start Blindfold Match</Text>
            </View>
          </View>
          <ChevronRightIcon />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.lg,
  },
  card: {
    marginBottom: 0,
    borderColor: colors.surfaceContainerHigh,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    lineHeight: 26,
  },
});
