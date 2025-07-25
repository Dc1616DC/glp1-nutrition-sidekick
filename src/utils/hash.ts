import { createHash } from 'crypto';
import { MealPreferences } from '../types/recipe';

/**
 * Create a hash from meal preferences for caching
 */
export function hashPreferences(preferences: MealPreferences): string {
  // Create a normalized string representation
  const normalized = {
    mealType: preferences.mealType,
    restrictions: preferences.dietaryRestrictions.sort(), // Sort for consistency
    maxTime: preferences.maxCookingTime,
    protein: preferences.proteinTarget || 20,
    fiber: preferences.fiberTarget || 4,
    calories: preferences.calorieRange || { min: 400, max: 600 },
  };

  const preferencesString = JSON.stringify(normalized);
  return createHash('md5').update(preferencesString).digest('hex');
}

/**
 * Create a unique recipe ID
 */
export function generateRecipeId(source: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${source}_${timestamp}_${random}`;
}

/**
 * Simple text hash for ingredient caching
 */
export function hashText(text: string): string {
  return createHash('md5').update(text.toLowerCase().trim()).digest('hex');
}