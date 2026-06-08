import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  OnboardingAnswer,
  OnboardingStep,
  PeekEvent,
  Square,
} from '@mindboard/shared';

interface GuestState {
  onboardingComplete: boolean;
  currentOnboardingStep: OnboardingStep;
  heatmapLedger: Partial<Record<Square, number>>;
  onboardingAnswers: OnboardingAnswer[];
  trainingAnswers: OnboardingAnswer[];
  streakDays: number;
  lastActiveDate: string | null;
  lastDrillCompletedDate: string | null;
  peekEvents: PeekEvent[];
  matchElo: number;
  _hasHydrated: boolean;

  setOnboardingComplete: (complete: boolean) => void;
  setCurrentStep: (step: OnboardingStep) => void;
  recordAnswer: (answer: OnboardingAnswer) => void;
  recordTrainingAnswer: (answer: OnboardingAnswer) => void;
  recordSquareInteraction: (square: Square) => void;
  recordSquareInteractions: (squares: Square[]) => void;
  addPeekEvent: (event: PeekEvent) => void;
  setStreakDays: (days: number) => void;
  setLastActiveDate: (date: string) => void;
  setLastDrillCompletedDate: (date: string) => void;
  setMatchElo: (elo: number) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      onboardingComplete: false,
      currentOnboardingStep: 'hook',
      heatmapLedger: {},
      onboardingAnswers: [],
      trainingAnswers: [],
      streakDays: 0,
      lastActiveDate: null,
      lastDrillCompletedDate: null,
      peekEvents: [],
      matchElo: 1200,
      _hasHydrated: false,

      setOnboardingComplete: (complete) =>
        set({ onboardingComplete: complete, currentOnboardingStep: 'complete' }),

      setCurrentStep: (step) => set({ currentOnboardingStep: step }),

      recordAnswer: (answer) =>
        set((state) => ({
          onboardingAnswers: [...state.onboardingAnswers, answer],
        })),

      recordTrainingAnswer: (answer) =>
        set((state) => ({
          trainingAnswers: [...state.trainingAnswers, answer],
        })),

      recordSquareInteraction: (square) => {
        const ledger = { ...get().heatmapLedger };
        ledger[square] = (ledger[square] ?? 0) + 1;
        set({ heatmapLedger: ledger });
      },

      recordSquareInteractions: (squares) => {
        const ledger = { ...get().heatmapLedger };
        for (const square of squares) {
          ledger[square] = (ledger[square] ?? 0) + 1;
        }
        set({ heatmapLedger: ledger });
      },

      addPeekEvent: (event) =>
        set((state) => ({ peekEvents: [...state.peekEvents, event] })),

      setStreakDays: (days) => set({ streakDays: days }),

      setLastActiveDate: (date) => set({ lastActiveDate: date }),

      setLastDrillCompletedDate: (date) =>
        set({ lastDrillCompletedDate: date }),

      setMatchElo: (elo) => set({ matchElo: elo }),

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: '@mindboard/guest',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        onboardingComplete: state.onboardingComplete,
        currentOnboardingStep: state.currentOnboardingStep,
        heatmapLedger: state.heatmapLedger,
        onboardingAnswers: state.onboardingAnswers,
        trainingAnswers: state.trainingAnswers,
        streakDays: state.streakDays,
        lastActiveDate: state.lastActiveDate,
        lastDrillCompletedDate: state.lastDrillCompletedDate,
        peekEvents: state.peekEvents,
        matchElo: state.matchElo,
      }),
    },
  ),
);
