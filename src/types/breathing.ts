export interface BreathingLogRequest {
  durationSeconds: number;
  goalSeconds?: number;
  source?: string;
  entryDate?: string; // ISO format: YYYY-MM-DD
}

export interface BreathingLogResponse {
  id: string;
  totalDurationSeconds: number;
  sessionsCompleted: number;
  goalSeconds: number;
  source: string;
  entryDate: string;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}
