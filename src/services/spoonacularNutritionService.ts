import { createHash } from 'crypto';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { RecipeIngredient } from '../types/recipe';

// Rate limiting for Starter plan (disabled for local lookups)
const RATE_LIMIT_DELAY = 1100; // 1.1 seconds between requests (under 1 req/sec)
let lastRequestTime = 0;
const ENABLE_RATE_LIMITING = process.env.NODE_ENV === 'production'; // Only rate limit in production

interface NutritionData {
  protein: number;
  fiber: number;
  calories: number;
  carbs: number;
  fat: number;
  source: 'cache' | 'spoonacular' | 'usda-mirror' | 'conservative';
  timestamp?: number;
}

interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
}

interface SpoonacularIngredientResponse {
  id: number;
  original: string;
  name: string;
  amount: number;
  unit: string;
  nutrition?: {
    nutrients: SpoonacularNutrient[];
  };
}

export class SpoonacularNutritionService {
  private apiKey: string;
  private baseUrl = 'https://api.spoonacular.com';

  constructor() {
    this.apiKey = process.env.SPOONACULAR_API_KEY!;
    if (!this.apiKey) {
      throw new Error('SPOONACULAR_API_KEY is required');
    }
  }

  /**
   * Get nutrition data for multiple ingredients in a single batch request
   */
  async getNutritionForIngredients(ingredients: RecipeIngredient[]): Promise<NutritionData[]> {
    console.log(`🥗 Getting nutrition for ${ingredients.length} ingredients`);
    
    const results: NutritionData[] = [];
    const uncachedIngredients: { index: number; ingredient: RecipeIngredient }[] = [];

    // Step 1: Check cache for all ingredients in parallel
    const cachePromises = ingredients.map(async (ingredient, i) => {
      const cacheKey = this.generateCacheKey(ingredient);
      
      try {
        const cached = await this.getCachedNutrition(cacheKey);
        if (cached) {
          console.log(`💾 Cache hit for ${ingredient.name}`);
          return { index: i, nutrition: { ...cached, source: 'cache' as const }, found: true };
        }
      } catch (error) {
        console.warn(`Cache lookup failed for ${ingredient.name}:`, error);
      }
      
      return { index: i, ingredient, found: false };
    });

    const cacheResults = await Promise.all(cachePromises);
    
    // Separate cached from uncached
    for (const result of cacheResults) {
      if (result.found && 'nutrition' in result) {
        results[result.index] = result.nutrition;
      } else if (!result.found && 'ingredient' in result) {
        uncachedIngredients.push({ index: result.index, ingredient: result.ingredient });
      }
    }

    // Step 2: Try USDA mirror first for uncached ingredients (faster & more accurate)
    const stillNeededIngredients: { index: number; ingredient: RecipeIngredient }[] = [];
    const usdaCachePromises: Promise<void>[] = [];
    
    for (const { index, ingredient } of uncachedIngredients) {
      const usdaNutrition = this.getUSDANutrition(ingredient);
      if (usdaNutrition) {
        results[index] = usdaNutrition;
        console.log(`🥗 USDA match for ${ingredient.name}`);
        
        // Cache the USDA result asynchronously (don't wait)
        const cacheKey = this.generateCacheKey(ingredient);
        usdaCachePromises.push(this.cacheNutrition(cacheKey, usdaNutrition));
      } else {
        stillNeededIngredients.push({ index, ingredient });
      }
    }
    
    // Cache USDA results in background (don't block)
    Promise.all(usdaCachePromises).catch(error => 
      console.warn('Background caching failed:', error)
    );

    // Step 3: Use Spoonacular for ingredients not in our USDA database
    if (stillNeededIngredients.length > 0) {
      console.log(`🌐 ${stillNeededIngredients.length} ingredients need Spoonacular lookup`);
      try {
        const batchResults = await this.batchSpoonacularLookup(
          stillNeededIngredients.map(item => item.ingredient)
        );
        
        // Map results back to original positions and cache them
        for (let i = 0; i < stillNeededIngredients.length; i++) {
          const { index, ingredient } = stillNeededIngredients[i];
          const nutrition = batchResults[i];
          
          results[index] = nutrition;
          
          // Cache the result
          const cacheKey = this.generateCacheKey(ingredient);
          await this.cacheNutrition(cacheKey, nutrition);
        }
        
      } catch (error) {
        console.error('❌ Spoonacular batch lookup failed:', error);
        
        // Step 4: Final fallback to conservative estimates
        for (const { index, ingredient } of stillNeededIngredients) {
          const conservativeNutrition = this.getConservativeEstimate(ingredient);
          results[index] = conservativeNutrition;
        }
      }
    }

    // Fill any remaining gaps with conservative estimates
    for (let i = 0; i < ingredients.length; i++) {
      if (!results[i]) {
        results[i] = this.getConservativeEstimate(ingredients[i]);
      }
    }

    return results;
  }

