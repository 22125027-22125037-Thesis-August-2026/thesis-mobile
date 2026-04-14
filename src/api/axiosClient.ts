import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import i18next from 'i18next';

const BASE_URL = 'http://localhost:8080';

// TODO: REMOVE HARDCODED TOKEN AFTER UI TESTING
const HARDCODED_TEST_TOKEN = '';

const HAS_HARDCODED_TEST_TOKEN = HARDCODED_TEST_TOKEN.trim().length > 0;
const AUTH_STORAGE_KEYS = ['userToken', 'userRole', 'profileId'];
const IS_DEV = __DEV__;

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
    const token = await AsyncStorage.getItem('userToken');
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

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
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
