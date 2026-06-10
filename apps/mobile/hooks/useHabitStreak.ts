import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGuestStore } from '@/stores/guestStore';
import { supabase } from '@/lib/supabase';
import { todayKey, yesterdayKey } from '@/lib/dateKey';
import { useSupabaseUserId } from './useSupabaseUserId';

interface ProfileRow {
  current_streak: number;
  global_elo_handicap: number;
  last_active_date: string | null;
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

  // Reconcile with the server profile (multi-device) without clobbering a
  // fresher local streak — the query result may predate today's local bump.
  useEffect(() => {
    if (!profileQuery.data) return;
    const profile = profileQuery.data;

    setMatchElo(profile.global_elo_handicap);

    const serverDate = profile.last_active_date;
    if (!serverDate) return;

    if (!lastActiveDate || serverDate > lastActiveDate) {
      setStreakDays(profile.current_streak);
      setLastActiveDate(serverDate);
    } else if (serverDate === lastActiveDate && profile.current_streak > streakDays) {
      setStreakDays(profile.current_streak);
    }
  }, [
    profileQuery.data,
    lastActiveDate,
    streakDays,
    setLastActiveDate,
    setMatchElo,
    setStreakDays,
  ]);

  // Daily bump: first activity of a local calendar day extends or restarts the streak.
  useEffect(() => {
    if (!onboardingComplete) return;

    const today = todayKey();
    if (lastActiveDate === today) {
      // Invariant: active today means a streak of at least 1.
      if (streakDays === 0) setStreakDays(1);
      return;
    }

    const nextStreak = lastActiveDate === yesterdayKey() ? streakDays + 1 : 1;
    setStreakDays(nextStreak);
    setLastActiveDate(today);
  }, [onboardingComplete, lastActiveDate, streakDays, setStreakDays, setLastActiveDate]);

  // Push local progress to the server once the profile is known and local is ahead.
  // Runs whenever streak/date change, so it also covers a userId that arrives late.
  useEffect(() => {
    if (!supabase || !userId || !lastActiveDate || !profileQuery.isSuccess) return;

    const profile = profileQuery.data;
    const serverDate = profile?.last_active_date ?? null;
    const localIsAhead =
      !serverDate ||
      lastActiveDate > serverDate ||
      (lastActiveDate === serverDate && streakDays > (profile?.current_streak ?? 0));
    if (!localIsAhead) return;

    void supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          current_streak: streakDays,
          last_active_date: lastActiveDate,
        },
        { onConflict: 'id' },
      )
      .then(({ error }) => {
        if (error && __DEV__) {
          console.warn('[streak] profile sync failed; will retry on next change', error);
        }
      });
  }, [userId, lastActiveDate, streakDays, profileQuery.isSuccess, profileQuery.data]);

  return { streakDays };
}
