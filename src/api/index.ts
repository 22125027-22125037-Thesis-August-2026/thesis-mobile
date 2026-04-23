export { aiApi } from '@/api/aiApi';
export { default as axiosClient, setLogoutHandler } from '@/api/axiosClient';
export { default as socialAxiosClient } from '@/api/socialAxiosClient';
import * as diaryApi from '@/api/diaryApi';
import * as foodApi from '@/api/foodApi';
import * as socialApi from '@/api/socialApi';
import * as sleepApi from '@/api/sleepApi';
import * as therapistApi from '@/api/therapistApi';
import * as trackingApi from '@/api/trackingApi';

export { diaryApi, foodApi, socialApi, sleepApi, therapistApi, trackingApi };
export * from '@/api/diaryApi';
export * from '@/api/foodApi';
export * from '@/api/socialApi';
export * from '@/api/sleepApi';
export * from '@/api/therapistApi';
export * from '@/api/trackingApi';
