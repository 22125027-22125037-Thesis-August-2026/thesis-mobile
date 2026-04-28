import axiosClient from '@/api/axiosClient';
import { FoodLogRequest, FoodLogResponse } from '@/types';

const FOOD_BASE_PATH = '/api/v1/tracking/foods';
const FOOD_WRITE_PATH = `${FOOD_BASE_PATH}/`;

const getFoodReadCollectionPath = (profileId: string): string =>
  `${FOOD_BASE_PATH}/${profileId}`;

const getFoodLogItemPath = (profileId: string, id: string): string =>
  `${FOOD_BASE_PATH}/${profileId}/${id}`;

export const createFoodLog = async (
  data: FoodLogRequest,
): Promise<FoodLogResponse> => {
  const response = await axiosClient.post<FoodLogResponse>(
    FOOD_WRITE_PATH,
    data,
  );

  return response.data;
};

export const getFoodLogs = async (
  profileId: string,
  startDate: string,
  endDate: string,
): Promise<FoodLogResponse[]> => {
  const response = await axiosClient.get<FoodLogResponse[]>(
    getFoodReadCollectionPath(profileId),
    {
      params: {
        startDate,
        endDate,
      },
    },
  );

  return response.data;
};

export const getAllFoodLogs = async (profileId: string): Promise<FoodLogResponse[]> => {
  const response = await axiosClient.get<FoodLogResponse[]>(
    getFoodReadCollectionPath(profileId),
  );

  return response.data;
};

export const getFoodLogById = async (
  profileId: string,
  id: string,
): Promise<FoodLogResponse> => {
  const response = await axiosClient.get<FoodLogResponse>(
    getFoodLogItemPath(profileId, id),
  );

  return response.data;
};

export const updateFoodLog = async (
  id: string,
  data: FoodLogRequest,
): Promise<FoodLogResponse> => {
  const response = await axiosClient.put<FoodLogResponse>(
    getFoodLogItemPath(id),
    data,
  );

  return response.data;
};

export const deleteFoodLog = async (id: string): Promise<void> => {
  await axiosClient.delete(getFoodLogItemPath(id));
};
