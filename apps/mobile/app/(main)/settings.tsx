import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';
import { SettingsIcon } from '@/components/ui/icons/SettingsIcon';
import { colors } from '@/theme';

export default function SettingsRoute() {
  return (
    <PlaceholderScreen
      badge="Coming soon"
      title="Settings"
      body="Account, preferences, and accessibility options are on the way."
      icon={<SettingsIcon color={colors.onSurface} size={40} />}
    />
  );
}
