/**
 * Unified nutrition validation service for GLP-1 optimized nutrition
 * Combines validation, scoring, and improvement suggestions
 */

import { Recipe, RecipeIngredient } from '../types/recipe';

export interface NutritionData {
  protein: number;
  fiber: number;
  calories: number;
  carbs: number;
  fat: number;
  source: string;
}

export interface ValidationResult {
  valid: boolean; // Changed to match common.ts interface
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
  issues: string[];
  score: number; // 0-100 score for GLP-1 compatibility
  suggestions?: string[];
}

export interface IngredientContext {
  name: string;
  amount: number;
  unit: string;
  gramWeight: number;
}

export class NutritionValidationService {
  
  // GLP-1 specific requirements
  private readonly MIN_PROTEIN = 20; // grams
  private readonly MIN_FIBER = 4; // grams
  private readonly MIN_CALORIES = 400;
  private readonly MAX_CALORIES = 600;
  private readonly TARGET_PROTEIN_PERCENT = 30; // 25-35% ideal

  /**
   * Main validation method for GLP-1 optimized recipes
   */
  validateRecipe(recipe: Recipe): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    let confidence: 'high' | 'medium' | 'low' = 'high';

    const nutrition = recipe.nutritionTotals;

    // Critical GLP-1 requirements
    if (nutrition.protein < this.MIN_PROTEIN) {
      issues.push(`Protein too low: ${nutrition.protein.toFixed(1)}g (need ${this.MIN_PROTEIN}g+ for GLP-1 satiety)`);
      score -= 30;
    }

    if (nutrition.fiber < this.MIN_FIBER) {
      issues.push(`Fiber too low: ${nutrition.fiber.toFixed(1)}g (need ${this.MIN_FIBER}g+ for blood sugar control)`);
      score -= 25;
    }

    // Calorie range validation
    if (nutrition.calories < this.MIN_CALORIES) {
      issues.push(`Calories too low: ${nutrition.calories} (need ${this.MIN_CALORIES}+ for adequate nutrition)`);
      score -= 20;
    } else if (nutrition.calories > this.MAX_CALORIES) {
      warnings.push(`Calories high: ${nutrition.calories} (target under ${this.MAX_CALORIES} for GLP-1 portion control)`);
      score -= 10;
    }

    // Check for impossible values
    const sanityCheck = this.validateBasicSanity(nutrition);
    if (!sanityCheck.isValid) {
      issues.push(...sanityCheck.issues);
      confidence = 'low';
      score -= 50;
    }

    // Protein percentage check
    const proteinPercent = this.calculateProteinPercentage(nutrition);
    if (proteinPercent < 25) {
      warnings.push(`Protein percentage low: ${proteinPercent.toFixed(1)}% (aim for 25-35%)`);
      score -= 10;
    } else if (proteinPercent > 40) {
      warnings.push(`Protein percentage high: ${proteinPercent.toFixed(1)}% (may be hard to digest)`);
      score -= 5;
    }

    // Satiety score
    const satietyScore = this.calculateSatietyScore(recipe);
    if (satietyScore < 60) {
      warnings.push('Low satiety factors (may not provide lasting fullness)');
      score -= 10;
    }

    // Glycemic index estimation
    const giScore = this.estimateGIScore(recipe.ingredients);
    if (giScore > 55) {
      warnings.push(`High glycemic index: ${giScore} (prefer <55 for blood sugar control)`);
      score -= 15;
    }

    // Ensure score doesn't go negative
    score = Math.max(0, score);

    // Determine overall confidence
    if (issues.length > 2 || score < 50) {
      confidence = 'low';
    } else if (warnings.length > 3 || score < 75) {
      confidence = 'medium';
    }

    // Generate improvement suggestions
    const suggestions = this.generateSuggestions(issues, warnings);

