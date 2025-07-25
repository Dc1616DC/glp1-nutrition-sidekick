/**
 * Client-side nutrition calculation service for static deployment
 * Uses the improved validation and unit conversion logic
 */

import { nutritionValidationService } from './nutritionValidationService';
import { unitConversionService } from './unitConversionService';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface NutritionData {
  protein: number;
  fiber: number;
  calories: number;
  carbs: number;
  fat: number;
  source: string;
  confidence?: 'high' | 'medium' | 'low';
  warnings?: string[];
}

export class ClientNutritionService {
  
  /**
   * Calculate nutrition for ingredients with validation
   */
  calculateNutritionForIngredients(ingredients: Ingredient[]): {
    individualNutrition: NutritionData[];
    totalNutrition: NutritionData;
  } {
    console.log('🥗 Calculating nutrition for ingredients:', ingredients);
    
    const individualNutrition = ingredients.map(ingredient => 
      this.calculateSingleIngredient(ingredient)
    );
    
    const totalNutrition = this.calculateTotalNutrition(individualNutrition, ingredients);
    
    console.log('📊 Total nutrition calculated:', totalNutrition);
    
    return {
      individualNutrition,
      totalNutrition
    };
  }
  
  /**
   * Calculate nutrition for a single ingredient
   */
  private calculateSingleIngredient(ingredient: Ingredient): NutritionData {
    const name = ingredient.name.toLowerCase();
    
    // Convert to grams using the improved service
    const conversionResult = unitConversionService.convertToGrams(
      ingredient.amount, 
      ingredient.unit, 
      name, 
      true
    );
    
    const scale = conversionResult.grams / 100;
    
    // Get nutrition per 100g based on ingredient type
    let nutritionPer100g: { protein: number; fiber: number; calories: number; carbs: number; fat: number };
    
    if (name.includes('chicken') || name.includes('turkey')) {
      nutritionPer100g = { protein: 31, fiber: 0, calories: 165, carbs: 0, fat: 3.6 }; // chicken breast
    } else if (name.includes('salmon') || name.includes('fish')) {
      nutritionPer100g = { protein: 25, fiber: 0, calories: 208, carbs: 0, fat: 12.4 };
    } else if (name.includes('shrimp')) {
      nutritionPer100g = { protein: 24, fiber: 0, calories: 99, carbs: 0.2, fat: 0.3 }; // cooked shrimp
    } else if (name.includes('egg')) {
      nutritionPer100g = { protein: 13, fiber: 0, calories: 155, carbs: 1.1, fat: 11 };
    } else if (name.includes('quinoa')) {
      nutritionPer100g = { protein: 4.4, fiber: 2.8, calories: 120, carbs: 22, fat: 1.9 }; // cooked
    } else if (name.includes('beans') || name.includes('lentils')) {
      nutritionPer100g = { protein: 8.9, fiber: 8.3, calories: 132, carbs: 23, fat: 0.5 };
    } else if (name.includes('avocado')) {
      nutritionPer100g = { protein: 2, fiber: 6.7, calories: 160, carbs: 8.5, fat: 14.7 };
    } else if (name.includes('spinach') || name.includes('kale') || name.includes('greens')) {
      nutritionPer100g = { protein: 2.9, fiber: 2.2, calories: 23, carbs: 3.6, fat: 0.4 };
    } else if (name.includes('mixed vegetables') || name.includes('vegetables')) {
      nutritionPer100g = { protein: 2.5, fiber: 3.0, calories: 35, carbs: 7, fat: 0.3 }; // average mixed veggies
    } else if (name.includes('olive oil') || name.includes('oil')) {
      nutritionPer100g = { protein: 0, fiber: 0, calories: 884, carbs: 0, fat: 100 };
    } else if (name.includes('yogurt')) {
      nutritionPer100g = { protein: 10, fiber: 0, calories: 59, carbs: 3.6, fat: 0.4 }; // Greek yogurt
    } else {
      // Generic fallback
      nutritionPer100g = { protein: 5, fiber: 2, calories: 100, carbs: 15, fat: 3 };
    }
    
    // Scale to actual amount
    const scaledNutrition: NutritionData = {
      protein: nutritionPer100g.protein * scale,
      fiber: nutritionPer100g.fiber * scale,
      calories: nutritionPer100g.calories * scale,
      carbs: nutritionPer100g.carbs * scale,
      fat: nutritionPer100g.fat * scale,
      source: 'client-calculated',
      confidence: conversionResult.confidence,
      warnings: conversionResult.warnings.length > 0 ? conversionResult.warnings : undefined
    };
    
    // Validate the result
    const validation = nutritionValidationService.validateIngredientNutrition(scaledNutrition, {
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit,
      gramWeight: conversionResult.grams
    });
    
    if (validation.warnings.length > 0) {
      console.warn(`⚠️ Validation warnings for ${ingredient.name}:`, validation.warnings);
      if (validation.confidence === 'low') {
        scaledNutrition.confidence = 'low';
      }
    }
    
    console.log(`🍽️ ${ingredient.amount} ${ingredient.unit} ${ingredient.name}: ${scaledNutrition.protein.toFixed(1)}g protein, ${scaledNutrition.calories.toFixed(0)} cal`);
    
    return scaledNutrition;
  }
  
  /**
   * Calculate total nutrition with meal-level validation
   */
  private calculateTotalNutrition(nutritionData: NutritionData[], ingredients: Ingredient[]): NutritionData {
    const total = nutritionData.reduce(
      (sum, nutrition) => ({
        protein: sum.protein + nutrition.protein,
        fiber: sum.fiber + nutrition.fiber,
        calories: sum.calories + nutrition.calories,
        carbs: sum.carbs + nutrition.carbs,
        fat: sum.fat + nutrition.fat,
        source: 'client-calculated',
      }),
      { protein: 0, fiber: 0, calories: 0, carbs: 0, fat: 0, source: 'client-calculated' }
    );
    
    // Overall confidence is the lowest individual confidence
    const confidences = nutritionData.map(n => n.confidence || 'high');
    const overallConfidence = confidences.includes('low') ? 'low' : 
                             confidences.includes('medium') ? 'medium' : 'high';
    
    const result: NutritionData = {
      ...total,
      confidence: overallConfidence,
      warnings: nutritionData.flatMap(n => n.warnings || [])
    };
    
    // Validate meal-level nutrition
    const ingredientContexts = ingredients.map(ing => {
      const conversionResult = unitConversionService.convertToGrams(
        ing.amount, 
        ing.unit, 
        ing.name
      );
      return {
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        gramWeight: conversionResult.grams
      };
    });
    
    const mealValidation = nutritionValidationService.validateMealNutrition(result, ingredientContexts);
    
    if (mealValidation.warnings.length > 0) {
      console.warn('⚠️ Meal validation warnings:', mealValidation.warnings);
      if (mealValidation.confidence === 'low') {
        result.confidence = 'low';
      }
    }
    
    return result;
  }
}

export const clientNutritionService = new ClientNutritionService();