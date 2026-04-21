import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCIAL_API_BASE_URL = 'http://localhost:8083';
const HARDCODED_TEST_TOKEN = '';
const HAS_HARDCODED_TEST_TOKEN = HARDCODED_TEST_TOKEN.trim().length > 0;
const IS_DEV = __DEV__;

const socialAxiosClient = axios.create({
  baseURL: SOCIAL_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (HAS_HARDCODED_TEST_TOKEN) {
  socialAxiosClient.defaults.headers.common.Authorization = `Bearer ${HARDCODED_TEST_TOKEN}`;
}

socialAxiosClient.interceptors.request.use(async config => {
  if (HAS_HARDCODED_TEST_TOKEN) {
    config.headers.Authorization = `Bearer ${HARDCODED_TEST_TOKEN}`;
  } else {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (IS_DEV) {
    console.log('[SOCIAL API REQUEST]', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL || ''}${config.url || ''}`,
      params: config.params,
      data: config.data,
    });
  }

  return config;
});

socialAxiosClient.interceptors.response.use(
  response => {
    if (IS_DEV) {
      console.log('[SOCIAL API RESPONSE]', {
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
      console.log('[SOCIAL API ERROR]', {
        status: error?.response?.status,
        method: error?.config?.method?.toUpperCase(),
        url: `${error?.config?.baseURL || ''}${error?.config?.url || ''}`,
        params: error?.config?.params,
        requestData: error?.config?.data,
        responseData: error?.response?.data,
      });
    }

    return Promise.reject(error);
  },
);

export default socialAxiosClient;