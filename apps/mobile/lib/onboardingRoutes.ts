import type { OnboardingStep } from '@mindboard/shared';

export const ONBOARDING_STEP_ROUTES: Record<OnboardingStep, string> = {
  hook: '/(onboarding)/hook',
  'story-check': '/(onboarding)/story-check',
  'reward-1': '/(onboarding)/reward/1',
  'reward-2': '/(onboarding)/reward/2',
  'fog-reveal': '/(onboarding)/fog-reveal',
  'match-primer': '/(onboarding)/match-primer',
  complete: '/(main)',
};

export const ONBOARDING_STEP_ORDER: OnboardingStep[] = [
  'hook',
  'story-check',
  'reward-1',
  'reward-2',
  'fog-reveal',
  'match-primer',
  'complete',
];

/** Gate redirect for incomplete onboarding — resumes at the last persisted step. */
export function onboardingEntryRoute(step: OnboardingStep): string {
  return ONBOARDING_STEP_ROUTES[step];
}
