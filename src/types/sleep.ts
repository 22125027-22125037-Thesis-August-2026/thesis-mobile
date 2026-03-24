export interface SleepLogRequest {
  bedTime: string;
  wakeTime: string;
  sleepQuality?: number | null;
  note?: string | null;
}

export interface SleepLogResponse {
  id: string;
  bedTime: string;
  wakeTime: string;
  durationMinutes: number;
  sleepQuality: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
