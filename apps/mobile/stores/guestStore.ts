import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { positionKeyFromFen } from '@mindboard/chess-core';
import type {
  OnboardingAnswer,
  OnboardingStep,
  PeekEvent,
  Square,
} from '@mindboard/shared';
import type { DrillProgress } from '@/lib/drillProgress';
import { todayKey } from '@/lib/dateKey';

export type HeatmapInteractionType = 'puzzle' | 'match_peek';

export interface PendingHeatmapInteraction {
  id: string;
  originSquare: Square | null;
  targetSquare: Square;
  isSuccess: boolean;
  interactionType: HeatmapInteractionType;
  createdAt: string;
}

interface GuestState {
  onboardingComplete: boolean;
  currentOnboardingStep: OnboardingStep;
  heatmapLedger: Partial<Record<Square, number>>;
  heatmapLedgerSyncedAt: string | null;
  pendingHeatmapInteractions: PendingHeatmapInteraction[];
  onboardingAnswers: OnboardingAnswer[];
  trainingAnswers: OnboardingAnswer[];
  streakDays: number;
  lastActiveDate: string | null;
  lastDrillCompletedDate: string | null;
  drillProgress: DrillProgress | null;
  peekEvents: PeekEvent[];
  matchElo: number;
  matchPlayerColor: 'w' | 'b';
  _hasHydrated: boolean;

  setOnboardingComplete: (complete: boolean) => void;
  setCurrentStep: (step: OnboardingStep) => void;
  recordAnswer: (answer: OnboardingAnswer) => void;
  recordTrainingAnswer: (answer: OnboardingAnswer) => void;
  mergeHeatmapLedger: (ledger: Partial<Record<Square, number>>) => void;
  recordHeatmapInteractions: (
    squares: Square[],
    options: {
      isSuccess: boolean;
      interactionType?: HeatmapInteractionType;
      originSquare?: Square | null;
    },
  ) => void;
  recordSquareInteraction: (square: Square) => void;
  recordSquareInteractions: (squares: Square[]) => void;
  removePendingHeatmapInteractions: (ids: string[]) => void;
  addPeekEvent: (event: PeekEvent) => void;
  setStreakDays: (days: number) => void;
  setLastActiveDate: (date: string) => void;
  setLastDrillCompletedDate: (date: string) => void;
  recordDrillPuzzleComplete: (puzzleId: string) => void;
  clearDrillProgress: () => void;
  setMatchElo: (elo: number) => void;
  setMatchPlayerColor: (color: 'w' | 'b') => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      onboardingComplete: false,
      currentOnboardingStep: 'hook',
      heatmapLedger: {},
      heatmapLedgerSyncedAt: null,
      pendingHeatmapInteractions: [],
      onboardingAnswers: [],
      trainingAnswers: [],
      streakDays: 0,
      lastActiveDate: null,
      lastDrillCompletedDate: null,
      drillProgress: null,
      peekEvents: [],
      matchElo: 800,
      matchPlayerColor: 'w',
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

      mergeHeatmapLedger: (remoteLedger) =>
        set((state) => {
          const ledger = { ...state.heatmapLedger };
          for (const [square, interactions] of Object.entries(remoteLedger)) {
            const typedSquare = square as Square;
            ledger[typedSquare] = Math.max(
              ledger[typedSquare] ?? 0,
              interactions ?? 0,
            );
          }

          return {
            heatmapLedger: ledger,
            heatmapLedgerSyncedAt: new Date().toISOString(),
          };
        }),

      recordHeatmapInteractions: (squares, options) => {
        const createdAt = new Date().toISOString();
        const ledger = { ...get().heatmapLedger };
        const pending = [...get().pendingHeatmapInteractions];

        for (const square of squares) {
          if (options.isSuccess) {
            ledger[square] = (ledger[square] ?? 0) + 1;
          }

          pending.push({
            // Random suffix guarantees uniqueness across batches created in
            // the same millisecond — this id doubles as the server-side
            // idempotency key (heatmap_ledger.client_event_id).
            id: `${createdAt}-${square}-${Math.random().toString(36).slice(2, 10)}`,
            originSquare: options.originSquare ?? null,
            targetSquare: square,
            isSuccess: options.isSuccess,
            interactionType: options.interactionType ?? 'puzzle',
            createdAt,
          });
        }

        set({ heatmapLedger: ledger, pendingHeatmapInteractions: pending });
      },

      recordSquareInteraction: (square) => {
        get().recordHeatmapInteractions([square], { isSuccess: true });
      },

      recordSquareInteractions: (squares) => {
        get().recordHeatmapInteractions(squares, { isSuccess: true });
      },

      removePendingHeatmapInteractions: (ids) =>
        set((state) => ({
          pendingHeatmapInteractions: state.pendingHeatmapInteractions.filter(
            (event) => !ids.includes(event.id),
          ),
        })),

      addPeekEvent: (event) =>
        set((state) => {
          const positionKey = positionKeyFromFen(event.fen);
          const alreadyPeaked = state.peekEvents.some(
            (existing) => positionKeyFromFen(existing.fen) === positionKey,
          );
          if (alreadyPeaked) return state;
          return { peekEvents: [...state.peekEvents, event] };
        }),

      setStreakDays: (days) => set({ streakDays: days }),

      setLastActiveDate: (date) => set({ lastActiveDate: date }),

      setLastDrillCompletedDate: (date) =>
        set({ lastDrillCompletedDate: date }),

      recordDrillPuzzleComplete: (puzzleId) =>
        set((state) => {
          const today = todayKey();
          const existing =
            state.drillProgress?.dateKey === today
              ? state.drillProgress.completedPuzzleIds
              : [];
          if (existing.includes(puzzleId)) return state;

          return {
            drillProgress: {
              dateKey: today,
              completedPuzzleIds: [...existing, puzzleId],
            },
          };
        }),

      clearDrillProgress: () => set({ drillProgress: null }),

      setMatchElo: (elo) => set({ matchElo: elo }),

      setMatchPlayerColor: (color) => set({ matchPlayerColor: color }),

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
        heatmapLedgerSyncedAt: state.heatmapLedgerSyncedAt,
        pendingHeatmapInteractions: state.pendingHeatmapInteractions,
        onboardingAnswers: state.onboardingAnswers,
        trainingAnswers: state.trainingAnswers,
        streakDays: state.streakDays,
        lastActiveDate: state.lastActiveDate,
        lastDrillCompletedDate: state.lastDrillCompletedDate,
        drillProgress: state.drillProgress,
        peekEvents: state.peekEvents,
        matchElo: state.matchElo,
        matchPlayerColor: state.matchPlayerColor,
      }),
    },
  ),
);
