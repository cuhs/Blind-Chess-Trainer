import { describe, expect, it } from 'vitest';
import {
  ONBOARDING_STEP_ORDER,
  ONBOARDING_STEP_ROUTES,
  onboardingEntryRoute,
} from './onboardingRoutes';

describe('onboardingEntryRoute', () => {
  it('maps each step to its Expo route', () => {
    for (const step of ONBOARDING_STEP_ORDER) {
      expect(onboardingEntryRoute(step)).toBe(ONBOARDING_STEP_ROUTES[step]);
    }
  });

  it('sends complete step to main tabs', () => {
    expect(onboardingEntryRoute('complete')).toBe('/(main)');
  });
});
