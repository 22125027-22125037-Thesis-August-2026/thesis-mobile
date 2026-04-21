export interface FoodLogRequest {
  waterGlasses: number;
  foodDescription: string;
  satietyLevel: string;
  entryDate: string; // YYYY-MM-DD
}

export interface FoodLogResponse extends FoodLogRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
}
