import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import i18next from 'i18next';

export const BASE_URL = 'http://161.118.252.10:8080';

// TODO: REMOVE HARDCODED TOKEN AFTER UI TESTING
const HARDCODED_TEST_TOKEN = '';

const HAS_HARDCODED_TEST_TOKEN = HARDCODED_TEST_TOKEN.trim().length > 0;
const ACCESS_TOKEN_KEY = 'userToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const AUTH_STORAGE_KEYS = [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, 'userRole', 'profileId'];
const IS_DEV = __DEV__;

// Calls to the auth flow itself must never trigger refresh-retry or the global
// logout handler — otherwise a failed /refresh or /logout would recurse.
const isAuthFlowUrl = (url?: string): boolean =>
  !!url && /\/auth\/(login|refresh|logout)/.test(url);

const redactSensitiveFields = (value: unknown): unknown => {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => redactSensitiveFields(item));
  }

  return Object.entries(value as Record<string, unknown>).reduce(
    (acc, [key, fieldValue]) => {
      if (/password|token/i.test(key)) {
        acc[key] = '[REDACTED]';
      } else {
        acc[key] = redactSensitiveFields(fieldValue);
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );
};

const parseJsonIfPossible = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (HAS_HARDCODED_TEST_TOKEN) {
  axiosClient.defaults.headers.common.Authorization = `Bearer ${HARDCODED_TEST_TOKEN}`;
}

// Interceptor: Tự động gắn Token vào Header
axiosClient.interceptors.request.use(async config => {
  if (HAS_HARDCODED_TEST_TOKEN) {
    config.headers.Authorization = `Bearer ${HARDCODED_TEST_TOKEN}`;
  } else {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (IS_DEV) {
    console.log('[API REQUEST]', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL || ''}${config.url || ''}`,
      headers: redactSensitiveFields(config.headers),
      data: redactSensitiveFields(parseJsonIfPossible(config.data)),
    });
  }

  return config;
});

export default axiosClient;

// Interceptor: Tự động logout khi token hết hạn
let logoutHandler: (() => void) | null = null;

export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

// --- Refresh-token rotation (single-flight) ------------------------------
// The access token now expires in ~15 min, so 401s are routine. On a 401 we
// rotate via POST /auth/refresh, persist the *new* refresh token, and replay
// the original request. Because the refresh token rotates on every call,
// concurrent 401s must share a single in-flight refresh (single-flight) — if
// two requests each presented the same refresh token, the second would trip
// the backend's reuse-detection and revoke the whole session.
let refreshPromise: Promise<string | null> | null = null;

const performRefresh = async (): Promise<string | null> => {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    return null;
  }

  try {
    // Use a bare axios call so this request skips our interceptors entirely.
    const res = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
      refreshToken,
    });
    const payload = (res.data?.data ?? res.data) as {
      accessToken?: string;
      refreshToken?: string;
    };
    const newAccess = payload?.accessToken;
    const newRefresh = payload?.refreshToken;
    if (!newAccess) {
      return null;
    }

    const writes: [string, string][] = [[ACCESS_TOKEN_KEY, newAccess]];
    if (newRefresh) {
      writes.push([REFRESH_TOKEN_KEY, newRefresh]);
    }
    await AsyncStorage.multiSet(writes);
    return newAccess;
  } catch {
    // Bad/expired/reused refresh token — caller will fall through to logout.
    return null;
  }
};

// Coalesces concurrent refresh attempts into one network round-trip.
const getRefreshedAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

axiosClient.interceptors.response.use(
  response => {
    if (IS_DEV) {
      console.log('[API RESPONSE]', {
        status: response.status,
        method: response.config.method?.toUpperCase(),
        url: `${response.config.baseURL || ''}${response.config.url || ''}`,
        data: redactSensitiveFields(response.data),
      });
    }

    return response;
  },
  async error => {
    if (IS_DEV) {
      console.log('[API ERROR]', {
        status: error?.response?.status,
        method: error?.config?.method?.toUpperCase(),
        url: `${error?.config?.baseURL || ''}${error?.config?.url || ''}`,
        requestData: redactSensitiveFields(parseJsonIfPossible(error?.config?.data)),
        responseData: redactSensitiveFields(error?.response?.data),
      });
    }

    const status = error.response?.status;
    const originalRequest = error.config;

    // Never run refresh/logout machinery for the auth flow itself (a failed
    // login, refresh, or logout must surface to its own caller).
    if (isAuthFlowUrl(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // 401 → try a one-shot refresh + replay before giving up. 403 is an
    // authorization failure (not an expired token), so it skips refresh.
    if (
      status === 401 &&
      !HAS_HARDCODED_TEST_TOKEN &&
      originalRequest &&
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true;
      const newAccessToken = await getRefreshedAccessToken();
      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      }
      // Refresh failed → fall through to logout below.
    }

    if (status === 401 || status === 403) {
      await AsyncStorage.multiRemove(AUTH_STORAGE_KEYS);
      if (logoutHandler) {
        logoutHandler();
      }
      Alert.alert(
        i18next.t('session.expiredTitle'),
        i18next.t('session.expiredMessage'),
      );
    }
    return Promise.reject(error);
  },
);
