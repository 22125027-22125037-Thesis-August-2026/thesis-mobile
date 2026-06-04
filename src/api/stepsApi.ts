import axiosClient from '@/api/axiosClient';
import { StepLogRequest, StepLogResponse } from '@/types';

const STEPS_BASE_PATH = '/api/v1/tracking/steps';
const STEPS_WRITE_PATH = `${STEPS_BASE_PATH}/`;

const getStepsReadCollectionPath = (profileId: string): string =>
  `${STEPS_BASE_PATH}/${profileId}`;

const getStepsRangePath = (profileId: string): string =>
  `${STEPS_BASE_PATH}/${profileId}/range`;

const getStepsWriteItemPath = (id: string): string =>
  `${STEPS_BASE_PATH}/${id}`;

export const upsertStepLog = async (
  data: StepLogRequest,
): Promise<StepLogResponse> => {
  const response = await axiosClient.post<StepLogResponse>(
    STEPS_WRITE_PATH,
    data,
  );

  return response.data;
};

export const getAllStepLogs = async (
  profileId: string,
): Promise<StepLogResponse[]> => {
  const response = await axiosClient.get<StepLogResponse[]>(
    getStepsReadCollectionPath(profileId),
  );

  return response.data;
};

export const getStepLogsInRange = async (
  profileId: string,
  from: string,
  to: string,
): Promise<StepLogResponse[]> => {
  const response = await axiosClient.get<StepLogResponse[]>(
    getStepsRangePath(profileId),
    {
      params: {
        from,
        to,
      },
    },
  );

  return response.data;
};

export const deleteStepLog = async (id: string): Promise<void> => {
  await axiosClient.delete(getStepsWriteItemPath(id));
};
