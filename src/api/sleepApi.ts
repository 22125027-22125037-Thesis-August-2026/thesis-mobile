import axiosClient from '@/api/axiosClient';
import { SleepLogRequest, SleepLogResponse } from '@/types';

const SLEEP_BASE_PATH = '/api/v1/tracking/sleeps';
const SLEEP_COLLECTION_PATH = `${SLEEP_BASE_PATH}/`;

const getSleepLogItemPath = (id: string): string => `${SLEEP_BASE_PATH}/${id}`;

export const createSleepLog = async (
  data: SleepLogRequest,
): Promise<SleepLogResponse> => {
  const response = await axiosClient.post<SleepLogResponse>(
    SLEEP_COLLECTION_PATH,
    data,
  );

  return response.data;
};

export const getAllSleepLogs = async (): Promise<SleepLogResponse[]> => {
  const response = await axiosClient.get<SleepLogResponse[]>(
    SLEEP_COLLECTION_PATH,
  );

  return response.data;
};

export const getSleepLogById = async (
  id: string,
): Promise<SleepLogResponse> => {
  const response = await axiosClient.get<SleepLogResponse>(
    getSleepLogItemPath(id),
  );

  return response.data;
};

export const updateSleepLog = async (
  id: string,
  data: SleepLogRequest,
): Promise<SleepLogResponse> => {
  const response = await axiosClient.put<SleepLogResponse>(
    getSleepLogItemPath(id),
    data,
  );

  return response.data;
};

export const deleteSleepLog = async (id: string): Promise<void> => {
  await axiosClient.delete(getSleepLogItemPath(id));
};
