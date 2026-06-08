import { useLocalSearchParams } from 'expo-router';
import { RewardPuzzleScreen } from '@/screens/onboarding/RewardPuzzleScreen';

export default function RewardRoute() {
  const { index } = useLocalSearchParams<{ index: string }>();
  const puzzleIndex = parseInt(index ?? '1', 10);

  return <RewardPuzzleScreen index={puzzleIndex} />;
}
