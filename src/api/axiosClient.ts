import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const BASE_URL = 'http://localhost:8080';

// TODO: REMOVE HARDCODED TOKEN AFTER UI TESTING
const HARDCODED_TEST_TOKEN = '';

const HAS_HARDCODED_TEST_TOKEN = HARDCODED_TEST_TOKEN.trim().length > 0;
const AUTH_STORAGE_KEYS = ['userToken', 'userRole', 'profileId'];

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
    return config;
  }

  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
  response => response,
  async error => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      await AsyncStorage.multiRemove(AUTH_STORAGE_KEYS);
      if (logoutHandler) {
        logoutHandler();
      }
      Alert.alert('Phiên đăng nhập đã hết hạn', 'Vui lòng đăng nhập lại.');
    }
    return Promise.reject(error);
  },
);
