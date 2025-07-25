import { Recipe, ValidationResult, RecipeIngredient } from '../types/recipe';

export class NutritionValidationService {
  /**
   * Validate a recipe against GLP-1 specific requirements
   */
  validateGLP1Recipe(recipe: Recipe): ValidationResult {
    const issues: string[] = [];
    let score = 100; // Start with perfect score, deduct points for issues

    const nutrition = recipe.nutritionTotals;

    // Critical GLP-1 requirements
    if (nutrition.protein < 20) {
      issues.push(`Protein too low: ${nutrition.protein.toFixed(1)}g (need 20g+ for GLP-1 satiety)`);
      score -= 30;
    }

    if (nutrition.fiber < 4) {
      issues.push(`Fiber too low: ${nutrition.fiber.toFixed(1)}g (need 4g+ for blood sugar control)`);
      score -= 25;
    }

    // Calorie range validation
    if (nutrition.calories < 400) {
      issues.push(`Calories too low: ${nutrition.calories} (need 400+ for adequate nutrition)`);
      score -= 20;
    } else if (nutrition.calories > 600) {
      issues.push(`Calories too high: ${nutrition.calories} (max 600 for GLP-1 portion control)`);
      score -= 15;
    }

    // Nutrition balance checks
    const proteinCalories = nutrition.protein * 4;
    const proteinPercent = (proteinCalories / nutrition.calories) * 100;
    
    if (proteinPercent < 25) {
      issues.push(`Protein percentage too low: ${proteinPercent.toFixed(1)}% (aim for 25-35%)`);
      score -= 10;
    } else if (proteinPercent > 40) {
      issues.push(`Protein percentage too high: ${proteinPercent.toFixed(1)}% (may be hard to digest)`);
      score -= 5;
    }

    // Check for impossible/corrupt values
    if (this.hasImpossibleValues(nutrition)) {
      issues.push('Impossible nutrition values detected (likely data corruption)');
      score -= 50;
    }

    // Estimate Glycemic Index score
    const giScore = this.estimateGIScore(recipe.ingredients);
    if (giScore > 55) {
      issues.push(`High glycemic index: ${giScore} (prefer <55 for blood sugar control)`);
      score -= 15;
    }

    // Satiety factors
    const satietyScore = this.calculateSatietyScore(recipe);
    if (satietyScore < 60) {
      issues.push('Low satiety factors (may not provide lasting fullness)');
      score -= 10;
    }

    // Ensure score doesn't go negative
    score = Math.max(0, score);

    return {
      valid: issues.length === 0,
      issues,
      score
    };
  }

  /**
   * Check for impossible nutrition values that indicate data corruption
   */
  private hasImpossibleValues(nutrition: any): boolean {
    const values = Object.values(nutrition) as number[];
    
    // Check for negative values
    if (values.some(v => v < 0)) return true;
    
    // Check for extreme values that suggest corruption
    if (nutrition.protein > 100) return true; // >100g protein per serving is unrealistic
    if (nutrition.fiber > 50) return true; // >50g fiber per serving is unrealistic
    if (nutrition.calories > 2000) return true; // >2000 calories per serving is too much
    
    return false;
  }

  /**
   * Estimate Glycemic Index score based on ingredients
   */
  estimateGIScore(ingredients: RecipeIngredient[]): number {
    let totalScore = 0;
    let weightedTotal = 0;

    for (const ingredient of ingredients) {
      // Defensive programming for ingredient structure
      if (!ingredient || !ingredient.name || typeof ingredient.name !== 'string') {
        continue; // Skip invalid ingredients
      }
      
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
      // Medium GI foods (55-70)
      else if (name.includes('brown rice') || name.includes('whole wheat')) {
        giScore = 60;
      } else if (name.includes('banana') || name.includes('orange juice')) {
        giScore = 55;
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

    return weightedTotal > 0 ? totalScore / weightedTotal : 50;
  }

  /**
   * Calculate satiety score based on ingredients and preparation
   */
  private calculateSatietyScore(recipe: Recipe): number {
    let score = 0;
    const ingredients = recipe.ingredients;
    
    // Protein content (major satiety factor)
    const proteinScore = Math.min(30, recipe.nutritionTotals.protein * 1.5);
    score += proteinScore;
    
    // Fiber content (helps with fullness)
    const fiberScore = Math.min(20, recipe.nutritionTotals.fiber * 5);
    score += fiberScore;
    
    // Volume foods (vegetables, low-calorie density)
    const volumeFoods = ingredients.filter(ing => 
      ing.name.toLowerCase().includes('broccoli') ||
      ing.name.toLowerCase().includes('cauliflower') ||
      ing.name.toLowerCase().includes('spinach') ||
      ing.name.toLowerCase().includes('zucchini') ||
      ing.name.toLowerCase().includes('lettuce')
    );
    score += Math.min(15, volumeFoods.length * 5);
    
    // Healthy fats (moderate amounts help satiety)
    const healthyFats = ingredients.filter(ing =>
      ing.name.toLowerCase().includes('avocado') ||
      ing.name.toLowerCase().includes('olive oil') ||
      ing.name.toLowerCase().includes('nuts') ||
      ing.name.toLowerCase().includes('seeds')
    );
    score += Math.min(15, healthyFats.length * 5);
    
    // Cooking methods that preserve texture/volume
    const instructions = recipe.instructions.join(' ').toLowerCase();
    if (instructions.includes('grill') || instructions.includes('roast') || instructions.includes('steam')) {
      score += 10;
    }
    
    // Penalize high sugar/refined carbs
    const refinedCarbs = ingredients.filter(ing =>
      ing.name.toLowerCase().includes('sugar') ||
      ing.name.toLowerCase().includes('white bread') ||
      ing.name.toLowerCase().includes('white rice')
    );
    score -= refinedCarbs.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate nutrition disclaimer based on validation results
   */
  generateNutritionDisclaimer(validation: ValidationResult): string {
    if (validation.valid && validation.score >= 90) {
      return 'Excellent GLP-1 compliance - optimized for satiety and blood sugar control';
    } else if (validation.valid && validation.score >= 75) {
      return 'Good GLP-1 compatibility - meets core protein and fiber requirements';
    } else if (validation.score >= 60) {
      return 'Moderate GLP-1 compatibility - consider modifications for better results';
    } else {
      return 'Low GLP-1 compatibility - may not provide optimal medication synergy';
    }
  }

  /**
   * Suggest improvements for failed validation
   */
  suggestImprovements(validation: ValidationResult): string[] {
    const suggestions: string[] = [];
    
    validation.issues.forEach(issue => {
      if (issue.includes('Protein too low')) {
        suggestions.push('Add lean protein: chicken breast, fish, eggs, or Greek yogurt');
      } else if (issue.includes('Fiber too low')) {
        suggestions.push('Include high-fiber vegetables: broccoli, spinach, or cauliflower');
      } else if (issue.includes('Calories too high')) {
        suggestions.push('Reduce portion sizes or use lower-calorie ingredients');
      } else if (issue.includes('High glycemic index')) {
        suggestions.push('Replace refined carbs with whole grains or vegetables');
      } else if (issue.includes('Low satiety factors')) {
        suggestions.push('Add volume with non-starchy vegetables and healthy fats');
      }
    });
    
    return suggestions;
  }

  /**
   * Validate ingredient for potential data corruption
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

export const nutritionValidationService = new NutritionValidationService();