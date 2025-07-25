import axios from 'axios';
import convert from 'convert-units';

interface ParsedIngredient {
  quantity: number;
  unit: string;
  name: string;
  originalText: string;
}

interface USDANutrition {
  protein: number;
  fiber: number;
  calories: number;
  carbs: number;
  fat: number;
}

interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients?: Array<{
    nutrient?: { id: number; name: string; unitName: string };
    nutrientId?: number; // For search response format
    nutrientName?: string; // For search response format
    amount?: number; // For details response format
    value?: number; // For search response format
  }>;
}

interface USDASearchResponse {
  foods: USDAFood[];
  totalHits: number;
}

export class NutritionService {
  private apiKey: string;
  private baseUrl = 'https://api.nal.usda.gov/fdc/v1';
  
  // USDA nutrient IDs for key macros
  private nutrientIds = {
    protein: 1003,  // Protein (g)
    fiber: 1079,    // Fiber, total dietary (g)
    calories: [1008, 2047, 2048], // Energy (kcal) - multiple sources
    carbs: 1005,    // Carbohydrate, by difference (g)
    fat: 1004       // Total lipid (fat) (g)
  };

  constructor() {
    this.apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
  }

  /**
   * Parse ingredient string into structured format
   * Examples: "200g chicken breast", "1 cup chopped spinach", "2 tbsp olive oil"
   */
  /**
   * Clean and optimize food names for better USDA search results
   */
  private cleanFoodName(foodName: string): string {
    // Remove common cooking method descriptors that can confuse search
    const cookingMethods = [
      'pre-cooked', 'precooked', 'cooked', 'raw', 'fresh', 'frozen',
      'canned', 'dried', 'steamed', 'grilled', 'baked', 'fried',
      'roasted', 'boiled', 'sauteed', 'sautéed'
    ];
    
    // Remove measurement descriptors
    const descriptors = [
      'medium', 'large', 'small', 'extra large', 'jumbo',
      'thin slices', 'thick slices', 'sliced', 'diced', 'chopped',
      'boneless', 'skinless', 'lean', 'fat-free', 'low-fat'
    ];
    
    let cleaned = foodName.toLowerCase().trim();
    
    // Remove cooking methods first (they often cause wrong matches)
    for (const method of cookingMethods) {
      const regex = new RegExp(`\\b${method}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '').trim();
    }
    
    // Remove descriptors
    for (const descriptor of descriptors) {
      const regex = new RegExp(`\\b${descriptor}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '').trim();
    }
    
    // Clean up extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Food name mappings for better matches
    const foodMappings: Record<string, string> = {
      'shrimps': 'shrimp',
      'prawns': 'shrimp',
      'chicken breast': 'chicken breast',
      'olive oil': 'olive oil',
      'quinoa': 'quinoa',
      'brown rice': 'rice brown',
      'white rice': 'rice white',
      'sweet potato': 'sweet potato',
      'bell pepper': 'peppers sweet',
      'bell peppers': 'peppers sweet'
    };
    
    return foodMappings[cleaned] || cleaned;
  }

