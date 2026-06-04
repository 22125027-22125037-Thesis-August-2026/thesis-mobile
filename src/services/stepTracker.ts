import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';

import { stepsApi } from '@/api';
import { StepCounter } from '@/native/StepCounter';

const BASELINE_STORAGE_KEY = '@steps/daily_baseline';

const STEP_SENSOR_SOURCE = 'DEVICE_SENSOR';

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

export const stepTracker = {
  requestPermission,
  isAvailable,
  getTodaySteps,
  subscribe,
  syncTodaySteps,
};
