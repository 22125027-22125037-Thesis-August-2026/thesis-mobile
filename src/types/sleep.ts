export interface SleepLogRequest {
  bedTime: string;
  wakeTime: string;
  sleepQuality?: number;
  note?: string;
  entryDate?: string; // ISO format: YYYY-MM-DD
}

export interface SleepLogResponse extends SleepLogRequest {
  id: string;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
}
