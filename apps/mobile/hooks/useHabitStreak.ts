import { useEffect } from 'react';
import { useGuestStore } from '@/stores/guestStore';

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

  useEffect(() => {
    if (!onboardingComplete) return;

    const today = todayKey();
    if (lastActiveDate === today) return;

    if (lastActiveDate === yesterdayKey()) {
      setStreakDays(streakDays + 1);
    } else if (!lastActiveDate) {
      setStreakDays(1);
    } else {
      setStreakDays(1);
    }
    setLastActiveDate(today);
  }, [
    onboardingComplete,
    lastActiveDate,
    streakDays,
    setStreakDays,
    setLastActiveDate,
  ]);

  return { streakDays };
}
