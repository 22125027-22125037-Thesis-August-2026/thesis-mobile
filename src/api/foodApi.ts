import axiosClient from '@/api/axiosClient';
import { FoodLogRequest, FoodLogResponse } from '@/types';

const FOOD_BASE_PATH = '/api/v1/tracking/foods';
const FOOD_COLLECTION_PATH = `${FOOD_BASE_PATH}/`;

const getFoodLogItemPath = (id: string): string => `${FOOD_BASE_PATH}/${id}`;

export const createFoodLog = async (
  data: FoodLogRequest,
): Promise<FoodLogResponse> => {
  const response = await axiosClient.post<FoodLogResponse>(
    FOOD_COLLECTION_PATH,
    data,
  );

  return response.data;
};

export const getAllFoodLogs = async (): Promise<FoodLogResponse[]> => {
  const response = await axiosClient.get<FoodLogResponse[]>(
    FOOD_COLLECTION_PATH,
  );

  return response.data;
};

export const getFoodLogById = async (id: string): Promise<FoodLogResponse> => {
  const response = await axiosClient.get<FoodLogResponse>(
    getFoodLogItemPath(id),
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
