export interface SleepLogRequest {
  bedTime: string;
  wakeTime: string;
  sleepQuality?: number | null;
  note?: string | null;
  entryDate?: string; // ISO format: YYYY-MM-DD
}

export interface SleepLogResponse {
  id: string;
  bedTime: string;
  wakeTime: string;
  durationMinutes: number;
  sleepQuality: number | null;
  note: string | null;
  entryDate?: string; // ISO format: YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}
