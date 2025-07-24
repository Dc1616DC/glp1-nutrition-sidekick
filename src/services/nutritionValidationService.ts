/**
 * Comprehensive nutrition validation service to prevent incorrect nutrition calculations
 * This service validates nutrition data for sanity and accuracy before showing to users
 */

export interface NutritionData {
  protein: number;
  fiber: number;
  calories: number;
  carbs: number;
  fat: number;
  source: string;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
  corrected?: NutritionData;
}

export interface IngredientContext {
  name: string;
  amount: number;
  unit: string;
  gramWeight: number;
}

export class NutritionValidationService {
  
  /**
   * Validate nutrition data for a single ingredient
   */
  validateIngredientNutrition(
    nutrition: NutritionData, 
    context: IngredientContext
  ): ValidationResult {
    const warnings: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'high';
    
    // Basic sanity checks
    const basicValidation = this.validateBasicSanity(nutrition, context);
    warnings.push(...basicValidation.warnings);
    if (!basicValidation.isValid) {
      confidence = 'low';
    }
    
    // Protein-specific validation (critical for GLP-1 users)
    const proteinValidation = this.validateProteinContent(nutrition, context);
    warnings.push(...proteinValidation.warnings);
    if (!proteinValidation.isValid) {
      confidence = 'low';
    }
    
    // Calorie consistency validation
    const calorieValidation = this.validateCalorieConsistency(nutrition);
    warnings.push(...calorieValidation.warnings);
    if (!calorieValidation.isValid && confidence === 'high') {
      confidence = 'medium';
    }
    
    // Unit conversion validation
    const unitValidation = this.validateUnitConversion(context);
    warnings.push(...unitValidation.warnings);
    if (!unitValidation.isValid) {
      confidence = 'low';
    }
    
    const isValid = warnings.length === 0 || confidence !== 'low';
    
    return {
      isValid,
      confidence,
      warnings,
    };
  }
  
  /**
   * Validate basic nutrition sanity (no impossible values)
   */
  private validateBasicSanity(nutrition: NutritionData, context: IngredientContext): ValidationResult {
    const warnings: string[] = [];
    
    // Check for negative values
    if (nutrition.protein < 0 || nutrition.fiber < 0 || nutrition.calories < 0 || 
        nutrition.carbs < 0 || nutrition.fat < 0) {
      warnings.push('Negative nutrition values detected');
    }
    
    // Check for unreasonably high values per serving
    if (nutrition.protein > 100) {
      warnings.push(`Extremely high protein (${nutrition.protein.toFixed(1)}g) for ${context.amount} ${context.unit} ${context.name}`);
    }
    
    if (nutrition.fiber > 50) {
      warnings.push(`Extremely high fiber (${nutrition.fiber.toFixed(1)}g) for ${context.amount} ${context.unit} ${context.name}`);
    }
    
    if (nutrition.calories > 2000) {
      warnings.push(`Extremely high calories (${nutrition.calories.toFixed(0)}) for ${context.amount} ${context.unit} ${context.name}`);
    }
    
    // Check protein density (should be reasonable per 100g)
    const proteinPer100g = (nutrition.protein / context.gramWeight) * 100;
    if (proteinPer100g > 90) {
      warnings.push(`Unrealistic protein density (${proteinPer100g.toFixed(1)}g per 100g) for ${context.name}`);
    }
    
    return {
      isValid: warnings.length === 0,
      confidence: warnings.length > 0 ? 'low' : 'high',
      warnings
    };
  }
  
  /**
   * Validate protein content specifically (critical for GLP-1 nutrition)
   */
  private validateProteinContent(nutrition: NutritionData, context: IngredientContext): ValidationResult {
    const warnings: string[] = [];
    const name = context.name.toLowerCase();
    
    // Expected protein ranges per 100g for common foods
    const proteinRanges: Record<string, { min: number; max: number }> = {
      'chicken': { min: 20, max: 35 },
      'turkey': { min: 20, max: 35 },
      'beef': { min: 15, max: 35 },
      'fish': { min: 15, max: 30 },
      'salmon': { min: 20, max: 30 },
      'tuna': { min: 25, max: 35 },
      'shrimp': { min: 15, max: 25 },
      'egg': { min: 10, max: 15 },
      'tofu': { min: 10, max: 20 },
      'quinoa': { min: 3, max: 6 }, // cooked
      'beans': { min: 6, max: 12 }, // cooked
      'lentils': { min: 8, max: 12 }, // cooked
      'nuts': { min: 10, max: 30 },
      'cheese': { min: 15, max: 35 },
      'yogurt': { min: 3, max: 15 },
      'milk': { min: 2, max: 5 },
    };
    
    // Find matching protein category
    let expectedRange: { min: number; max: number } | null = null;
    for (const [category, range] of Object.entries(proteinRanges)) {
      if (name.includes(category)) {
        expectedRange = range;
        break;
      }
    }
    
    if (expectedRange) {
      const proteinPer100g = (nutrition.protein / context.gramWeight) * 100;
      
      if (proteinPer100g < expectedRange.min * 0.7) { // Allow 30% margin
        warnings.push(`Low protein content (${proteinPer100g.toFixed(1)}g/100g) for ${context.name}, expected ${expectedRange.min}-${expectedRange.max}g/100g`);
      }
      
      if (proteinPer100g > expectedRange.max * 1.3) { // Allow 30% margin
        warnings.push(`High protein content (${proteinPer100g.toFixed(1)}g/100g) for ${context.name}, expected ${expectedRange.min}-${expectedRange.max}g/100g`);
      }
    }
    
    return {
      isValid: warnings.length === 0,
      confidence: warnings.length > 0 ? 'medium' : 'high',
      warnings
    };
  }
  
