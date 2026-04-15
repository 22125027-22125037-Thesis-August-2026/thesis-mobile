import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THERAPIST_API_BASE_URL = 'http://localhost:8082';
const HARDCODED_TEST_TOKEN = '';
const HAS_HARDCODED_TEST_TOKEN = HARDCODED_TEST_TOKEN.trim().length > 0;
const IS_DEV = __DEV__;

const therapistAxiosClient = axios.create({
  baseURL: THERAPIST_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (HAS_HARDCODED_TEST_TOKEN) {
  therapistAxiosClient.defaults.headers.common.Authorization = `Bearer ${HARDCODED_TEST_TOKEN}`;
}

therapistAxiosClient.interceptors.request.use(async config => {
  if (HAS_HARDCODED_TEST_TOKEN) {
    config.headers.Authorization = `Bearer ${HARDCODED_TEST_TOKEN}`;
  } else {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (IS_DEV) {
    console.log('[THERAPIST API REQUEST]', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL || ''}${config.url || ''}`,
      data: config.data,
    });
  }

  return config;
});

therapistAxiosClient.interceptors.response.use(
  response => {
    if (IS_DEV) {
      console.log('[THERAPIST API RESPONSE]', {
        status: response.status,
        method: response.config.method?.toUpperCase(),
        url: `${response.config.baseURL || ''}${response.config.url || ''}`,
        data: response.data,
      });
    }

    return response;
  },
  error => {
    if (IS_DEV) {
      console.log('[THERAPIST API ERROR]', {
        status: error?.response?.status,
        method: error?.config?.method?.toUpperCase(),
        url: `${error?.config?.baseURL || ''}${error?.config?.url || ''}`,
        requestData: error?.config?.data,
        responseData: error?.response?.data,
      });
    }

    return Promise.reject(error);
  },
);

export default therapistAxiosClient;
