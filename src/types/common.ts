// Common interfaces used throughout the application

export interface NutritionInfo {
  calories: number;
  protein: number;
  fiber: number;
  carbs: number;
  fat: number;
  sodium?: number;
  sugar?: number;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: (string | Ingredient)[];
  instructions: string[];
  nutritionTotals: NutritionInfo;
  cookingTime: number;
  prepTime?: number;
  servings: number;
  tags: string[];
  mealType?: string;
  difficulty?: 'easy' | 'moderate' | 'advanced';
  source?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  getIdToken: () => Promise<string>;
}

export interface FirebaseDocument {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  userId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  score?: number;
  warnings?: string[];
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ComponentWithLoading {
  loading: boolean;
  error?: string | null;
}