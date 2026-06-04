export interface StepLogRequest {
  stepCount: number;
  goal?: number;
  source?: string;
  entryDate?: string; // ISO format: YYYY-MM-DD
}

export interface StepLogResponse extends StepLogRequest {
  id: string;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}
