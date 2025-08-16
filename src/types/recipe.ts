// Re-export common types for backwards compatibility
export type { NutritionInfo as NutritionTotals, Ingredient as RecipeIngredient } from './common';
export type { MealType, CookingMethod, CreativityLevel, DifficultyLevel } from './meal';

import { NutritionInfo, Ingredient } from './common';
import { MealType, DifficultyLevel } from './meal';

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutritionTotals: NutritionInfo;
  glp1Notes: string;
  cookingTime: number;
  prepTime?: number;
  servings: number;
  mealType: MealType;
  difficulty: DifficultyLevel;
  tags: string[];
  // Enhanced fields for chef-inspired appeal
  chefTips?: string[];
  satisfactionFactors?: string[];
  appealingClassification?: string;
  assemblyTips?: string[];
  mealPrepFriendly?: boolean;
  source?: string;
}

// Re-export MealPreferences from meal types for backwards compatibility
export type { MealPreferences } from './meal';

// Re-export ValidationResult from common types for backwards compatibility  
export type { ValidationResult } from './common';

export interface UserFeedback {
  recipeId: string;
  rating: number;
  comment: string;
  timestamp: Date;
}

export interface CachedRecipes {
  generatedAt: Date;
  recipes: Recipe[];
  userPreferences: string; // hash of preferences
  userFeedback?: UserFeedback[];
}