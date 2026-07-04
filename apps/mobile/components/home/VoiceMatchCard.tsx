import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { Card } from '@/components/ui/Card';
import { BlindfoldIcon } from '@/components/ui/icons/BlindfoldIcon';
import { ChevronRightIcon } from '@/components/ui/icons/ChevronRightIcon';

interface VoiceMatchCardProps {
  onPress: () => void;
}

export function VoiceMatchCard({ onPress }: VoiceMatchCardProps) {
  return (
    <Pressable
      accessibilityLabel="Start Blindfold Match"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <Card>
        <View style={styles.row}>
          <View style={styles.lead}>
            <View style={styles.iconCircle}>
              <BlindfoldIcon color={colors.onSecondaryContainer} />
            </View>
            <Text style={styles.title}>Start Blindfold Match</Text>
          </View>
          <ChevronRightIcon color={colors.outline} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.lg,
  },
  pressed: {
    opacity: 0.85,
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
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    flex: 1,
  },
});
