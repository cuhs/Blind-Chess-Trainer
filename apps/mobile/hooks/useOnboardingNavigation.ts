import { useRouter } from 'expo-router';
import type { OnboardingStep } from '@mindboard/shared';
import {
  ONBOARDING_STEP_ORDER,
  ONBOARDING_STEP_ROUTES,
} from '@/lib/onboardingRoutes';
import { useOnboardingStore } from './useOnboardingStore';

const PROGRESS_LABELS: Partial<Record<OnboardingStep, string>> = {
  hook: 'Level 1: The Hook',
  'story-check': 'Level 1: First Story',
  'reward-1': 'Level 1: Reward',
  'reward-2': 'Level 1: Reward',
  'fog-reveal': 'Level 1: Fog Reveal',
  'match-primer': 'Level 1: Match Primer',
};

const PROGRESS_PERCENTS: Partial<Record<OnboardingStep, number>> = {
  hook: 25,
  'story-check': 40,
  'reward-1': 55,
  'reward-2': 70,
  'fog-reveal': 85,
  'match-primer': 100,
};

export function useOnboardingNavigation(currentStep: OnboardingStep) {
  const router = useRouter();
  const { setCurrentStep } = useOnboardingStore();

  const advance = () => {
    const idx = ONBOARDING_STEP_ORDER.indexOf(currentStep);
    const next = ONBOARDING_STEP_ORDER[idx + 1];
    if (!next) return;
    setCurrentStep(next);
    router.replace(ONBOARDING_STEP_ROUTES[next] as never);
  };

  const progressLabel = () => PROGRESS_LABELS[currentStep] ?? 'Level 1';

  const progressPercent = () => PROGRESS_PERCENTS[currentStep] ?? 0;

  return { advance, progressLabel, progressPercent, STEP_ROUTES: ONBOARDING_STEP_ROUTES };
}
