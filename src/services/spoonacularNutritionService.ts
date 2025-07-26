import { createHash } from 'crypto';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { RecipeIngredient } from '../types/recipe';
import { nutritionValidationService } from './nutritionValidationService';
import { unitConversionService } from './unitConversionService';
import { COMMON_NUTRITION_DATA, findClosestMatch } from '../data/commonNutrition';

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
  confidence?: 'high' | 'medium' | 'low';
  warnings?: string[];
  validations?: string[];
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
      if (result.found && 'nutrition' in result && result.nutrition) {
        results[result.index] = result.nutrition;
      } else if (!result.found && 'ingredient' in result && result.ingredient) {
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
    if (stillNeededIngredients.length > 0 && process.env.NODE_ENV === 'production') {
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
    } else if (stillNeededIngredients.length > 0) {
      // Development mode: Use conservative estimates for missing ingredients
      console.log(`🏠 Development mode: Using conservative estimates for ${stillNeededIngredients.length} ingredients`);
      for (const { index, ingredient } of stillNeededIngredients) {
        results[index] = this.getConservativeEstimate(ingredient);
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
   * Calculate total nutrition for all ingredients combined with validation
   */
  calculateTotalNutrition(nutritionData: NutritionData[], ingredients?: RecipeIngredient[]): NutritionData {
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

    // Determine primary source and confidence
    const sources = nutritionData.map(n => n.source);
    const confidences = nutritionData.map(n => n.confidence || 'high');
    const allWarnings = nutritionData.flatMap(n => n.warnings || []);
    const allValidations = nutritionData.flatMap(n => n.validations || []);
    
    const primarySource = sources.includes('cache') || sources.includes('spoonacular') 
      ? 'spoonacular' 
      : sources.includes('usda-mirror') 
      ? 'usda-mirror' 
      : 'conservative';
    
    // Overall confidence is the lowest individual confidence
    const overallConfidence = confidences.includes('low') ? 'low' : 
                             confidences.includes('medium') ? 'medium' : 'high';

    const result: NutritionData = { 
      ...total, 
      source: primarySource,
      confidence: overallConfidence,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
      validations: allValidations.length > 0 ? allValidations : undefined,
      timestamp: Date.now()
    };
    
    // Validate the total meal if ingredients are provided
    if (ingredients && ingredients.length > 0) {
      console.log(`🍽️ Validating total meal nutrition: ${result.protein.toFixed(1)}g protein, ${result.calories.toFixed(0)} cal`);
      
      // Convert ingredients to contexts for validation
      const ingredientContexts = ingredients.map(ing => {
        const conversionResult = unitConversionService.convertToGrams(
          ing.amount || 1, 
          ing.unit || 'serving', 
          ing.name
        );
        return {
          name: ing.name,
          amount: ing.amount || 1,
          unit: ing.unit || 'serving',
          gramWeight: conversionResult.grams
        };
      });
      
      const mealValidation = nutritionValidationService.validateMealNutrition(result, ingredientContexts);
      
      if (mealValidation.warnings.length > 0) {
        result.validations = [...(result.validations || []), ...mealValidation.warnings];
        if (mealValidation.confidence === 'low') {
          result.confidence = 'low';
        }
      }
      
      console.log(`🍽️ Meal validation complete (confidence: ${result.confidence})`);
      if (result.validations && result.validations.length > 0) {
        console.warn('⚠️ Meal validation warnings:', result.validations);
      }
    }

    return result;
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
    // Skip cache lookups in development to avoid Firebase permission issues
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
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
    // Skip caching in development to avoid Firebase permission issues
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
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
   * Look up ingredient in local USDA nutrition database with validation
   */
  private getUSDANutrition(ingredient: RecipeIngredient): NutritionData | null {
    try {
      const matchedFood = findClosestMatch(ingredient.name);
      if (!matchedFood) {
        console.log(`❌ No USDA match found for: ${ingredient.name}`);
        return null;
      }
      
      console.log(`🥗 USDA match found: ${ingredient.name} → ${matchedFood}`);
      
      const nutritionPer100g = COMMON_NUTRITION_DATA[matchedFood];
      if (!nutritionPer100g) {
        console.log(`❌ No nutrition data found for matched food: ${matchedFood}`);
        return null;
      }
      const conversionResult = unitConversionService.convertToGrams(
        ingredient.amount || 1, 
        ingredient.unit || 'serving', 
        ingredient.name,
        true
      );
      
      const scale = conversionResult.grams / 100; // Scale from per-100g to actual amount
      
      const scaledNutrition: NutritionData = {
        protein: nutritionPer100g.protein * scale,
        fiber: nutritionPer100g.fiber * scale,
        calories: nutritionPer100g.calories * scale,
        carbs: nutritionPer100g.carbs * scale,
        fat: nutritionPer100g.fat * scale,
        source: 'usda-mirror',
        confidence: conversionResult.confidence,
        warnings: conversionResult.warnings.length > 0 ? conversionResult.warnings : undefined,
        timestamp: Date.now()
      };
      
      // Validate the result
      const validation = nutritionValidationService.validateIngredientNutrition(scaledNutrition, {
        name: ingredient.name,
        amount: ingredient.amount || 1,
        unit: ingredient.unit || 'serving',
        gramWeight: conversionResult.grams
      });
      
      // Add validation info to result
      if (validation.warnings.length > 0) {
        scaledNutrition.validations = validation.warnings;
        if (validation.confidence === 'low') {
          scaledNutrition.confidence = 'low';
        }
      }
      
      console.log(`🥗 USDA result: ${scaledNutrition.protein.toFixed(1)}g protein, ${scaledNutrition.calories.toFixed(0)} cal (confidence: ${scaledNutrition.confidence})`);
      
      return scaledNutrition;
      
    } catch (error) {
      console.error(`❌ USDA nutrition lookup failed for ${ingredient.name}:`, error);
      return null;
    }
  }

  /**
   * Conservative nutrition estimates as last resort with full validation
   */
  private getConservativeEstimate(ingredient: RecipeIngredient): NutritionData {
    const name = ingredient.name.toLowerCase();
    const amount = ingredient.amount || 1;
    const unit = ingredient.unit || 'serving';
    
    console.log(`🔄 Getting conservative estimate for: ${amount} ${unit} ${name}`);
    
    // Use the new unified conversion service
    const conversionResult = unitConversionService.convertToGrams(amount, unit, name, true);
    const scale = conversionResult.grams / 100; // Scale from per-100g to actual amount
    
    // Log conversion details for debugging
    console.log(`🔄 Conversion result: ${amount} ${unit} ${name} = ${conversionResult.grams}g (confidence: ${conversionResult.confidence})`);
    if (conversionResult.warnings.length > 0) {
      console.warn('⚠️ Conversion warnings:', conversionResult.warnings);
    }
    
    let nutritionPer100g: { protein: number; fiber: number; calories: number; carbs: number; fat: number };
    
    // Use per-100g nutrition values and scale them properly
    if (name.includes('chicken') || name.includes('turkey')) {
      nutritionPer100g = { protein: 27, fiber: 0, calories: 189, carbs: 0, fat: 8.3 }; // ground turkey
    } else if (name.includes('salmon') || name.includes('tuna') || name.includes('fish')) {
      nutritionPer100g = { protein: 25, fiber: 0, calories: 208, carbs: 0, fat: 12.4 }; // salmon
    } else if (name.includes('shrimp')) {
      nutritionPer100g = { protein: 18, fiber: 0, calories: 85, carbs: 0.9, fat: 0.5 };
    } else if (name.includes('egg')) {
      nutritionPer100g = { protein: 13, fiber: 0, calories: 155, carbs: 1.1, fat: 11 };
    } else if (name.includes('quinoa')) {
      nutritionPer100g = { protein: 4.4, fiber: 2.8, calories: 120, carbs: 22, fat: 1.9 }; // cooked
    } else if (name.includes('black beans') || name.includes('beans')) {
      nutritionPer100g = { protein: 8.9, fiber: 8.3, calories: 132, carbs: 23, fat: 0.5 };
    } else if (name.includes('avocado')) {
      nutritionPer100g = { protein: 2, fiber: 6.7, calories: 160, carbs: 8.5, fat: 14.7 };
    } else if (name.includes('spinach') || name.includes('kale') || name.includes('greens')) {
      nutritionPer100g = { protein: 2.9, fiber: 2.2, calories: 23, carbs: 3.6, fat: 0.4 };
    } else {
      // Generic fallback
      nutritionPer100g = { protein: 5, fiber: 2, calories: 100, carbs: 15, fat: 3 };
    }
    
    // Scale nutrition values
    const scaledNutrition: NutritionData = {
      protein: nutritionPer100g.protein * scale,
      fiber: nutritionPer100g.fiber * scale,
      calories: nutritionPer100g.calories * scale,
      carbs: nutritionPer100g.carbs * scale,
      fat: nutritionPer100g.fat * scale,
      source: 'conservative',
      confidence: conversionResult.confidence,
      warnings: conversionResult.warnings.length > 0 ? conversionResult.warnings : undefined,
      timestamp: Date.now()
    };
    
    // Validate the result
    const validation = nutritionValidationService.validateIngredientNutrition(scaledNutrition, {
      name: ingredient.name,
      amount: amount,
      unit: unit,
      gramWeight: conversionResult.grams
    });
    
    // Add validation info to result
    if (validation.warnings.length > 0) {
      scaledNutrition.validations = validation.warnings;
      if (validation.confidence === 'low') {
        scaledNutrition.confidence = 'low';
      }
    }
    
    console.log(`🍽️ Conservative estimate result: ${scaledNutrition.protein.toFixed(1)}g protein, ${scaledNutrition.calories.toFixed(0)} cal (confidence: ${scaledNutrition.confidence})`);
    
    return scaledNutrition;
  }
}

export const spoonacularNutritionService = new SpoonacularNutritionService();