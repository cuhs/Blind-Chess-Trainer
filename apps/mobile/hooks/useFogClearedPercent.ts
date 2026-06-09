import { useEffect } from 'react';
import { getFogClearedPercent, getClarityPercent, getMasteryCount } from '@mindboard/heatmap';
import { useHeatmapLedger } from './useHeatmapLedger';
import { supabase } from '@/lib/supabase';
import { useSupabaseUserId } from './useSupabaseUserId';

export function useFogClearedPercent() {
  const { ledger } = useHeatmapLedger();
  const { data: userId } = useSupabaseUserId();
  const boardMappedPercent = getFogClearedPercent(ledger);
  const clarityPercent = getClarityPercent(ledger);
  const masteryCount = getMasteryCount(ledger);

  useEffect(() => {
    if (!supabase || !userId) return;

    void supabase.from('profiles').upsert(
      {
        id: userId,
        total_fog_cleared: clarityPercent,
      },
      { onConflict: 'id' },
    );
  }, [clarityPercent, userId]);

  return { boardMappedPercent, clarityPercent, masteryCount };
}
