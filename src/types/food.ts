export interface FoodLogRequest {
  mealType: string;
  foodDescription: string;
  satietyLevel: string;
  entryDate?: string; // ISO format: YYYY-MM-DD
}

export interface FoodLogResponse {
  id: string;
  mealType: string;
  foodDescription: string;
  satietyLevel: string;
  entryDate?: string; // ISO format: YYYY-MM-DD
  createdAt: string;
}