  /**
   * Validate that calories match macronutrient content
   */
  private validateCalorieConsistency(nutrition: NutritionData): ValidationResult {
    const warnings: string[] = [];
    
    // Calculate calories from macronutrients (4 cal/g protein & carbs, 9 cal/g fat)
    const calculatedCalories = (nutrition.protein * 4) + (nutrition.carbs * 4) + (nutrition.fat * 9);
    const difference = Math.abs(nutrition.calories - calculatedCalories);
    const percentDifference = (difference / nutrition.calories) * 100;
    
    // Allow up to 25% difference (fiber, alcohol, rounding, etc.)
    if (percentDifference > 25 && nutrition.calories > 20) { // Skip check for very low calorie items
      warnings.push(`Calorie inconsistency: reported ${nutrition.calories.toFixed(0)} cal, calculated ${calculatedCalories.toFixed(0)} cal from macros (${percentDifference.toFixed(1)}% difference)`);
    }
    
    return {
      isValid: warnings.length === 0,
      confidence: warnings.length > 0 ? 'medium' : 'high',
      warnings
    };
  }
  
  /**
   * Validate unit conversion makes sense
   */
  private validateUnitConversion(context: IngredientContext): ValidationResult {
    const warnings: string[] = [];
    
    // Check for suspicious unit conversions
    const conversionRatio = context.gramWeight / context.amount;
    
    // Sanity check common conversions
    if (context.unit === 'oz' || context.unit === 'ounce') {
      if (conversionRatio < 20 || conversionRatio > 35) {
        warnings.push(`Suspicious oz conversion: ${context.amount} oz = ${context.gramWeight}g (${conversionRatio.toFixed(1)}g/oz)`);
      }
    }
    
    if (context.unit === 'cup' || context.unit === 'cups') {
      if (conversionRatio < 30 || conversionRatio > 400) {
        warnings.push(`Suspicious cup conversion: ${context.amount} cup = ${context.gramWeight}g (${conversionRatio.toFixed(1)}g/cup)`);
      }
    }
    
    if (context.unit === 'tbsp' || context.unit === 'tablespoon') {
      if (conversionRatio < 5 || conversionRatio > 25) {
        warnings.push(`Suspicious tbsp conversion: ${context.amount} tbsp = ${context.gramWeight}g (${conversionRatio.toFixed(1)}g/tbsp)`);
      }
    }
    
    return {
      isValid: warnings.length === 0,
      confidence: warnings.length > 0 ? 'medium' : 'high',
      warnings
    };
  }
  
  /**
   * Validate total meal nutrition
   */
  validateMealNutrition(
    totalNutrition: NutritionData,
    ingredients: IngredientContext[]
  ): ValidationResult {
    const warnings: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'high';
    
    // Check if total makes sense given ingredients
    const totalWeight = ingredients.reduce((sum, ing) => sum + ing.gramWeight, 0);
    
    // Protein density check for total meal
    const proteinDensity = (totalNutrition.protein / totalWeight) * 100;
    if (proteinDensity > 50) {
      warnings.push(`Meal protein density (${proteinDensity.toFixed(1)}g/100g) is extremely high`);
      confidence = 'low';
    }
    
    // Fiber density check
    const fiberDensity = (totalNutrition.fiber / totalWeight) * 100;
    if (fiberDensity > 25) {
      warnings.push(`Meal fiber density (${fiberDensity.toFixed(1)}g/100g) is extremely high`);
      confidence = 'low';
    }
    
    // Calorie density check
    const calorieDensity = (totalNutrition.calories / totalWeight) * 100;
    if (calorieDensity > 400) {
      warnings.push(`Meal calorie density (${calorieDensity.toFixed(0)} cal/100g) is very high`);
      confidence = confidence === 'high' ? 'medium' : confidence;
    }
    
    return {
      isValid: confidence !== 'low',
      confidence,
      warnings
    };
  }
  
  /**
   * Get user-friendly warning message for display
   */
  getDisplayWarning(validation: ValidationResult): string | null {
    if (validation.confidence === 'low') {
      return 'Nutrition data may be inaccurate. Please verify ingredients and portions.';
    }
    
    if (validation.confidence === 'medium') {
      return 'Nutrition estimates - actual values may vary.';
    }
    
    return null;
  }
}

export const nutritionValidationService = new NutritionValidationService();