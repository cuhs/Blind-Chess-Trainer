import { useGuestStore } from '@/stores/guestStore';

export function useOnboardingStore() {
  const currentStep = useGuestStore((s) => s.currentOnboardingStep);
  const answers = useGuestStore((s) => s.onboardingAnswers);
  const setCurrentStep = useGuestStore((s) => s.setCurrentStep);
  const recordAnswer = useGuestStore((s) => s.recordAnswer);
  const recordSquareInteractions = useGuestStore((s) => s.recordSquareInteractions);

  return {
    currentStep,
    answers,
    setCurrentStep,
    recordAnswer,
    recordSquareInteractions,
  };
}