  /**
   * Calculate total nutrition for all ingredients combined
   */
  calculateTotalNutrition(nutritionData: NutritionData[]): NutritionData {
    const total = nutritionData.reduce(
      (sum, nutrition) => ({
        protein: sum.protein + nutrition.protein,
        fiber: sum.fiber + nutrition.fiber,
        calories: sum.calories + nutrition.calories,
        carbs: sum.carbs + nutrition.carbs,
        fat: sum.fat + nutrition.fat,
        source: 'calculated' as const,
      }),
      { protein: 0, fiber: 0, calories: 0, carbs: 0, fat: 0, source: 'calculated' as const }
    );

    // Determine primary source
    const sources = nutritionData.map(n => n.source);
    const primarySource = sources.includes('cache') || sources.includes('spoonacular') 
      ? 'spoonacular' 
      : sources.includes('usda-mirror') 
      ? 'usda-mirror' 
      : 'conservative';

    return { ...total, source: primarySource };
  }

  /**
   * Batch lookup multiple ingredients via Spoonacular API
   */
  private async batchSpoonacularLookup(ingredients: RecipeIngredient[]): Promise<NutritionData[]> {
    // Rate limiting for Starter plan
    await this.enforceRateLimit();
    
    // Format ingredients for Spoonacular
    const ingredientList = ingredients.map(ing => 
      `${ing.amount || 1} ${ing.unit || 'serving'} ${ing.name}`
    ).join('\n');

    const url = `${this.baseUrl}/recipes/parseIngredients`;
    const params = new URLSearchParams({
      apiKey: this.apiKey,
      includeNutrition: 'true'
    });

    console.log(`🌐 Calling Spoonacular for ${ingredients.length} ingredients`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `ingredientList=${encodeURIComponent(ingredientList)}&servings=1`
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('⚠️ Spoonacular rate limit hit');
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      throw new Error(`Spoonacular API error: ${response.status}`);
    }

    const data: SpoonacularIngredientResponse[] = await response.json();
    
    return data.map((item, index) => {
      if (!item.nutrition?.nutrients) {
        console.warn(`⚠️ No nutrition data for ${item.name}, using fallback`);
        return this.getConservativeEstimate(ingredients[index]);
      }

      const nutrients = item.nutrition.nutrients;
      const getNutrient = (name: string): number => {
        const nutrient = nutrients.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
        return nutrient?.amount || 0;
      };

      return {
        protein: getNutrient('protein'),
        fiber: getNutrient('fiber') || getNutrient('dietary fiber'),
        calories: getNutrient('calories') || getNutrient('energy'),
        carbs: getNutrient('carbohydrates') || getNutrient('carbs'),
        fat: getNutrient('fat') || getNutrient('total lipid'),
        source: 'spoonacular' as const,
        timestamp: Date.now()
      };
    });
  }

  /**
   * Generate cache key for ingredient
   */
  private generateCacheKey(ingredient: RecipeIngredient): string {
    const normalized = `${ingredient.name.toLowerCase().trim()}|${ingredient.amount || 1}|${ingredient.unit || 'serving'}`;
    return createHash('md5').update(normalized).digest('hex');
  }

  /**
   * Get cached nutrition data
   */
  private async getCachedNutrition(cacheKey: string): Promise<NutritionData | null> {
    try {
      const docRef = doc(db, 'nutritionCache', cacheKey);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as NutritionData;
        
        // Check if cache is still valid (30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        if (data.timestamp && data.timestamp > thirtyDaysAgo) {
          return data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Cache lookup error:', error);
      return null;
    }
  }

  /**
   * Cache nutrition data
   */
  private async cacheNutrition(cacheKey: string, nutrition: NutritionData): Promise<void> {
    try {
      const docRef = doc(db, 'nutritionCache', cacheKey);
      await setDoc(docRef, { 
        ...nutrition, 
        timestamp: Date.now(),
        cached: true
      });
    } catch (error) {
      console.warn('Failed to cache nutrition:', error);
      // Don't throw - caching failure shouldn't break the flow
    }
  }