  parseIngredient(ingredient: string): ParsedIngredient {
    // Enhanced regex to handle various formats
    const patterns = [
      // Pattern 1: "200g chicken breast" or "200 g chicken breast"
      /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(.+)$/,
      // Pattern 2: "1 cup spinach" or "2 tbsp olive oil"
      /^(\d+(?:\.\d+)?)\s+(cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|oz|ounce|ounces|lb|pound|pounds)\s+(.+)$/,
      // Pattern 3: "1/2 cup rice" or "1 1/2 cups flour"
      /^(\d+(?:\/\d+|\s+\d+\/\d+)?)\s+(cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|oz|ounce|ounces|lb|pound|pounds)\s+(.+)$/,
      // Pattern 4: Simple "chicken breast" (assume 100g)
      /^([a-zA-Z].*)$/
    ];

    for (const pattern of patterns) {
      const match = ingredient.match(pattern);
      if (match) {
        if (pattern === patterns[3]) {
          // No quantity specified, assume 100g
          return {
            quantity: 100,
            unit: 'g',
            name: match[1].trim(),
            originalText: ingredient
          };
        } else {
          const quantityStr = match[1];
          let quantity: number;
          
          // Handle fractions like "1/2" or "1 1/2"
          if (quantityStr.includes('/')) {
            const parts = quantityStr.trim().split(/\s+/);
            if (parts.length === 2) {
              // "1 1/2" format
              const whole = parseInt(parts[0]);
              const [num, denom] = parts[1].split('/').map(Number);
              quantity = whole + (num / denom);
            } else {
              // "1/2" format
              const [num, denom] = quantityStr.split('/').map(Number);
              quantity = num / denom;
            }
          } else {
            quantity = parseFloat(quantityStr);
          }

          return {
            quantity,
            unit: match[2]?.toLowerCase() || 'g',
            name: match[3]?.trim() || match[1]?.trim(),
            originalText: ingredient
          };
        }
      }
    }

    // Fallback: treat as name only with 100g assumption
    return {
      quantity: 100,
      unit: 'g',
      name: ingredient.trim(),
      originalText: ingredient
    };
  }

  /**
   * Convert various units to grams for USDA API consistency
   */
  convertToGrams(quantity: number, unit: string): number {
    try {
      const normalizedUnit = unit.toLowerCase();
      
      // Handle common cooking measurements
      const conversions: Record<string, number> = {
        'cup': 240,     // Approximate for general ingredients
        'cups': 240,
        'tbsp': 15,     // 1 tbsp = ~15g (varies by ingredient)
        'tablespoon': 15,
        'tablespoons': 15,
        'tsp': 5,       // 1 tsp = ~5g
        'teaspoon': 5,
        'teaspoons': 5,
        'oz': 28.35,    // 1 oz = 28.35g
        'ounce': 28.35,
        'ounces': 28.35,
        'lb': 453.592,  // 1 lb = 453.592g
        'pound': 453.592,
        'pounds': 453.592,
        'g': 1,         // Already grams
        'gram': 1,
        'grams': 1,
        'kg': 1000,     // 1 kg = 1000g
        'kilogram': 1000,
        'kilograms': 1000
      };

      if (conversions[normalizedUnit]) {
        return quantity * conversions[normalizedUnit];
      }

      // Try convert-units library for additional conversions
      if (convert().list('mass').some((u: any) => u.abbr === normalizedUnit)) {
        return convert(quantity).from(normalizedUnit as any).to('g');
      }

      // Default fallback: assume it's already in grams
      console.warn(`Unknown unit: ${unit}, assuming grams`);
      return quantity;
    } catch (error) {
      console.warn(`Error converting ${quantity} ${unit} to grams:`, error);
      return quantity; // Fallback to original quantity
    }
  }

