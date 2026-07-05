import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appendMatchRecord, positionKeyFromFen } from '@mindboard/chess-core';
import {
  EMPTY_TRAINING_PROGRESS,
  type MatchRecord,
  type NodeSessionProgress,
  type NodeStarRating,
  type OnboardingAnswer,
  type OnboardingStep,
  type PeekEvent,
  type Square,
  type TrainingProgress,
} from '@mindboard/shared';
import type { DrillProgress } from '@/lib/drillProgress';
import {
  applyDailyDrillCompletion,
  applyDrillCompletedDate,
} from '@/lib/drillCompletion';
import { todayKey } from '@/lib/dateKey';
import { nextStreakDays } from '@/lib/streak';
import {
  applyNodeCompletion,
  setActiveNode,
} from '@/lib/trainingProgress';
import { onboardingTrainingProgress } from '@/lib/onboardingCurriculumBridge';

export type HeatmapInteractionType = 'puzzle' | 'match_peek';

/** Auto-arms mic on your turn; manual requires tap to arm. Hold-to-speak works in both. */
export type VoiceListenMode = 'auto' | 'manual';

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
  trainingProgress: TrainingProgress;
  nodeSessionProgress: NodeSessionProgress | null;
  peekEvents: PeekEvent[];
  matchHistory: MatchRecord[];
  matchElo: number;
  matchPlayerColor: 'w' | 'b';
  voiceListenMode: VoiceListenMode;
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
  addMatchRecord: (record: MatchRecord) => void;
  setStreakDays: (days: number) => void;
  setLastActiveDate: (date: string) => void;
  recordHabitActivity: (date?: string) => void;
  setLastDrillCompletedDate: (date: string) => void;
  completeDailyDrill: (date?: string) => void;
  recordDrillPuzzleComplete: (puzzleId: string) => void;
  clearDrillProgress: () => void;
  setTrainingProgress: (progress: TrainingProgress) => void;
  setActiveTrainingNode: (nodeId: string | null) => void;
  recordNodePuzzleComplete: (nodeId: string, puzzleId: string) => void;
  clearNodeSessionProgress: () => void;
  completeTrainingNode: (nodeId: string, stars: NodeStarRating) => void;
  setMatchElo: (elo: number) => void;
  setMatchPlayerColor: (color: 'w' | 'b') => void;
  setVoiceListenMode: (mode: VoiceListenMode) => void;
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
      trainingProgress: { ...EMPTY_TRAINING_PROGRESS },
      nodeSessionProgress: null,
      peekEvents: [],
      matchHistory: [],
      matchElo: 800,
      matchPlayerColor: 'w',
      voiceListenMode: 'auto',
      _hasHydrated: false,

      setOnboardingComplete: (complete) =>
        set((state) => {
          if (!complete) {
            return {
              onboardingComplete: false,
              currentOnboardingStep: 'complete' as const,
            };
          }
          return {
            onboardingComplete: true,
            currentOnboardingStep: 'complete' as const,
            trainingProgress: state.trainingProgress.completedNodeIds.length
              ? state.trainingProgress
              : onboardingTrainingProgress(),
          };
        }),

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

      addMatchRecord: (record) =>
        set((state) => {
          if (state.matchHistory.some((existing) => existing.id === record.id)) {
            return state;
          }
          return {
            matchHistory: appendMatchRecord(state.matchHistory, record),
          };
        }),

      setStreakDays: (days) => set({ streakDays: days }),

      setLastActiveDate: (date) => set({ lastActiveDate: date }),

      recordHabitActivity: (date = todayKey()) =>
        set((state) => {
          const next = nextStreakDays(
            state.lastActiveDate,
            state.streakDays,
            date,
          );
          if (
            next.lastActiveDate === state.lastActiveDate &&
            next.streakDays === state.streakDays
          ) {
            return state;
          }
          return next;
        }),

      setLastDrillCompletedDate: (date) =>
        set((state) => ({
          ...state,
          ...applyDrillCompletedDate(state, date),
        })),

      completeDailyDrill: (date = todayKey()) =>
        set((state) => ({
          ...state,
          ...applyDailyDrillCompletion(state, date),
        })),

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

      setTrainingProgress: (progress) => set({ trainingProgress: progress }),

      setActiveTrainingNode: (nodeId) =>
        set((state) => ({
          trainingProgress: setActiveNode(state.trainingProgress, nodeId),
        })),

      recordNodePuzzleComplete: (nodeId, puzzleId) =>
        set((state) => {
          const existing =
            state.nodeSessionProgress?.nodeId === nodeId
              ? state.nodeSessionProgress.completedPuzzleIds
              : [];
          if (existing.includes(puzzleId)) return state;

          return {
            nodeSessionProgress: {
              nodeId,
              completedPuzzleIds: [...existing, puzzleId],
            },
            trainingProgress: setActiveNode(state.trainingProgress, nodeId),
          };
        }),

      clearNodeSessionProgress: () => set({ nodeSessionProgress: null }),

      completeTrainingNode: (nodeId, stars) =>
        set((state) => ({
          trainingProgress: applyNodeCompletion(
            state.trainingProgress,
            nodeId,
            stars,
          ),
          nodeSessionProgress: null,
        })),

      setMatchElo: (elo) => set({ matchElo: elo }),

      setMatchPlayerColor: (color) => set({ matchPlayerColor: color }),

      setVoiceListenMode: (mode) => set({ voiceListenMode: mode }),

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
        trainingProgress: state.trainingProgress,
        nodeSessionProgress: state.nodeSessionProgress,
        peekEvents: state.peekEvents,
        matchHistory: state.matchHistory,
        matchElo: state.matchElo,
        matchPlayerColor: state.matchPlayerColor,
        voiceListenMode: state.voiceListenMode,
      }),
    },
  ),
);
