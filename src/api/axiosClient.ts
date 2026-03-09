import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:8080/api/v1';

// TODO: REMOVE HARDCODED TOKEN AFTER UI TESTING
const HARDCODED_TEST_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzYzk2MGM2MC0zODA2LTQ3MWMtOTZhNS1jMjc4NGY0ZTUyMWQiLCJlbWFpbCI6ImR1b25naGlldTI5MDdAZ21haWwuY29tIiwiaWF0IjoxNzcyODY1MDI4LCJleHAiOjE3NzI5NTE0Mjh9.yYcHwFcgfDVi_ZcqC-rQSArbH_vkgoI7W68Av0PEsaw';

const HAS_HARDCODED_TEST_TOKEN = HARDCODED_TEST_TOKEN.trim().length > 0;

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
