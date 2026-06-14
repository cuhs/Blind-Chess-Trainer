/**
 * Calendar-day key (`YYYY-MM-DD`) in the device's local timezone — streaks and
 * daily drills roll over at local midnight, not UTC midnight.
 */
export function dateKey(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayKey(): string {
  return dateKey();
}

export function yesterdayKey(): string {
  return previousDayKey(todayKey());
}

export function previousDayKey(key: string): string {
  const [year, month, day] = key.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  return dateKey(d);
}
