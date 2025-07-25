// Service to validate and log nutrition data quality from Spoonacular

interface NutritionValidationResult {
  isValid: boolean;
  issues: string[];
  confidence: 'high' | 'medium' | 'low';
  dataSource: string;
  warnings: string[];
}

export class NutritionValidationService {
  
  /**
   * Validate Spoonacular nutrition data for accuracy and completeness
   */
  validateSpoonacularNutrition(recipe: any): NutritionValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'high';

    const nutrition = recipe.nutrition;
    const protein = Number(nutrition.protein);
    const fiber = Number(nutrition.fiber);
    const calories = Number(nutrition.calories);
    const carbs = Number(nutrition.carbs);
    const fat = Number(nutrition.fat);

    console.log(`\n=== NUTRITION VALIDATION: ${recipe.name} ===`);
    console.log(`Protein: ${protein}g, Fiber: ${fiber}g, Calories: ${calories}, Carbs: ${carbs}g, Fat: ${fat}g`);

    // Check for missing or zero values
    if (protein === 0 || isNaN(protein)) {
      issues.push('Protein data missing or zero');
      confidence = 'low';
    }

    if (fiber === 0 || isNaN(fiber)) {
      warnings.push('Fiber data missing - may be accurate for low-fiber foods');
      confidence = confidence === 'high' ? 'medium' : confidence;
    }

    if (calories === 0 || isNaN(calories)) {
      issues.push('Calorie data missing or zero');
      confidence = 'low';
    }

    // Check for impossible nutrition ratios
    if (calories > 0 && protein > 0) {
      const proteinCalories = protein * 4;
      const proteinPercent = (proteinCalories / calories) * 100;
      
      if (proteinPercent > 80) {
        issues.push(`Impossible protein ratio: ${proteinPercent.toFixed(1)}% of calories from protein`);
        confidence = 'low';
      }
      
      if (proteinPercent > 50) {
        warnings.push(`Very high protein ratio: ${proteinPercent.toFixed(1)}% of calories from protein`);
        confidence = confidence === 'high' ? 'medium' : confidence;
      }
    }

    // Check calorie calculation against macros
    if (protein > 0 && carbs > 0 && fat > 0 && calories > 0) {
      const calculatedCalories = (protein * 4) + (carbs * 4) + (fat * 9);
      const difference = Math.abs(calories - calculatedCalories);
      const percentDifference = (difference / calories) * 100;
      
      if (percentDifference > 30) {
        issues.push(`Calorie calculation doesn't match macros: ${calories} vs ${calculatedCalories.toFixed(0)} calculated`);
        confidence = 'low';
      } else if (percentDifference > 15) {
        warnings.push(`Moderate calorie discrepancy: ${percentDifference.toFixed(1)}% difference`);
        confidence = confidence === 'high' ? 'medium' : confidence;
      }
    }

    // Check for suspiciously round numbers (often indicates estimates)
    const isProteinRound = protein % 5 === 0;
    const isFiberRound = fiber % 1 === 0;
    const isCaloriesRound = calories % 10 === 0;
    
    if (isProteinRound && isFiberRound && isCaloriesRound) {
      warnings.push('Nutrition values appear to be rounded estimates');
      confidence = confidence === 'high' ? 'medium' : confidence;
    }

    // Log validation results
    console.log(`Confidence: ${confidence}`);
    if (issues.length > 0) console.log(`Issues: ${issues.join(', ')}`);
    if (warnings.length > 0) console.log(`Warnings: ${warnings.join(', ')}`);

