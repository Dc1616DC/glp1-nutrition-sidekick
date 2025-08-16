import { NutritionInfo, FirebaseDocument } from './common';
import { MealType, GeneratedMeal, MealPreferences } from './meal';

export type MealSource = 'ai_generated' | 'curated' | 'imported' | 'user_created';

export interface SavedMeal extends FirebaseDocument {
  userId: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  nutritionTotals: NutritionInfo;
  servingSize: string;
  cookingTime: number;
  prepTime?: number;
  mealType: MealType;
  tags: string[];
  rating?: number; // 1-5 stars
  notes?: string;
  source: MealSource;
  originalGenerationData?: GeneratedMeal; // Store original API response for regeneration
  savedAt: Date;
  lastAccessedAt?: Date;
  isPrivate: boolean;
  generationPreferences?: MealPreferences; // Store preferences used to generate this meal
  glp1Notes?: string;
  difficulty?: 'easy' | 'moderate' | 'advanced';
}

export interface SaveMealRequest {
  meal: {
    title: string;
    description?: string;
    ingredients: string[];
    instructions: string[];
    nutritionTotals: NutritionInfo;
    servingSize: string;
    cookingTime: number;
    prepTime?: number;
    mealType: MealType;
  };
  tags?: string[];
  notes?: string;
  source?: MealSource;
  originalData?: GeneratedMeal;
  generationPreferences?: MealPreferences;
}

export interface MealRating {
  mealId: string;
  userId: string;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: Date;
}

export interface MealFilters {
  mealType?: MealType[];
  tags?: string[];
  source?: MealSource[];
  minRating?: number;
  maxCookingTime?: number;
  minProtein?: number;
  searchQuery?: string;
}

export interface MealSortOptions {
  field: 'savedAt' | 'rating' | 'cookingTime' | 'title';
  direction: 'asc' | 'desc';
}