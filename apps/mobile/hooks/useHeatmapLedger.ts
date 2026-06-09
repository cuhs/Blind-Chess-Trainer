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

    const client = supabase;
    let cancelled = false;
    const batch = pendingHeatmapInteractions;
    const flushedIds = batch.map((event) => event.id);

    const flush = async () => {
      await client
        .from('profiles')
        .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });

      const { error } = await client.from('heatmap_ledger').insert(
        batch.map((event) => ({
          user_id: userId,
          origin_square: event.originSquare,
          target_square: event.targetSquare,
          is_success: event.isSuccess,
          interaction_type: event.interactionType,
          created_at: event.createdAt,
        })),
      );

      if (!error && !cancelled) {
        removePendingHeatmapInteractions(flushedIds);
      }
    };

    void flush();

    return () => {
      cancelled = true;
    };
  }, [pendingHeatmapInteractions, removePendingHeatmapInteractions, userId]);

  const getInteractions = (square: Square): number => ledger[square] ?? 0;

  return {
    ledger,
    getInteractions,
    recordSquareInteraction,
    isSyncing: heatmapQuery.isFetching || pendingHeatmapInteractions.length > 0,
  };
}