  /**
   * Search for food in USDA database
   */
  async searchFood(foodName: string): Promise<USDAFood | null> {
    try {
      // Clean the food name for better search results
      const cleanedFoodName = this.cleanFoodName(foodName);
      
      console.log(`\n=== SEARCHING USDA API ===`);
      console.log(`Original food: ${foodName}`);
      console.log(`Cleaned food: ${cleanedFoodName}`);
      
      const searchUrl = `${this.baseUrl}/foods/search`;
      const params = {
        query: cleanedFoodName,
        dataType: 'Foundation', // Prefer Foundation data first, which has the most complete nutrition data
        api_key: this.apiKey,
        pageSize: 1 // Just get the best match
      };

      console.log(`URL: ${searchUrl}`);
      console.log(`Params:`, params);
      console.log(`API Key available: ${!!this.apiKey}`);
      
      const response = await axios.get<USDASearchResponse>(searchUrl, { params });
      console.log(`Response status: ${response.status}`);
      console.log(`Response data foods count: ${response.data.foods?.length || 0}`);
      
      if (response.data.foods.length === 0) {
        console.warn(`No Foundation food found for: ${foodName}, trying SR Legacy...`);
        
        // If no Foundation data, try SR Legacy as fallback
        const legacyParams = {
          query: foodName,
          dataType: 'SR Legacy',
          api_key: this.apiKey,
          pageSize: 1
        };
        
        const legacyResponse = await axios.get<USDASearchResponse>(searchUrl, { params: legacyParams });
        console.log(`SR Legacy response status: ${legacyResponse.status}`);
        console.log(`SR Legacy foods count: ${legacyResponse.data.foods?.length || 0}`);
        
        if (legacyResponse.data.foods.length === 0) {
          console.warn(`No USDA food found for: ${foodName}`);
          return null;
        }
        
        const bestMatch = legacyResponse.data.foods[0];
        console.log(`Found SR Legacy food: FDC ID ${bestMatch.fdcId}, Description: ${bestMatch.description}`);
        return bestMatch;
      }

      // Return the best match (first result is usually most relevant)
      const bestMatch = response.data.foods[0];
      console.log(`Found USDA Foundation food: FDC ID ${bestMatch.fdcId}, Description: ${bestMatch.description}`);
      return bestMatch;
    } catch (error) {
      console.error(`\n=== USDA API ERROR ===`);
      console.error(`Food: ${foodName}`);
      console.error(`Error type:`, error?.constructor?.name);
      console.error(`Error message:`, error instanceof Error ? error.message : error);
      console.error(`Full error:`, error);
      
      // Check if it's a network connectivity issue
      if (error instanceof Error && (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED'))) {
        console.warn(`Network connectivity issue with USDA API. Using fallback for: ${foodName}`);
        return this.getFallbackNutrition(foodName);
      }
      
      // For any error, fall back to internal database
      console.warn(`USDA API call failed, falling back to internal database for: ${foodName}`);
      return this.getFallbackNutrition(foodName);
    }
  }

  /**
   * Fallback nutrition data when USDA API is unavailable
   */
  private getFallbackNutrition(foodName: string): USDAFood | null {
    const fallbackDatabase: Record<string, USDAFood> = {
      'chicken breast': {
        fdcId: 999001,
        description: 'Chicken breast (fallback)',
        dataType: 'Foundation',
        foodNutrients: [
          { nutrient: { id: 1003, name: 'Protein', unitName: 'g' }, amount: 23.1 },
          { nutrient: { id: 1079, name: 'Fiber', unitName: 'g' }, amount: 0 },
          { nutrient: { id: 1008, name: 'Energy', unitName: 'kcal' }, amount: 165 },
          { nutrient: { id: 1005, name: 'Carbs', unitName: 'g' }, amount: 0 },
          { nutrient: { id: 1004, name: 'Fat', unitName: 'g' }, amount: 3.6 }
        ]
      },
      'spinach': {
        fdcId: 999002,
        description: 'Spinach (fallback)',
        dataType: 'Foundation',
        foodNutrients: [
          { nutrient: { id: 1003, name: 'Protein', unitName: 'g' }, amount: 2.9 },
          { nutrient: { id: 1079, name: 'Fiber', unitName: 'g' }, amount: 2.2 },
          { nutrient: { id: 1008, name: 'Energy', unitName: 'kcal' }, amount: 23 },
          { nutrient: { id: 1005, name: 'Carbs', unitName: 'g' }, amount: 3.6 },
          { nutrient: { id: 1004, name: 'Fat', unitName: 'g' }, amount: 0.4 }
        ]
      },
      'olive oil': {
        fdcId: 999003,
        description: 'Olive oil (fallback)',
        dataType: 'Foundation',
        foodNutrients: [
          { nutrient: { id: 1003, name: 'Protein', unitName: 'g' }, amount: 0 },
          { nutrient: { id: 1079, name: 'Fiber', unitName: 'g' }, amount: 0 },
          { nutrient: { id: 1008, name: 'Energy', unitName: 'kcal' }, amount: 884 },
          { nutrient: { id: 1005, name: 'Carbs', unitName: 'g' }, amount: 0 },
          { nutrient: { id: 1004, name: 'Fat', unitName: 'g' }, amount: 100 }
        ]
      },
      'eggs': {
        fdcId: 999004,
        description: 'Eggs (fallback)',
        dataType: 'Foundation',
        foodNutrients: [
          { nutrient: { id: 1003, name: 'Protein', unitName: 'g' }, amount: 13 },
          { nutrient: { id: 1079, name: 'Fiber', unitName: 'g' }, amount: 0 },
          { nutrient: { id: 1008, name: 'Energy', unitName: 'kcal' }, amount: 155 },
          { nutrient: { id: 1005, name: 'Carbs', unitName: 'g' }, amount: 1.1 },
          { nutrient: { id: 1004, name: 'Fat', unitName: 'g' }, amount: 11 }
        ]
      },
      'greek yogurt': {
        fdcId: 999005,
        description: 'Greek yogurt (fallback)',
        dataType: 'Foundation',
        foodNutrients: [
          { nutrient: { id: 1003, name: 'Protein', unitName: 'g' }, amount: 10 },
          { nutrient: { id: 1079, name: 'Fiber', unitName: 'g' }, amount: 0 },
          { nutrient: { id: 1008, name: 'Energy', unitName: 'kcal' }, amount: 59 },
          { nutrient: { id: 1005, name: 'Carbs', unitName: 'g' }, amount: 3.6 },
          { nutrient: { id: 1004, name: 'Fat', unitName: 'g' }, amount: 0.4 }
        ]
      },
      'quinoa': {
        fdcId: 999006,
        description: 'Quinoa (fallback)',
        dataType: 'Foundation',
        foodNutrients: [
          { nutrient: { id: 1003, name: 'Protein', unitName: 'g' }, amount: 4.4 },
          { nutrient: { id: 1079, name: 'Fiber', unitName: 'g' }, amount: 2.8 },
          { nutrient: { id: 1008, name: 'Energy', unitName: 'kcal' }, amount: 120 },
          { nutrient: { id: 1005, name: 'Carbs', unitName: 'g' }, amount: 22 },
          { nutrient: { id: 1004, name: 'Fat', unitName: 'g' }, amount: 1.9 }
        ]
      },
      'black beans': {
        fdcId: 999007,
        description: 'Black beans (fallback)',
        dataType: 'Foundation',
        foodNutrients: [
          { nutrient: { id: 1003, name: 'Protein', unitName: 'g' }, amount: 8.9 },
          { nutrient: { id: 1079, name: 'Fiber', unitName: 'g' }, amount: 8.7 },
          { nutrient: { id: 1008, name: 'Energy', unitName: 'kcal' }, amount: 132 },
          { nutrient: { id: 1005, name: 'Carbs', unitName: 'g' }, amount: 23 },
          { nutrient: { id: 1004, name: 'Fat', unitName: 'g' }, amount: 0.5 }
        ]
      },
      'salmon': {
        fdcId: 999008,
        description: 'Salmon (fallback)',
        dataType: 'Foundation',
        foodNutrients: [
          { nutrient: { id: 1003, name: 'Protein', unitName: 'g' }, amount: 25.4 },
          { nutrient: { id: 1079, name: 'Fiber', unitName: 'g' }, amount: 0 },
          { nutrient: { id: 1008, name: 'Energy', unitName: 'kcal' }, amount: 208 },
          { nutrient: { id: 1005, name: 'Carbs', unitName: 'g' }, amount: 0 },
          { nutrient: { id: 1004, name: 'Fat', unitName: 'g' }, amount: 12.4 }
        ]
      }
    };

    // Try exact match first
    if (fallbackDatabase[foodName.toLowerCase()]) {
      console.log(`Using fallback nutrition for: ${foodName}`);
      return fallbackDatabase[foodName.toLowerCase()];
    }

    // Try partial matches
    for (const [key, value] of Object.entries(fallbackDatabase)) {
      if (foodName.toLowerCase().includes(key) || key.includes(foodName.toLowerCase())) {
        console.log(`Using partial fallback match for "${foodName}" -> "${key}"`);
        return value;
      }
    }

    console.warn(`No fallback nutrition available for: ${foodName}`);
    return null;
  }

  /**
   * Get detailed nutrition for a specific food ID
   */
  async getFoodNutrition(fdcId: number): Promise<USDANutrition | null> {
    // Handle fallback nutrition data (IDs in range 999000-999999)
    if (fdcId >= 999000 && fdcId < 1000000) {
      return this.getFallbackNutritionById(fdcId);
    }

    try {
      const detailsUrl = `${this.baseUrl}/food/${fdcId}`;
      const params = {
        api_key: this.apiKey
      };

      console.log(`\n=== GETTING FOOD NUTRITION ===`);
      console.log(`FDC ID: ${fdcId}`);
      console.log(`URL: ${detailsUrl}`);
      console.log(`API Key available: ${!!this.apiKey}`);

      const response = await axios.get<USDAFood>(detailsUrl, { params });
      console.log(`Response status: ${response.status}`);
      console.log(`Response data exists: ${!!response.data}`);
      console.log(`Food nutrients exists: ${!!response.data.foodNutrients}`);
      console.log(`Food nutrients count: ${response.data.foodNutrients?.length || 0}`);
      
      if (!response.data.foodNutrients) {
        console.warn(`No nutrition data for FDC ID: ${fdcId}`);
        return null;
      }

      // Extract the nutrients we care about (values are per 100g)
      const nutrition: USDANutrition = {
        protein: 0,
        fiber: 0,
        calories: 0,
        carbs: 0,
        fat: 0
      };

      console.log(`Processing ${response.data.foodNutrients.length} nutrients...`);

      response.data.foodNutrients.forEach(nutrient => {
        const amount = nutrient.amount || 0;
        const nutrientId = nutrient.nutrient?.id || 0;
        
        if (nutrientId === this.nutrientIds.protein) {
          nutrition.protein = amount;
        } else if (nutrientId === this.nutrientIds.fiber) {
          nutrition.fiber = amount;
        } else if (nutrientId === this.nutrientIds.carbs) {
          nutrition.carbs = amount;
        } else if (nutrientId === this.nutrientIds.fat) {
          nutrition.fat = amount;
        } else if (this.nutrientIds.calories.includes(nutrientId)) {
          // Prefer Atwater General Factors (2047) if available
          if (nutrition.calories === 0 || nutrientId === 2047) {
            nutrition.calories = amount;
          }
        }
      });

      console.log(`Final nutrition result:`, nutrition);
      console.log(`Has protein: ${nutrition.protein > 0}`);
      console.log(`Has calories: ${nutrition.calories > 0}`);

      return nutrition;
    } catch (error) {
      console.error(`\n=== GET FOOD NUTRITION ERROR ===`);
      console.error(`FDC ID: ${fdcId}`);
      console.error(`Error type:`, error?.constructor?.name);
      console.error(`Error message:`, error instanceof Error ? error.message : error);
      console.error(`Full error:`, error);
      
      // Fall back to internal database
      return this.getFallbackNutritionById(fdcId);
    }
  }

  /**
   * Get fallback nutrition by ID
   */
  private getFallbackNutritionById(fdcId: number): USDANutrition | null {
    // This should only be called for fallback IDs (999000+)
    const fallbackMap: Record<number, USDANutrition> = {
      999001: { protein: 23.1, fiber: 0, calories: 165, carbs: 0, fat: 3.6 }, // chicken breast
      999002: { protein: 2.9, fiber: 2.2, calories: 23, carbs: 3.6, fat: 0.4 }, // spinach
      999003: { protein: 0, fiber: 0, calories: 884, carbs: 0, fat: 100 }, // olive oil
      999004: { protein: 13, fiber: 0, calories: 155, carbs: 1.1, fat: 11 }, // eggs
      999005: { protein: 10, fiber: 0, calories: 59, carbs: 3.6, fat: 0.4 }, // greek yogurt
      999006: { protein: 4.4, fiber: 2.8, calories: 120, carbs: 22, fat: 1.9 }, // quinoa
      999007: { protein: 8.9, fiber: 8.7, calories: 132, carbs: 23, fat: 0.5 }, // black beans
      999008: { protein: 25.4, fiber: 0, calories: 208, carbs: 0, fat: 12.4 }, // salmon
    };

    return fallbackMap[fdcId] || null;
  }

  /**
   * Calculate accurate nutrition for a list of ingredients
   */
  async calculateRecipeNutrition(ingredients: string[]): Promise<USDANutrition & { calculatedIngredients: number; failedIngredients: string[]; dataSource: string }> {
    const totalNutrition: USDANutrition = {
      protein: 0,
      fiber: 0,
      calories: 0,
      carbs: 0,
      fat: 0
    };

    let calculatedIngredients = 0;
    const failedIngredients: string[] = [];
    let usdaIngredients = 0;
    let fallbackIngredients = 0;

    console.log(`Calculating nutrition for ${ingredients.length} ingredients...`);

    for (const ingredient of ingredients) {
      try {
        const parsed = this.parseIngredient(ingredient);
        console.log(`Parsed ingredient:`, parsed);

        // Search for the food
        const food = await this.searchFood(parsed.name);
        console.log(`Search result for ${parsed.name}:`, food);
        
        if (!food) {
          console.log(`No food found for ${parsed.name}, adding to failed ingredients`);
          failedIngredients.push(ingredient);
          continue;
        }

        console.log(`Food found: FDC ID ${food.fdcId}, calling getFoodNutrition...`);

        // Track data source
        if (food.fdcId >= 999000 && food.fdcId < 1000000) {
          fallbackIngredients++;
        } else {
          usdaIngredients++;
        }

        // Get nutrition data
        const nutrition = await this.getFoodNutrition(food.fdcId);
        console.log(`Nutrition result for FDC ID ${food.fdcId}:`, nutrition);
        
        if (!nutrition) {
          console.log(`No nutrition data for FDC ID ${food.fdcId}, adding to failed ingredients`);
          failedIngredients.push(ingredient);
          continue;
        }

        // Convert quantity to grams and scale nutrition (USDA values are per 100g)
        const gramsQuantity = this.convertToGrams(parsed.quantity, parsed.unit);
        const scale = gramsQuantity / 100; // Scale from per-100g to actual quantity

        console.log(`${ingredient}: ${gramsQuantity}g, scale: ${scale}`);

        // Add scaled nutrition to totals
        totalNutrition.protein += nutrition.protein * scale;
        totalNutrition.fiber += nutrition.fiber * scale;
        totalNutrition.calories += nutrition.calories * scale;
        totalNutrition.carbs += nutrition.carbs * scale;
        totalNutrition.fat += nutrition.fat * scale;

        calculatedIngredients++;
      } catch (error) {
        console.error(`Error processing ingredient ${ingredient}:`, error);
        failedIngredients.push(ingredient);
      }
    }

    // Determine data source description
    let dataSource = '';
    if (usdaIngredients > 0 && fallbackIngredients > 0) {
      dataSource = `Mixed (${usdaIngredients} USDA, ${fallbackIngredients} fallback)`;
    } else if (usdaIngredients > 0) {
      dataSource = `USDA-calculated (${usdaIngredients} ingredients)`;
    } else if (fallbackIngredients > 0) {
      dataSource = `Fallback database (${fallbackIngredients} ingredients)`;
    } else {
      dataSource = 'AI-estimated';
    }

    // Round values to reasonable precision
    return {
      protein: Math.round(totalNutrition.protein * 10) / 10,
      fiber: Math.round(totalNutrition.fiber * 10) / 10,
      calories: Math.round(totalNutrition.calories),
      carbs: Math.round(totalNutrition.carbs * 10) / 10,
      fat: Math.round(totalNutrition.fat * 10) / 10,
      calculatedIngredients,
      failedIngredients,
      dataSource
    };
  }

  /**
   * Validate if nutrition meets GLP-1 requirements
   */
  validateNutritionRequirements(nutrition: USDANutrition): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (nutrition.protein < 20) {
      issues.push(`Protein too low: ${nutrition.protein}g (need ≥20g)`);
    }

    if (nutrition.fiber < 4) {
      issues.push(`Fiber too low: ${nutrition.fiber}g (need ≥4g)`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

export const nutritionService = new NutritionService();
