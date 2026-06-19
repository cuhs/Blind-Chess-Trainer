import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';
import { AnalysisTabIcon } from '@/components/ui/icons/TabIcons';
import { colors } from '@/theme';

export default function AnalysisRoute() {
  return (
    <PlaceholderScreen
      badge="Phase 4"
      title="Game Analysis"
      body="Replay your blindfold matches, review peeks, and spot patterns after each game."
      icon={<AnalysisTabIcon color={colors.onSurface} filled size={40} />}
    />
  );
}
