import { DiaryEntryResponse } from '@/types';

const toLocalDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Counts the current writing streak based on when entries were actually created (createdAt),
 * not their entryDate. This prevents streak inflation from backdating past entries.
 *
 * Option B: if the user hasn't written today, the streak from yesterday is still shown
 * as "alive" — it resets to 0 only when yesterday also has no entry.
 */
export const calculateStreakFromCreatedAt = (entries: DiaryEntryResponse[]): number => {
  if (entries.length === 0) return 0;

  const writtenDays = new Set<string>();
  entries.forEach(entry => {
    writtenDays.add(toLocalDateKey(new Date(entry.createdAt)));
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toLocalDateKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toLocalDateKey(yesterday);

  // Start counting from today if written, otherwise from yesterday (Option B)
  let startKey: string;
  if (writtenDays.has(todayKey)) {
    startKey = todayKey;
  } else if (writtenDays.has(yesterdayKey)) {
    startKey = yesterdayKey;
  } else {
    return 0;
  }

  let streak = 0;
  const cursor = new Date(startKey);
  while (writtenDays.has(toLocalDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};
