import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';

import { stepsApi } from '@/api';
import { HealthConnect } from '@/native/HealthConnect';
import { StepCounter } from '@/native/StepCounter';

const BASELINE_STORAGE_KEY = '@steps/daily_baseline';
const HC_PROMPTED_STORAGE_KEY = '@steps/health_connect_prompted';

const STEP_SENSOR_SOURCE = 'DEVICE_SENSOR';
const HEALTH_CONNECT_SOURCE = 'HEALTH_CONNECT';

// How many trailing calendar days (including today) to reconcile on app open.
const RECENT_SYNC_DAYS = 7;

const addDays = (date: Date, delta: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
};

interface DailyBaseline {
  date: string; // YYYY-MM-DD (local calendar date)
  baseline: number; // cumulative sensor value at the start of `date`
}

// Uses local calendar date (not UTC), matching useHomeDashboardData.ts so the
// backend's entryDate aligns with what the user sees on their device.
const toLocalDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isAndroid = (): boolean => Platform.OS === 'android';

const readBaseline = async (): Promise<DailyBaseline | null> => {
  try {
    const raw = await AsyncStorage.getItem(BASELINE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyBaseline;
    if (typeof parsed.date === 'string' && typeof parsed.baseline === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

const writeBaseline = async (baseline: DailyBaseline): Promise<void> => {
  try {
    await AsyncStorage.setItem(BASELINE_STORAGE_KEY, JSON.stringify(baseline));
  } catch (err) {
    console.log('[stepTracker] failed to persist baseline:', err);
  }
};

/**
 * Converts a cumulative (since-boot) sensor reading into today's step count by
 * applying a stored daily baseline:
 *   - new day            -> baseline = current cumulative
 *   - device rebooted     -> (current < baseline) baseline = current
 * todaySteps = current - baseline. Persists the baseline when it changes.
 */
const resolveTodaySteps = async (cumulative: number): Promise<number> => {
  const todayKey = toLocalDateKey(new Date());
  const stored = await readBaseline();

  let baseline = stored?.baseline ?? cumulative;

  if (!stored || stored.date !== todayKey) {
    // First reading today: anchor the baseline to the current cumulative value.
    baseline = cumulative;
    await writeBaseline({ date: todayKey, baseline });
  } else if (cumulative < baseline) {
    // Cumulative counter reset (device rebooted): re-anchor to current value.
    baseline = cumulative;
    await writeBaseline({ date: todayKey, baseline });
  }

  return Math.max(0, cumulative - baseline);
};

/**
 * Requests the Android 10+ runtime ACTIVITY_RECOGNITION permission required to
 * read the hardware step counter. No-op (returns true) on iOS / older Android.
 */
export const requestPermission = async (): Promise<boolean> => {
  if (!isAndroid()) return false;
  // ACTIVITY_RECOGNITION is only a runtime permission on Android 10 (API 29)+.
  if (typeof Platform.Version === 'number' && Platform.Version < 29) return true;

  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.log('[stepTracker] permission request failed:', err);
    return false;
  }
};

export const isAvailable = (): Promise<boolean> => {
  if (!isAndroid()) return Promise.resolve(false);
  return StepCounter.isAvailable();
};

/** Today's step count derived from the cumulative sensor value + daily baseline. */
export const getTodaySteps = async (): Promise<number> => {
  if (!isAndroid()) return 0;
  const cumulative = await StepCounter.getCurrentStepCount();
  return resolveTodaySteps(cumulative);
};

/**
 * Subscribe to live today-step updates while a screen is mounted. Returns an
 * unsubscribe function. No-op on iOS.
 */
export const subscribe = (cb: (todaySteps: number) => void): (() => void) => {
  if (!isAndroid()) return () => undefined;

  return StepCounter.subscribe(cumulative => {
    void resolveTodaySteps(cumulative).then(cb);
  });
};

/**
 * Reads today's steps and upserts them to the backend. Safe to call on app
 * foreground and on the steps screen mount. No-op on iOS.
 */
export const syncTodaySteps = async (
  goal?: number,
): Promise<void> => {
  if (!isAndroid()) return;

  try {
    const stepCount = await getTodaySteps();
    const todayKey = toLocalDateKey(new Date());
    await stepsApi.upsertStepLog({
      stepCount,
      entryDate: todayKey,
      source: STEP_SENSOR_SOURCE,
      ...(goal !== undefined ? { goal } : {}),
    });
  } catch (err) {
    console.log('[stepTracker] syncTodaySteps failed:', err);
  }
};

/** Whether Health Connect (the historical per-day source) is usable here. */
export const isHealthConnectAvailable = (): Promise<boolean> =>
  HealthConnect.isAvailable();

/**
 * Prompts for Health Connect's READ_STEPS permission. No-op (returns false) on
 * iOS or when Health Connect is unavailable; resolves true immediately if the
 * permission was already granted.
 *
 * Health Connect gives no "don't ask again" signal, so asking on every screen
 * mount would re-open the system sheet after the user declined. The first ask is
 * remembered and later ones are skipped unless `force` is set (use that for an
 * explicit user action, e.g. a "connect Health Connect" button).
 */
export const requestHealthConnectPermission = async (
  { force = false }: { force?: boolean } = {},
): Promise<boolean> => {
  if (!isAndroid()) return false;
  if (!(await HealthConnect.isAvailable())) return false;
  if (await HealthConnect.hasPermission()) return true;

  if (!force) {
    try {
      if (await AsyncStorage.getItem(HC_PROMPTED_STORAGE_KEY)) return false;
      await AsyncStorage.setItem(HC_PROMPTED_STORAGE_KEY, '1');
    } catch (err) {
      console.log('[stepTracker] health connect prompt flag failed:', err);
    }
  }

  return HealthConnect.requestPermission();
};

/**
 * Reconciles the last `days` calendar days (including today) with the backend so
 * a day the app was never opened still gets recorded:
 *   - today      -> live hardware sensor value (always available)
 *   - prior days -> Health Connect's per-day totals (the only on-device source
 *                   of historical daily step counts)
 *
 * Existing backend values are read first and a day is only written when the new
 * total is strictly higher, so a correct value is never regressed by a lower or
 * empty Health Connect reading. Safe to call on every app open. No-op on iOS.
 */
export const syncRecentDays = async (
  profileId: string,
  days: number = RECENT_SYNC_DAYS,
  goal?: number,
): Promise<void> => {
  if (!isAndroid()) return;

  // Always capture today's live count first — this path works even without
  // Health Connect, preserving the previous behaviour as a baseline.
  await syncTodaySteps(goal);

  try {
    if (!(await HealthConnect.isAvailable())) return;
    if (!(await HealthConnect.hasPermission())) return;

    const today = new Date();
    const startKey = toLocalDateKey(addDays(today, -(days - 1)));
    const endKey = toLocalDateKey(today);

    const daily = await HealthConnect.getDailySteps(startKey, endKey);
    if (daily.length === 0) return;

    // Existing backend totals so we never overwrite an already-correct day with
    // a lower Health Connect value (keyed by entryDate, keeping the max seen).
    const existing = new Map<string, number>();
    if (profileId) {
      try {
        const logs = await stepsApi.getStepLogsInRange(profileId, startKey, endKey);
        for (const log of logs) {
          if (!log.entryDate) continue;
          const prev = existing.get(log.entryDate) ?? 0;
          if (log.stepCount > prev) existing.set(log.entryDate, log.stepCount);
        }
      } catch (err) {
        console.log('[stepTracker] range fetch failed:', err);
      }
    }

    const sensorToday = await getTodaySteps();

    for (const { date, count } of daily) {
      // Today: trust the live sensor if it is ahead of Health Connect.
      const target =
        date === endKey ? Math.max(Math.round(count), sensorToday) : Math.round(count);
      const current = existing.get(date) ?? 0;
      if (target <= current) continue; // never regress an existing value

      await stepsApi.upsertStepLog({
        stepCount: target,
        entryDate: date,
        source: date === endKey ? STEP_SENSOR_SOURCE : HEALTH_CONNECT_SOURCE,
        // Sent for every day, not just today: the backend resets an omitted goal
        // to its own default, which would silently rewrite the goal on back-filled days.
        ...(goal !== undefined ? { goal } : {}),
      });
    }
  } catch (err) {
    console.log('[stepTracker] syncRecentDays failed:', err);
  }
};

export const stepTracker = {
  requestPermission,
  isAvailable,
  getTodaySteps,
  subscribe,
  syncTodaySteps,
  syncRecentDays,
  isHealthConnectAvailable,
  requestHealthConnectPermission,
};
