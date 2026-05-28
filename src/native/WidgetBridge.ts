import { NativeModules, Platform } from 'react-native';
import { BASE_URL } from '@/api/axiosClient';

type WidgetBridgeNative = {
  setAuth: (token: string, profileId: string, baseUrl: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  cacheLastMood: (moodTag: string, isoAt: string) => Promise<void>;
  requestRefresh: () => Promise<void>;
  consumePendingDeepLink: () => Promise<string | null>;
};

const native: WidgetBridgeNative | null =
  Platform.OS === 'android'
    ? ((NativeModules as Record<string, unknown>).WidgetBridge as WidgetBridgeNative) ?? null
    : null;

const noopAsync = async (): Promise<void> => undefined;

const logError = (action: string, err: unknown): void => {
  console.log(`[WidgetBridge] ${action} failed:`, err);
};

export const WidgetBridge = {
  setAuth: async (token: string, profileId: string): Promise<void> => {
    if (!native) return noopAsync();
    try {
      await native.setAuth(token, profileId, BASE_URL);
    } catch (err) {
      logError('setAuth', err);
    }
  },
  clearAuth: async (): Promise<void> => {
    if (!native) return noopAsync();
    try {
      await native.clearAuth();
    } catch (err) {
      logError('clearAuth', err);
    }
  },
  cacheLastMood: async (moodTag: string, isoAt: string): Promise<void> => {
    if (!native) return noopAsync();
    try {
      await native.cacheLastMood(moodTag, isoAt);
    } catch (err) {
      logError('cacheLastMood', err);
    }
  },
  requestRefresh: async (): Promise<void> => {
    if (!native) return noopAsync();
    try {
      await native.requestRefresh();
    } catch (err) {
      logError('requestRefresh', err);
    }
  },
  consumePendingDeepLink: async (): Promise<string | null> => {
    if (!native) return null;
    try {
      return await native.consumePendingDeepLink();
    } catch (err) {
      logError('consumePendingDeepLink', err);
      return null;
    }
  },
};

export const WIDGET_DEEP_LINK_EVENT = 'WidgetDeepLink';

export type WidgetDeepLinkPayload = {
  target: string;
};
