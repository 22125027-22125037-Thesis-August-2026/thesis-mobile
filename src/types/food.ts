export interface FoodLogRequest {
  mealType: string;
  foodDescription: string;
  satietyLevel: string;
}

export interface FoodLogResponse {
  id: string;
  mealType: string;
  foodDescription: string;
  satietyLevel: string;
  createdAt: string;
}
