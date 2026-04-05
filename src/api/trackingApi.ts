import axiosClient from './axiosClient';
import {
  MoodLogRequest,
  MoodLogResponse,
  StreakResponse,
} from '../types/tracking';

export interface DashboardSummary {
  emotionScore: number;
  dominantMood: string;
  sleepQuality: string;
  sleepScore: string;
  diaryStreak: number;
  foodStatus: string;
  totalAiSessions: number;
  monthlyAiSessions: number;
}

interface ApiResponse<T> {
  data: T;
}

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

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await axiosClient.get<ApiResponse<DashboardSummary>>(
    '/api/v1/dashboard/summary',
  );

  return response.data.data;
};
