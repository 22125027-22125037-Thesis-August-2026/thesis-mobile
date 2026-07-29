import { NativeModules, Platform } from 'react-native';

export type DailySteps = {
  date: string; // YYYY-MM-DD (local calendar day)
  count: number;
};

type HealthConnectNative = {
  isAvailable: () => Promise<boolean>;
  hasPermission: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  getDailySteps: (startDate: string, endDate: string) => Promise<DailySteps[]>;
};

const native: HealthConnectNative | null =
  Platform.OS === 'android'
    ? ((NativeModules as Record<string, unknown>).HealthConnect as HealthConnectNative) ?? null
    : null;

const logError = (action: string, err: unknown): void => {
  console.log(`[HealthConnect] ${action} failed:`, err);
};

/**
 * JS wrapper over the native Health Connect module. Every method degrades to a
 * safe default (false / []) when Health Connect is missing, so callers can run
 * unconditionally on Android and simply get nothing back when it is unavailable.
 */
export const HealthConnect = {
  /** Whether Health Connect is installed and usable on this device. */
  isAvailable: async (): Promise<boolean> => {
    if (!native) return false;
    try {
      return await native.isAvailable();
    } catch (err) {
      logError('isAvailable', err);
      return false;
    }
  },

  /** Whether READ_STEPS has already been granted. */
  hasPermission: async (): Promise<boolean> => {
    if (!native) return false;
    try {
      return await native.hasPermission();
    } catch (err) {
      logError('hasPermission', err);
      return false;
    }
  },

  /** Prompts for READ_STEPS (resolves true immediately if already granted). */
  requestPermission: async (): Promise<boolean> => {
    if (!native) return false;
    try {
      return await native.requestPermission();
    } catch (err) {
      logError('requestPermission', err);
      return false;
    }
  },

  /** Per-day step totals for the inclusive [startDate, endDate] range. */
  getDailySteps: async (
    startDate: string,
    endDate: string,
  ): Promise<DailySteps[]> => {
    if (!native) return [];
    try {
      return await native.getDailySteps(startDate, endDate);
    } catch (err) {
      logError('getDailySteps', err);
      return [];
    }
  },
};
