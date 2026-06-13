import { Redirect } from 'expo-router';
import { useGuestStore } from '@/stores/guestStore';
import { onboardingEntryRoute } from '@/lib/onboardingRoutes';

export default function Index() {
  const onboardingComplete = useGuestStore((s) => s.onboardingComplete);
  const currentStep = useGuestStore((s) => s.currentOnboardingStep);

  if (onboardingComplete) {
    return <Redirect href="/(main)" />;
  }

  return <Redirect href={onboardingEntryRoute(currentStep) as never} />;
}
