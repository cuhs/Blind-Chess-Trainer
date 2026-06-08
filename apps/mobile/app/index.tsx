import { Redirect } from 'expo-router';
import { useGuestStore } from '@/stores/guestStore';

export default function Index() {
  const onboardingComplete = useGuestStore((s) => s.onboardingComplete);

  if (onboardingComplete) {
    return <Redirect href="/(main)" />;
  }

  return <Redirect href="/(onboarding)/hook" />;
}