  /**
   * Enforce rate limiting for Starter plan (only in production)
   */
  private async enforceRateLimit(): Promise<void> {
    if (!ENABLE_RATE_LIMITING) {
      return; // Skip rate limiting in development
    }
    
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
      console.log(`⏱️ Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    lastRequestTime = Date.now();
  }

  /**
   * Fallback to local USDA nutrition database
   */
  private async getFallbackNutrition(ingredient: RecipeIngredient): Promise<NutritionData> {
    console.log(`🔄 Using USDA fallback nutrition for ${ingredient.name}`);
    
    // Try to find ingredient in our local USDA database
    const localNutrition = this.getUSDANutrition(ingredient);
    if (localNutrition) {
      return { ...localNutrition, source: 'usda-mirror' };
    }
    
    // If not found, use conservative estimates
    const estimate = this.getConservativeEstimate(ingredient);
    return { ...estimate, source: 'conservative' };
  }

  /**
   * Look up ingredient in local USDA nutrition database
   */
  private getUSDANutrition(ingredient: RecipeIngredient): NutritionData | null {
    // Dynamic import to avoid top-level require
    const { COMMON_NUTRITION_DATA, findClosestMatch, convertToGrams } = require('../data/commonNutrition') as {
      COMMON_NUTRITION_DATA: Record<string, { protein: number; fiber: number; calories: number; carbs: number; fat: number }>;
      findClosestMatch: (name: string) => string | null;
      convertToGrams: (amount: number, unit: string) => number;
    };
    
    const matchedFood = findClosestMatch(ingredient.name);
    if (!matchedFood) {
      return null;
    }
    
    const nutritionPer100g = COMMON_NUTRITION_DATA[matchedFood];
    const amountInGrams = convertToGrams(ingredient.amount || 1, ingredient.unit || 'serving', ingredient.name);
    const scale = amountInGrams / 100; // Scale from per-100g to actual amount
    
    return {
      protein: nutritionPer100g.protein * scale,
      fiber: nutritionPer100g.fiber * scale,
      calories: nutritionPer100g.calories * scale,
      carbs: nutritionPer100g.carbs * scale,
      fat: nutritionPer100g.fat * scale,
      source: 'usda-mirror',
      timestamp: Date.now()
    };
  }

  /**
   * Conservative nutrition estimates as last resort
   */
  private getConservativeEstimate(ingredient: RecipeIngredient): NutritionData {
    const name = ingredient.name.toLowerCase();
    const amount = ingredient.amount || 1;
    
    // More accurate estimates based on food types
    if (name.includes('chicken') || name.includes('turkey')) {
      return { protein: amount * 25, fiber: 0, calories: amount * 165, carbs: 0, fat: amount * 3.6, source: 'conservative' };
    }
    if (name.includes('salmon') || name.includes('tuna') || name.includes('fish')) {
      return { protein: amount * 22, fiber: 0, calories: amount * 140, carbs: 0, fat: amount * 6, source: 'conservative' };
    }
    if (name.includes('shrimp')) {
      return { protein: amount * 18, fiber: 0, calories: amount * 85, carbs: 1, fat: amount * 1, source: 'conservative' };
    }
    if (name.includes('egg')) {
      return { protein: amount * 6, fiber: 0, calories: amount * 70, carbs: amount * 0.5, fat: amount * 5, source: 'conservative' };
    }
    if (name.includes('quinoa')) {
      return { protein: amount * 4.4, fiber: amount * 2.8, calories: amount * 120, carbs: amount * 22, fat: amount * 1.9, source: 'conservative' };
    }
    if (name.includes('black beans') || name.includes('beans')) {
      return { protein: amount * 15, fiber: amount * 15, calories: amount * 245, carbs: amount * 45, fat: amount * 1, source: 'conservative' };
    }
    if (name.includes('avocado')) {
      return { protein: amount * 2, fiber: amount * 10, calories: amount * 160, carbs: amount * 9, fat: amount * 15, source: 'conservative' };
    }
    if (name.includes('spinach') || name.includes('kale') || name.includes('greens')) {
      return { protein: amount * 3, fiber: amount * 2.2, calories: amount * 23, carbs: amount * 3.6, fat: amount * 0.4, source: 'conservative' };
    }
    
    // Generic fallback - very conservative
    return { protein: 2, fiber: 1, calories: 50, carbs: 8, fat: 2, source: 'conservative' };
  }
}

export const spoonacularNutritionService = new SpoonacularNutritionService();