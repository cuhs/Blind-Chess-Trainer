import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';
import { MicIcon } from '@/components/ui/icons/MicIcon';

export default function MatchRoute() {
  return (
    <PlaceholderScreen
      badge="Phase 3"
      title="Blindfold Match"
      body="Voice-first, hands-free gameplay against Stockfish. Speak your moves, peek freely, and let your mistakes build tomorrow's puzzles."
      icon={<MicIcon size={40} />}
    />
  );
}
