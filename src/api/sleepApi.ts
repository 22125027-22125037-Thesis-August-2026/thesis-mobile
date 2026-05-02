import axiosClient from '@/api/axiosClient';
import { SleepLogRequest, SleepLogResponse } from '@/types';

const SLEEP_BASE_PATH = '/api/v1/tracking/sleeps';
const SLEEP_WRITE_PATH = `${SLEEP_BASE_PATH}/`;

const getSleepReadCollectionPath = (profileId: string): string =>
  `${SLEEP_BASE_PATH}/${profileId}`;

const getSleepLogItemPath = (profileId: string, id: string): string =>
  `${SLEEP_BASE_PATH}/${profileId}/${id}`;

const getSleepWriteItemPath = (id: string): string =>
  `${SLEEP_BASE_PATH}/${id}`;

export const createSleepLog = async (
  data: SleepLogRequest,
): Promise<SleepLogResponse> => {
  const response = await axiosClient.post<SleepLogResponse>(
    SLEEP_WRITE_PATH,
    data,
  );

  return response.data;
};

export const getAllSleepLogs = async (profileId: string): Promise<SleepLogResponse[]> => {
  const response = await axiosClient.get<SleepLogResponse[]>(
    getSleepReadCollectionPath(profileId),
  );

  return response.data;
};

export const getSleepLogById = async (
  profileId: string,
  id: string,
): Promise<SleepLogResponse> => {
  const response = await axiosClient.get<SleepLogResponse>(
    getSleepLogItemPath(profileId, id),
  );

  return response.data;
};

export const updateSleepLog = async (
  id: string,
  data: SleepLogRequest,
): Promise<SleepLogResponse> => {
  const response = await axiosClient.put<SleepLogResponse>(
    getSleepWriteItemPath(id),
    data,
  );

  return response.data;
};

export const deleteSleepLog = async (id: string): Promise<void> => {
  await axiosClient.delete(getSleepWriteItemPath(id));
};
