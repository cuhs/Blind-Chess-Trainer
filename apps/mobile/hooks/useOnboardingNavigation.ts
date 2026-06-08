import { useRouter } from 'expo-router';
import type { OnboardingStep } from '@mindboard/shared';
import { useOnboardingStore } from './useOnboardingStore';

const STEP_ROUTES: Record<OnboardingStep, string> = {
  hook: '/(onboarding)/hook',
  'story-check': '/(onboarding)/story-check',
  'reward-1': '/(onboarding)/reward/1',
  'reward-2': '/(onboarding)/reward/2',
  'fog-reveal': '/(onboarding)/fog-reveal',
  'match-primer': '/(onboarding)/match-primer',
  complete: '/(main)',
};

const STEP_ORDER: OnboardingStep[] = [
  'hook',
  'story-check',
  'reward-1',
  'reward-2',
  'fog-reveal',
  'match-primer',
  'complete',
];

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
    const idx = STEP_ORDER.indexOf(currentStep);
    const next = STEP_ORDER[idx + 1];
    if (!next) return;
    setCurrentStep(next);
    router.replace(STEP_ROUTES[next] as never);
  };

  const progressLabel = () => {
    const label = PROGRESS_LABELS[currentStep] ?? 'Level 1';
    const percent = PROGRESS_PERCENTS[currentStep] ?? 0;
    return `${label} ${percent}%`;
  };

  const progressPercent = () => PROGRESS_PERCENTS[currentStep] ?? 0;

  return { advance, progressLabel, progressPercent, STEP_ROUTES };
}
