export interface MoodLogRequest {
  moodTag: string;
  positivityScore: number;
}

export interface MoodLogResponse {
  id: string;
  moodTag: string;
  positivityScore: number;
  logDate: string;
}

export interface SleepLogRequest {
  bedTime: string;
  wakeTime: string;
}

export interface SleepLogResponse {
  id: string;
  bedTime: string;
  wakeTime: string;
  createdAt: string;
}

export interface DiaryEntryRequest {
  content: string;
  positivityScore: number;
}

export interface StreakResponse {
  currentCount: number;
  lastLoggedAt: string;
}
