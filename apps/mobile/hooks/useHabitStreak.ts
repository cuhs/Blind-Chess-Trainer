import { useEffect } from 'react';
import { useGuestStore } from '@/stores/guestStore';
import { supabase } from '@/lib/supabase';
import { useProfileQuery } from './useProfileSync';
import { useSupabaseUserId } from './useSupabaseUserId';

/** Read-only streak for UI — bump happens via `recordHabitActivity` on drill/match completion. */
export function useHabitStreak() {
  const streakDays = useGuestStore((s) => s.streakDays);
  return { streakDays };
}

/** Reconcile local streak with `profiles` and push when local is ahead. Mount once under `(main)`. */
export function useHabitStreakSync() {
  const streakDays = useGuestStore((s) => s.streakDays);
  const lastActiveDate = useGuestStore((s) => s.lastActiveDate);
  const setStreakDays = useGuestStore((s) => s.setStreakDays);
  const setLastActiveDate = useGuestStore((s) => s.setLastActiveDate);
  const { data: userId } = useSupabaseUserId();
  const profileQuery = useProfileQuery();

  // Reconcile with the server profile (multi-device) without clobbering a
  // fresher local streak — the query result may predate today's local bump.
  useEffect(() => {
    if (!profileQuery.data) return;
    const profile = profileQuery.data;

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
    setStreakDays,
  ]);

  // Push local progress to the server once the profile is known and local is ahead.
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
}
