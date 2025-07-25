export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  nutrition?: {
    protein: number;
    fiber: number;
    calories: number;
    carbs: number;
    fat: number;
  };
}

export interface NutritionTotals {
  protein: number;
  fiber: number;
  calories: number;
  carbs: number;
  fat: number;
  giScore?: number;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutritionTotals: NutritionTotals;
  glp1Notes: string;
  cookingTime: number;
  servings: number;
  mealType: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  tags: string[];
  // Enhanced fields for chef-inspired appeal
  chefTips?: string[];
  satisfactionFactors?: string[];
  appealingClassification?: string;
  assemblyTips?: string[];
  mealPrepFriendly?: boolean;
}

export interface MealPreferences {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dietaryRestrictions: string[];
  numOptions: number;
  maxCookingTime: number;
  proteinTarget?: number;
  fiberTarget?: number;
  calorieRange?: {min: number, max: number};
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  score: number;
}

export interface CachedRecipes {
  generatedAt: Date;
  recipes: Recipe[];
  userPreferences: string; // hash of preferences
  userFeedback?: Array<{
    recipeId: string;
    rating: number;
    comment: string;
    timestamp: Date;
  }>;
}