    return {
      isValid: issues.length === 0,
      issues,
      confidence,
      dataSource: 'Spoonacular API',
      warnings
    };
  }

  /**
   * Compare nutrition data between search results and detailed recipe
   */
  compareNutritionSources(searchNutrition: any, detailedNutrition: any, recipeName: string): void {
    console.log(`\n=== NUTRITION SOURCE COMPARISON: ${recipeName} ===`);
    
    if (!searchNutrition && !detailedNutrition) {
      console.log('❌ No nutrition data available from either source');
      return;
    }

    if (!searchNutrition) {
      console.log('⚠️ No nutrition from search, using detailed recipe data');
      return;
    }

    if (!detailedNutrition) {
      console.log('⚠️ No nutrition from detailed recipe, using search data');
      return;
    }

    // Compare key nutrients
    const searchProtein = Number(searchNutrition.protein || 0);
    const detailedProtein = this.extractNutrientFromDetailed(detailedNutrition, 'Protein');
    
    const searchCalories = Number(searchNutrition.calories || 0);
    const detailedCalories = this.extractNutrientFromDetailed(detailedNutrition, 'Calories');

    if (searchProtein > 0 && detailedProtein > 0) {
      const proteinDiff = Math.abs(searchProtein - detailedProtein);
      const proteinPercent = (proteinDiff / searchProtein) * 100;
      
      if (proteinPercent > 20) {
        console.log(`⚠️ Protein mismatch: Search=${searchProtein}g, Detailed=${detailedProtein}g (${proteinPercent.toFixed(1)}% diff)`);
      } else {
        console.log(`✅ Protein consistent: Search=${searchProtein}g, Detailed=${detailedProtein}g`);
      }
    }

    if (searchCalories > 0 && detailedCalories > 0) {
      const caloriesDiff = Math.abs(searchCalories - detailedCalories);
      const caloriesPercent = (caloriesDiff / searchCalories) * 100;
      
      if (caloriesPercent > 20) {
        console.log(`⚠️ Calorie mismatch: Search=${searchCalories}, Detailed=${detailedCalories} (${caloriesPercent.toFixed(1)}% diff)`);
      } else {
        console.log(`✅ Calories consistent: Search=${searchCalories}, Detailed=${detailedCalories}`);
      }
    }
  }

  /**
   * Extract nutrient value from detailed recipe nutrition array
   */
  private extractNutrientFromDetailed(nutrition: any, nutrientName: string): number {
    if (!nutrition?.nutrients) return 0;
    
    const nutrient = nutrition.nutrients.find((n: any) => 
      n.name && n.name.toLowerCase().includes(nutrientName.toLowerCase())
    );
    
    return Number(nutrient?.amount || 0);
  }

  /**
   * Generate nutrition disclaimer based on data quality
   */
  generateNutritionDisclaimer(validation: NutritionValidationResult): string {
    const disclaimers = [];

    disclaimers.push('Nutrition facts provided by Spoonacular API');

    if (validation.confidence === 'low') {
      disclaimers.push('⚠️ Nutrition data quality is low - use as rough estimate only');
    } else if (validation.confidence === 'medium') {
      disclaimers.push('⚠️ Nutrition data has some uncertainties');
    }

    if (validation.warnings.length > 0) {
      disclaimers.push('See warnings for data quality notes');
    }

    disclaimers.push('Always consult healthcare providers for medical nutrition advice');

    return disclaimers.join('. ') + '.';
  }

  /**
   * Log comprehensive nutrition debugging info
   */
  logNutritionDebugInfo(recipe: any): void {
    console.log(`\n=== NUTRITION DEBUG: ${recipe.name} ===`);
    console.log('Recipe ID:', recipe.id);
    console.log('Servings:', recipe.servings);
    console.log('Ready time:', recipe.readyInMinutes);
    
    if (recipe.nutrition) {
      console.log('Nutrition object keys:', Object.keys(recipe.nutrition));
      console.log('Raw nutrition data:', JSON.stringify(recipe.nutrition, null, 2));
    } else {
      console.log('❌ No nutrition object found');
    }

    if (recipe.extendedIngredients) {
      console.log('Ingredients count:', recipe.extendedIngredients.length);
      console.log('Sample ingredients:', recipe.extendedIngredients.slice(0, 3).map((ing: any) => ing.original));
    }
  }
}

export const nutritionValidationService = new NutritionValidationService();