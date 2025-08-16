import { NutritionInfo, Ingredient } from './common';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type CookingMethod = 'any' | 'no-cook' | 'stovetop-only' | 'oven-only' | 'one-pot' | 'advanced';
export type CookingTime = 15 | 30 | 45 | 60;
export type CreativityLevel = 'simple' | 'flavorful-twists' | 'chef-inspired';
export type DifficultyLevel = 'easy' | 'moderate' | 'advanced';

export interface MealPreferences {
  mealType: MealType;
  cookingMethod: CookingMethod;
  maxCookingTime: CookingTime;
  dietaryRestrictions: string[];
  allergies: string[];
  creativityLevel?: CreativityLevel;
  assemblyToRecipeRatio?: number; // 0-100, percentage of quick assemblies vs recipes
  minProtein?: number;
  minFiber?: number;
  maxCalories?: number;
  symptomEnhancement?: string;
}

export interface MealComplexity {
  level: DifficultyLevel;
  score: number;
  factors: string[];
}

export interface MealPrepInfo {
  friendly: boolean;
  storageInstructions?: string;
  reheatingTips?: string;
  shelfLife?: string;
  batchScaling?: number;
}

export interface GLP1Benefits {
  eatingTips: string;
  benefits?: string;
}

export interface GeneratedMeal {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  prepTime?: number;
  cookingTime?: number;
  servings: number;
  nutrition?: NutritionInfo;
  nutritionTotals?: NutritionInfo;
  ingredients: (string | Ingredient)[];
  instructions: string[];
  tips?: string[];
  chefTips?: string[];
  mealStyle?: string[];
  tags?: string[];
  glp1Friendly?: GLP1Benefits;
  glp1Notes?: string;
  nutritionSource?: string;
  warnings?: string[];
  complexity?: MealComplexity;
  mealPrep?: MealPrepInfo;
  difficulty?: DifficultyLevel;
  mealType?: MealType;
  satisfactionFactors?: string[];
  appealingClassification?: string;
  assemblyTips?: string[];
  mealPrepFriendly?: boolean;
}