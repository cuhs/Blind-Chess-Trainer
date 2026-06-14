import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGuestStore } from '@/stores/guestStore';
import { supabase } from '@/lib/supabase';
import { useSupabaseUserId } from './useSupabaseUserId';

export interface ProfileRow {
  current_streak: number;
  global_elo_handicap: number;
  last_active_date: string | null;
}

export function useProfileQuery() {
  const { data: userId } = useSupabaseUserId();

  return useQuery({
    queryKey: ['profile', userId],
    enabled: Boolean(supabase && userId),
    queryFn: async () => {
      if (!supabase || !userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, global_elo_handicap, last_active_date')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as ProfileRow | null;
    },
  });
}

/** Hydrate match Elo from `profiles` — mount once under `(main)`. */
export function useProfileSync() {
  const setMatchElo = useGuestStore((s) => s.setMatchElo);
  const profileQuery = useProfileQuery();

  useEffect(() => {
    if (!profileQuery.data) return;
    setMatchElo(profileQuery.data.global_elo_handicap);
  }, [profileQuery.data, setMatchElo]);
}