    return {
      valid: issues.length === 0,
      confidence,
      warnings,
      issues,
      score,
      suggestions
    };
  }

  /**
   * Validate individual ingredient nutrition
   */
  validateIngredientNutrition(
    nutrition: NutritionData, 
    context: IngredientContext
  ): ValidationResult {
    const warnings: string[] = [];
    const issues: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'high';
    let score = 100;
    
    // Basic sanity checks
    const basicValidation = this.validateBasicSanity(nutrition);
    if (!basicValidation.isValid) {
      issues.push(...basicValidation.issues);
      confidence = 'low';
      score -= 50;
    }
    
    // Protein-specific validation
    const proteinValidation = this.validateProteinContent(nutrition, context);
    warnings.push(...proteinValidation.warnings);
    if (!proteinValidation.isValid) {
      confidence = 'low';
      score -= 30;
    }
    
    // Unit conversion validation
    const unitValidation = this.validateUnitConversion(context);
    warnings.push(...unitValidation.warnings);
    if (!unitValidation.isValid) {
      confidence = confidence === 'high' ? 'medium' : confidence;
      score -= 20;
    }
    
    return {
      valid: issues.length === 0,
      confidence,
      warnings,
      issues,
      score,
      suggestions: []
    };
  }

  /**
   * Validate basic nutrition sanity (no impossible values)
   */
  private validateBasicSanity(nutrition: NutritionData | any): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for negative values
    if (nutrition.protein < 0 || nutrition.fiber < 0 || nutrition.calories < 0 || 
        nutrition.carbs < 0 || nutrition.fat < 0) {
      issues.push('Negative nutrition values detected');
    }
    
    // Check for extreme values
    if (nutrition.protein > 100) {
      issues.push(`Unrealistic protein: ${nutrition.protein.toFixed(1)}g per serving`);
    }
    
    if (nutrition.fiber > 50) {
      issues.push(`Unrealistic fiber: ${nutrition.fiber.toFixed(1)}g per serving`);
    }
    
    if (nutrition.calories > 2000) {
      issues.push(`Unrealistic calories: ${nutrition.calories} per serving`);
    }

    // Check calorie consistency with macros
    const calculatedCalories = (nutrition.protein * 4) + (nutrition.carbs * 4) + (nutrition.fat * 9);
    const difference = Math.abs(nutrition.calories - calculatedCalories);
    const percentDifference = (difference / nutrition.calories) * 100;
    
    if (percentDifference > 30 && nutrition.calories > 50) {
      issues.push(`Calorie mismatch: reported ${nutrition.calories}, calculated ${calculatedCalories.toFixed(0)} from macros`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Validate protein content for known ingredients
   */
  private validateProteinContent(nutrition: NutritionData, context: IngredientContext): { isValid: boolean; warnings: string[] } {
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
      'cheese': { min: 15, max: 35 },
      'yogurt': { min: 3, max: 15 },
    };
    
    // Find matching protein category
    let expectedRange: { min: number; max: number } | null = null;
    for (const [category, range] of Object.entries(proteinRanges)) {
      if (name.includes(category)) {
        expectedRange = range;
        break;
      }
    }
    
    if (expectedRange && context.gramWeight > 0) {
      const proteinPer100g = (nutrition.protein / context.gramWeight) * 100;
      
      if (proteinPer100g < expectedRange.min * 0.7) {
        warnings.push(`Low protein for ${context.name}: ${proteinPer100g.toFixed(1)}g/100g`);
      }
      
      if (proteinPer100g > expectedRange.max * 1.3) {
        warnings.push(`High protein for ${context.name}: ${proteinPer100g.toFixed(1)}g/100g`);
      }
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Validate unit conversion makes sense
   */
  private validateUnitConversion(context: IngredientContext): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    if (context.amount <= 0 || context.gramWeight <= 0) {
      return { isValid: true, warnings }; // Skip if no valid conversion data
    }

    const conversionRatio = context.gramWeight / context.amount;
    
    // Check common conversions
    if (context.unit === 'oz' || context.unit === 'ounce') {
      if (conversionRatio < 20 || conversionRatio > 35) {
        warnings.push(`Unusual oz conversion: ${context.amount} oz = ${context.gramWeight}g`);
      }
    }
    
    if (context.unit === 'cup' || context.unit === 'cups') {
      if (conversionRatio < 30 || conversionRatio > 400) {
        warnings.push(`Unusual cup conversion: ${context.amount} cup = ${context.gramWeight}g`);
      }
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Calculate protein percentage of total calories
   */
  private calculateProteinPercentage(nutrition: NutritionData | any): number {
    if (nutrition.calories <= 0) return 0;
    const proteinCalories = nutrition.protein * 4;
    return (proteinCalories / nutrition.calories) * 100;
  }

  /**
   * Calculate satiety score based on recipe composition
   */
  private calculateSatietyScore(recipe: Recipe): number {
    let score = 0;
    
    // Protein content (major satiety factor)
    score += Math.min(30, recipe.nutritionTotals.protein * 1.5);
    
    // Fiber content
    score += Math.min(20, recipe.nutritionTotals.fiber * 5);
    
    // Volume foods (vegetables)
    const volumeFoods = recipe.ingredients.filter(ing => {
      const name = ing.name.toLowerCase();
      return name.includes('broccoli') || name.includes('cauliflower') ||
             name.includes('spinach') || name.includes('zucchini') ||
             name.includes('lettuce') || name.includes('cabbage');
    });
    score += Math.min(15, volumeFoods.length * 5);
    
    // Healthy fats
    const healthyFats = recipe.ingredients.filter(ing => {
      const name = ing.name.toLowerCase();
      return name.includes('avocado') || name.includes('olive oil') ||
             name.includes('nuts') || name.includes('seeds');
    });
    score += Math.min(15, healthyFats.length * 5);
    
    // Cooking methods that preserve volume
    const instructions = recipe.instructions.join(' ').toLowerCase();
    if (instructions.includes('grill') || instructions.includes('roast') || instructions.includes('steam')) {
      score += 10;
    }
    
    // Penalize refined carbs
    const refinedCarbs = recipe.ingredients.filter(ing => {
      const name = ing.name.toLowerCase();
      return name.includes('sugar') || name.includes('white bread') ||
             name.includes('white rice') || name.includes('pasta');
    });
    score -= refinedCarbs.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estimate Glycemic Index score
   */
  private estimateGIScore(ingredients: RecipeIngredient[]): number {
    let totalScore = 0;
    let weightedTotal = 0;

    for (const ingredient of ingredients) {
      if (!ingredient || !ingredient.name) continue;
      
      const name = ingredient.name.toLowerCase();
      const amount = ingredient.amount || 1;
      
      let giScore = 50; // Default moderate GI
      
      // High GI foods (>70)
      if (name.includes('sugar') || name.includes('honey') || name.includes('syrup')) {
        giScore = 85;
      } else if (name.includes('white bread') || name.includes('white rice')) {
        giScore = 75;
      } else if (name.includes('potato') && !name.includes('sweet')) {
        giScore = 70;
      }
      // Low GI foods (<55)
      else if (name.includes('broccoli') || name.includes('spinach') || name.includes('lettuce')) {
        giScore = 15;
      } else if (name.includes('chicken') || name.includes('fish') || name.includes('eggs')) {
        giScore = 0; // Protein has minimal GI impact
      } else if (name.includes('avocado') || name.includes('olive oil') || name.includes('nuts')) {
        giScore = 10; // Fats have minimal GI impact
      } else if (name.includes('quinoa') || name.includes('steel-cut oats')) {
        giScore = 35;
      }

      totalScore += giScore * amount;
      weightedTotal += amount;
    }

    return weightedTotal > 0 ? Math.round(totalScore / weightedTotal) : 50;
  }

  /**
   * Generate improvement suggestions based on validation results
   */
  private generateSuggestions(issues: string[], warnings: string[]): string[] {
    const suggestions: string[] = [];
    
    // Process issues
    issues.forEach(issue => {
      if (issue.includes('Protein too low')) {
        suggestions.push('Add lean protein: chicken breast, fish, eggs, or Greek yogurt');
      } else if (issue.includes('Fiber too low')) {
        suggestions.push('Include high-fiber vegetables: broccoli, spinach, or cauliflower');
      } else if (issue.includes('Calories too low')) {
        suggestions.push('Add healthy fats: avocado, nuts, or olive oil');
      }
    });

    // Process warnings
    warnings.forEach(warning => {
      if (warning.includes('Calories high')) {
        suggestions.push('Consider smaller portions or lower-calorie ingredients');
      } else if (warning.includes('High glycemic index')) {
        suggestions.push('Replace refined carbs with whole grains or vegetables');
      } else if (warning.includes('Low satiety')) {
        suggestions.push('Add more volume with non-starchy vegetables');
      }
    });
    
    return [...new Set(suggestions)]; // Remove duplicates
  }

  /**
   * Generate user-friendly nutrition disclaimer
   */
  generateNutritionDisclaimer(validation: ValidationResult): string {
    if (validation.score >= 90) {
      return 'Excellent GLP-1 compliance - optimized for satiety and blood sugar control';
    } else if (validation.score >= 75) {
      return 'Good GLP-1 compatibility - meets core protein and fiber requirements';
    } else if (validation.score >= 60) {
      return 'Moderate GLP-1 compatibility - consider modifications for better results';
    } else {
      return 'Low GLP-1 compatibility - may not provide optimal medication synergy';
    }
  }

  /**
   * Validate ingredient for data corruption
   */
  validateIngredient(ingredient: RecipeIngredient): boolean {
    const name = ingredient.name.toLowerCase();
    
    // Check for instruction text mixed into ingredients
    const corruptionPatterns = [
      /^\d+[a-z]/i, // Starts with number+letter like "2Fry"
      /\b(add|fry|cook|boil|serve|ready|then|till|flame|minutes?|degrees?)\b/i,
      /step \d+/i, // "step 1", "step 2"
      /\d+\.\s/i, // "1. ", "2. " (numbered lists)
    ];
    
    return !corruptionPatterns.some(pattern => pattern.test(name));
  }
}

// Export singleton instance
export const nutritionValidationService = new NutritionValidationService();
export default NutritionValidationService;