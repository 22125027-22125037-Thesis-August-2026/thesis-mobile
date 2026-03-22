import axiosClient from './axiosClient';
import {
  MoodLogRequest,
  MoodLogResponse,
  StreakResponse,
} from '../types/tracking';

export const createMoodLog = async (
  data: MoodLogRequest,
): Promise<MoodLogResponse> => {
  const response = await axiosClient.post<MoodLogResponse>(
    '/tracking/moods',
    data,
  );

  return response.data;
};

export const getStreak = async (): Promise<StreakResponse> => {
  const response = await axiosClient.get<StreakResponse>('/tracking/streaks');

  return response.data;
};
