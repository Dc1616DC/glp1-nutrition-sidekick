import { RecipeIngredient } from '../types/recipe';

const USDA_API_KEY = process.env.USDA_API_KEY!;
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

interface USDANutrient {
  nutrientName: string;
  value: number;
  unitName: string;
}

interface USDAFood {
  fdcId: number;
  description: string;
  foodNutrients: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

interface NutritionData {
  protein: number;
  fiber: number;
  calories: number;
  carbs: number;
  fat: number;
}

export class USDAService {
  private cache = new Map<string, USDAFood>();
  
  /**
   * Get accurate nutrition data for a recipe ingredient
   */
  async getNutritionForIngredient(ingredient: RecipeIngredient): Promise<NutritionData> {
    // Defensive programming: ensure ingredient has required properties
    if (!ingredient || !ingredient.name || typeof ingredient.name !== 'string') {
      console.warn('⚠️ Invalid ingredient structure:', ingredient);
      return this.getFallbackNutrition({
        name: 'unknown ingredient',
        amount: 1,
        unit: 'serving'
      });
    }

    const cacheKey = `${ingredient.name.toLowerCase()}_${ingredient.amount || 1}_${ingredient.unit || 'serving'}`;
    
    try {
      // Search for the food item
      const foodData = await this.searchFood(ingredient.name);
      if (!foodData) {
        throw new Error(`Food not found: ${ingredient.name}`);
      }

      // Calculate nutrition based on amount and unit
      const nutrition = this.calculateNutrition(foodData, ingredient.amount, ingredient.unit);
      
      console.log(`📊 Nutrition for ${ingredient.name}: ${nutrition.protein}g protein, ${nutrition.fiber}g fiber`);
      
      return nutrition;

    } catch (error) {
      console.error(`❌ USDA API error for ${ingredient.name}:`, error);
      
      // Return fallback estimates to prevent complete failure
      return this.getFallbackNutrition(ingredient);
    }
  }

  /**
   * Get nutrition data for multiple ingredients in parallel
   */
  async getNutritionForIngredients(ingredients: RecipeIngredient[]): Promise<NutritionData[]> {
    console.log(`🔍 Fetching nutrition data for ${ingredients.length} ingredients...`);
    
    const nutritionPromises = ingredients.map(ingredient => 
      this.getNutritionForIngredient(ingredient)
    );
    
    // Add small delays to avoid rate limiting
    const results: NutritionData[] = [];
    for (let i = 0; i < nutritionPromises.length; i++) {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
      }
      try {
        const result = await nutritionPromises[i];
        results.push(result);
      } catch (error) {
        console.error(`Failed to get nutrition for ingredient ${i}:`, error);
        results.push(this.getFallbackNutrition(ingredients[i]));
      }
    }
    
    return results;
  }

  /**
   * Calculate total nutrition for all ingredients combined
   */
  calculateTotalNutrition(nutritionData: NutritionData[]): NutritionData {
    return nutritionData.reduce(
      (total, nutrition) => ({
        protein: total.protein + nutrition.protein,
        fiber: total.fiber + nutrition.fiber,
        calories: total.calories + nutrition.calories,
        carbs: total.carbs + nutrition.carbs,
        fat: total.fat + nutrition.fat,
      }),
      { protein: 0, fiber: 0, calories: 0, carbs: 0, fat: 0 }
    );
  }

