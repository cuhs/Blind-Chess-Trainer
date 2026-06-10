import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGuestStore } from '@/stores/guestStore';
import { supabase } from '@/lib/supabase';
import { useSupabaseUserId } from './useSupabaseUserId';
import { isSquare, type Square } from '@mindboard/shared';

interface HeatmapCountRow {
  target_square: string | null;
  interactions: number | string | null;
}

/**
 * Module-level guard: the hook is mounted by several components at once
 * (heatmap, fog hooks), and each instance runs the flush effect. Without this
 * a single pending batch could be inserted multiple times concurrently.
 */
let flushInFlight = false;

export function useHeatmapLedger() {
  const ledger = useGuestStore((s) => s.heatmapLedger);
  const pendingHeatmapInteractions = useGuestStore(
    (s) => s.pendingHeatmapInteractions,
  );
  const mergeHeatmapLedger = useGuestStore((s) => s.mergeHeatmapLedger);
  const recordSquareInteraction = useGuestStore((s) => s.recordSquareInteraction);
  const removePendingHeatmapInteractions = useGuestStore(
    (s) => s.removePendingHeatmapInteractions,
  );
  const { data: userId } = useSupabaseUserId();

  const heatmapQuery = useQuery({
    queryKey: ['heatmap-ledger', userId],
    enabled: Boolean(supabase && userId),
    queryFn: async () => {
      if (!supabase) return {};

      const { data, error } = await supabase.rpc('get_heatmap_counts');
      if (error) throw error;

      const nextLedger: Partial<Record<Square, number>> = {};
      for (const row of (data ?? []) as HeatmapCountRow[]) {
        if (!row.target_square || !isSquare(row.target_square)) continue;
        nextLedger[row.target_square] = Number(row.interactions ?? 0);
      }

      return nextLedger;
    },
  });

  useEffect(() => {
    if (!heatmapQuery.data) return;
    mergeHeatmapLedger(heatmapQuery.data);
  }, [heatmapQuery.data, mergeHeatmapLedger]);

  useEffect(() => {
    if (!supabase || !userId || pendingHeatmapInteractions.length === 0) return;
    if (flushInFlight) return;

    const client = supabase;
    const batch = pendingHeatmapInteractions;
    const flushedIds = batch.map((event) => event.id);

    const flush = async () => {
      flushInFlight = true;
      try {
        const { error: profileError } = await client
          .from('profiles')
          .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });
        if (profileError) throw profileError;

        // Idempotent upsert keyed on client_event_id: a retried batch after a
        // partial network failure never double-counts ledger rows.
        const { error } = await client.from('heatmap_ledger').upsert(
          batch.map((event) => ({
            user_id: userId,
            client_event_id: event.id,
            origin_square: event.originSquare,
            target_square: event.targetSquare,
            is_success: event.isSuccess,
            interaction_type: event.interactionType,
            created_at: event.createdAt,
          })),
          { onConflict: 'user_id,client_event_id', ignoreDuplicates: true },
        );
        if (error) throw error;

        // Store action is safe after unmount; events stay queued on failure.
        removePendingHeatmapInteractions(flushedIds);
      } catch (error) {
        if (__DEV__) {
          console.warn('[heatmap] ledger flush failed; events remain queued', error);
        }
      } finally {
        flushInFlight = false;
      }
    };

    void flush();
  }, [pendingHeatmapInteractions, removePendingHeatmapInteractions, userId]);

  const getInteractions = (square: Square): number => ledger[square] ?? 0;

  return {
    ledger,
    getInteractions,
    recordSquareInteraction,
    isSyncing: heatmapQuery.isFetching || pendingHeatmapInteractions.length > 0,
  };
}
