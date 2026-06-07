import axiosClient from '@/api/axiosClient';
import { BreathingLogRequest, BreathingLogResponse } from '@/types';

const BREATHING_BASE_PATH = '/api/v1/tracking/breathing';
const BREATHING_WRITE_PATH = `${BREATHING_BASE_PATH}/`;

const getBreathingReadCollectionPath = (profileId: string): string =>
  `${BREATHING_BASE_PATH}/${profileId}`;

const getBreathingRangePath = (profileId: string): string =>
  `${BREATHING_BASE_PATH}/${profileId}/range`;

const getBreathingWriteItemPath = (id: string): string =>
  `${BREATHING_BASE_PATH}/${id}`;

export const upsertBreathingLog = async (
  data: BreathingLogRequest,
): Promise<BreathingLogResponse> => {
  const response = await axiosClient.post<BreathingLogResponse>(
    BREATHING_WRITE_PATH,
    data,
  );

  return response.data;
};

export const getAllBreathingLogs = async (
  profileId: string,
): Promise<BreathingLogResponse[]> => {
  const response = await axiosClient.get<BreathingLogResponse[]>(
    getBreathingReadCollectionPath(profileId),
  );

  return response.data;
};

export const getBreathingLogsInRange = async (
  profileId: string,
  from: string,
  to: string,
): Promise<BreathingLogResponse[]> => {
  const response = await axiosClient.get<BreathingLogResponse[]>(
    getBreathingRangePath(profileId),
    {
      params: {
        from,
        to,
      },
    },
  );

  return response.data;
};

export const deleteBreathingLog = async (id: string): Promise<void> => {
  await axiosClient.delete(getBreathingWriteItemPath(id));
};
