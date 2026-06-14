import {
  DiaryEntryResponse,
  FoodLogResponse,
  SleepLogResponse,
  StepLogResponse,
} from '@/types';

const toLocalDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export interface DailyTrackingStatus {
  /** Number of categories logged today (0..4). */
  count: number;
  diary: boolean;
  nutrition: boolean;
  sleep: boolean;
  steps: boolean;
}

/**
 * Resolves the calendar day a record belongs to. Prefers an explicit
 * `entryDate` (YYYY-MM-DD), falling back to a timestamp field when missing.
 */
const resolveDateKey = (
  entryDate: string | undefined,
  fallbackTimestamp: string | undefined,
): string | null => {
  if (entryDate) {
    // entryDate is already a YYYY-MM-DD calendar key; keep its first 10 chars
    // so an accidental ISO timestamp still resolves correctly.
    return entryDate.slice(0, 10);
  }
  if (fallbackTimestamp) {
    return toLocalDateKey(new Date(fallbackTimestamp));
  }
  return null;
};

const hasToday = (keys: (string | null)[], todayKey: string): boolean =>
  keys.some(key => key === todayKey);

/**
 * Determines which of the four daily trackings (nutrition, sleep, diary, steps)
 * the user has logged *today*. Used to award the daily tracking trophy:
 * 4 categories → gold, 3 → silver, 2 → bronze.
 */
export const getTodayTrackingStatus = (
  diaryEntries: DiaryEntryResponse[],
  foodLogs: FoodLogResponse[],
  sleepLogs: SleepLogResponse[],
  stepLogs: StepLogResponse[],
): DailyTrackingStatus => {
  const todayKey = toLocalDateKey(new Date());

  const diary = hasToday(
    diaryEntries.map(e => resolveDateKey(e.entryDate, e.createdAt)),
    todayKey,
  );
  const nutrition = hasToday(
    foodLogs.map(e => resolveDateKey(e.entryDate, e.createdAt)),
    todayKey,
  );
  const sleep = hasToday(
    sleepLogs.map(e => resolveDateKey(e.entryDate, e.wakeTime)),
    todayKey,
  );
  const steps = hasToday(
    stepLogs.map(e => resolveDateKey(e.entryDate, e.loggedAt)),
    todayKey,
  );

  const count = [diary, nutrition, sleep, steps].filter(Boolean).length;

  return { count, diary, nutrition, sleep, steps };
};
