import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGuestStore } from '@/stores/guestStore';
import { supabase } from '@/lib/supabase';
import { useSupabaseUserId } from './useSupabaseUserId';

interface ProfileRow {
  current_streak: number;
  global_elo_handicap: number;
  last_active_date: string | null;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useHabitStreak() {
  const streakDays = useGuestStore((s) => s.streakDays);
  const lastActiveDate = useGuestStore((s) => s.lastActiveDate);
  const onboardingComplete = useGuestStore((s) => s.onboardingComplete);
  const setStreakDays = useGuestStore((s) => s.setStreakDays);
  const setLastActiveDate = useGuestStore((s) => s.setLastActiveDate);
  const setMatchElo = useGuestStore((s) => s.setMatchElo);
  const { data: userId } = useSupabaseUserId();

  const profileQuery = useQuery({
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

  useEffect(() => {
    if (!profileQuery.data) return;

    setStreakDays(profileQuery.data.current_streak);
    setMatchElo(profileQuery.data.global_elo_handicap);
    if (profileQuery.data.last_active_date) {
      setLastActiveDate(profileQuery.data.last_active_date);
    }
  }, [profileQuery.data, setLastActiveDate, setMatchElo, setStreakDays]);

  useEffect(() => {
    if (!onboardingComplete) return;

    const today = todayKey();
    if (lastActiveDate === today) return;

    const nextStreak =
      lastActiveDate === yesterdayKey()
        ? streakDays + 1
        : !lastActiveDate
          ? 1
          : 1;

    setStreakDays(nextStreak);
    setLastActiveDate(today);

    if (supabase && userId) {
      void supabase.from('profiles').upsert(
        {
          id: userId,
          current_streak: nextStreak,
          last_active_date: today,
        },
        { onConflict: 'id' },
      );
    }
  }, [
    onboardingComplete,
    lastActiveDate,
    streakDays,
    userId,
    setStreakDays,
    setLastActiveDate,
  ]);

  return { streakDays };
}