  /**
   * Search for food in USDA database
   */
  private async searchFood(foodName: string): Promise<USDAFood | null> {
    const cleanName = foodName.toLowerCase().trim();
    
    // Check cache first
    if (this.cache.has(cleanName)) {
      return this.cache.get(cleanName)!;
    }

    try {
      const searchUrl = `${BASE_URL}/foods/search?query=${encodeURIComponent(cleanName)}&api_key=${USDA_API_KEY}&pageSize=5`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        throw new Error(`USDA search failed: ${searchResponse.status}`);
      }
      
      const searchData = await searchResponse.json();
      
      if (!searchData.foods || searchData.foods.length === 0) {
        return null;
      }

      // Get detailed nutrition for the first/best match
      const bestMatch = this.selectBestMatch(searchData.foods, foodName);
      const detailsUrl = `${BASE_URL}/food/${bestMatch.fdcId}?api_key=${USDA_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      
      if (!detailsResponse.ok) {
        throw new Error(`USDA details failed: ${detailsResponse.status}`);
      }
      
      const foodData = await detailsResponse.json();
      
      // Cache the result
      this.cache.set(cleanName, foodData);
      
      return foodData;

    } catch (error) {
      console.error(`USDA search error for "${foodName}":`, error);
      return null;
    }
  }

  /**
   * Select the best matching food from search results
   */
  private selectBestMatch(foods: Record<string, unknown>[], searchTerm: string): Record<string, unknown> {
    // Simple scoring: prefer items with more complete nutrition data and closer name match
    const scored = foods.map(food => {
      const nameScore = this.calculateNameSimilarity(food.description as string, searchTerm);
      const dataScore = food.foodNutrients ? (food.foodNutrients as unknown[]).length : 0;
      return { ...food, score: nameScore + (dataScore * 0.1) };
    });

    return scored.sort((a, b) => b.score - a.score)[0];
  }

  /**
   * Calculate name similarity score
   */
  private calculateNameSimilarity(description: string, searchTerm: string): number {
    const desc = description.toLowerCase();
    const term = searchTerm.toLowerCase();
    
    if (desc === term) return 10;
    if (desc.includes(term)) return 8;
    if (term.split(' ').some(word => desc.includes(word))) return 5;
    return 0;
  }

  /**
   * Calculate nutrition based on amount and unit
   */
  private calculateNutrition(foodData: USDAFood, amount: number, unit: string): NutritionData {
    const servingSize = foodData.servingSize || 100; // Default to 100g
    const servingUnit = foodData.servingSizeUnit || 'g';
    
    // Convert amount to grams for calculation
    const amountInGrams = this.convertToGrams(amount, unit);
    const scale = amountInGrams / servingSize;

    // Extract key nutrients
    const nutrients = foodData.foodNutrients || [];
    
    const getNutrientValue = (names: string[]): number => {
      const nutrient = nutrients.find(n => 
        names.some(name => n.nutrientName.toLowerCase().includes(name.toLowerCase()))
      );
      return nutrient ? nutrient.value * scale : 0;
    };

    return {
      protein: getNutrientValue(['Protein']),
      fiber: getNutrientValue(['Fiber', 'dietary fiber']),
      calories: getNutrientValue(['Energy', 'Calories']),
      carbs: getNutrientValue(['Carbohydrate']),
      fat: getNutrientValue(['Total lipid', 'Fat']),
    };
  }

  /**
   * Convert various units to grams
   */
  private convertToGrams(amount: number, unit: string): number {
    const unitLower = unit.toLowerCase().trim();
    
    const conversions: { [key: string]: number } = {
      'g': 1,
      'gram': 1,
      'grams': 1,
      'kg': 1000,
      'kilogram': 1000,
      'oz': 28.35,
      'ounce': 28.35,
      'ounces': 28.35,
      'lb': 453.59,
      'pound': 453.59,
      'pounds': 453.59,
      'cup': 240, // Approximate for liquids
      'cups': 240,
      'tbsp': 15,
      'tablespoon': 15,
      'tablespoons': 15,
      'tsp': 5,
      'teaspoon': 5,
      'teaspoons': 5,
      'ml': 1, // Approximate for water
      'milliliter': 1,
      'milliliters': 1,
      'l': 1000,
      'liter': 1000,
      'liters': 1000,
    };

    return amount * (conversions[unitLower] || 1); // Default to 1 if unknown unit
  }

  /**
   * Provide fallback nutrition estimates when USDA fails
   */
  private getFallbackNutrition(ingredient: RecipeIngredient): NutritionData {
    // Defensive programming for ingredient name
    const name = (ingredient?.name || 'unknown').toLowerCase();
    const amount = ingredient?.amount || 1;
    
    // Simple heuristics based on food type
    if (name.includes('chicken') || name.includes('beef') || name.includes('pork')) {
      return { protein: amount * 0.25, fiber: 0, calories: amount * 2, carbs: 0, fat: amount * 0.1 };
    }
    if (name.includes('fish') || name.includes('salmon') || name.includes('tuna')) {
      return { protein: amount * 0.22, fiber: 0, calories: amount * 1.5, carbs: 0, fat: amount * 0.08 };
    }
    if (name.includes('egg')) {
      return { protein: amount * 0.13, fiber: 0, calories: amount * 1.55, carbs: amount * 0.01, fat: amount * 0.1 };
    }
    if (name.includes('broccoli') || name.includes('spinach') || name.includes('kale')) {
      return { protein: amount * 0.03, fiber: amount * 0.03, calories: amount * 0.25, carbs: amount * 0.04, fat: 0 };
    }
    
    // Generic fallback
    return { protein: 5, fiber: 2, calories: 100, carbs: 10, fat: 3 };
  }
}

export const usdaService = new USDAService();