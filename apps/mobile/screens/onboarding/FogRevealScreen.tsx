// Stitch frame: 61ce6c33f6fe4350b176eb6cd2ddace6 (read-only variant)
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { InteractiveHeatmap } from '@/components/heatmap/InteractiveHeatmap';
import { HeatmapStats } from '@/components/heatmap/HeatmapStats';
import { HeatmapLegend } from '@/components/heatmap/HeatmapLegend';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { HeroCopy } from '@/components/ui/HeroCopy';
import { ProgressChrome } from '@/components/ui/ProgressChrome';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useFogClearedPercent } from '@/hooks/useFogClearedPercent';

export function FogRevealScreen() {
  const { advance, progressLabel, progressPercent } =
    useOnboardingNavigation('fog-reveal');
  const { clarityPercent, masteryCount } = useFogClearedPercent();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader showSettings={false} />

        <ProgressChrome label={progressLabel()} percent={progressPercent()} />

        <View style={styles.hero}>
          <HeroCopy
            title="Cognitive Heatmap"
            subtitle="Your mental map of the board. Clear the fog to master the game."
          />
        </View>

        <HeatmapStats
          clarityPercent={clarityPercent}
          masteryCount={masteryCount}
        />

        <InteractiveHeatmap interactive={false} />

        <HeatmapLegend />

        <View style={styles.cta}>
          <PrimaryButton label="Continue" onPress={advance} />
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
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.xl,
  },
  hero: {
    marginBottom: spacing.md,
  },
  cta: {
    marginTop: spacing.sectionGap,
  },
});
