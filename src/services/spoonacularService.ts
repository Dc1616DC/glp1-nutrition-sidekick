import axios from 'axios';
import { cacheService } from './cacheService';

// Types for Spoonacular API responses
interface SpoonacularNutrients {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
}

interface SpoonacularMeal {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl?: string;
  image?: string;
}

interface SpoonacularMealPlan {
  meals: SpoonacularMeal[];
  nutrients: SpoonacularNutrients;
}

interface SpoonacularRecipeDetail {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  instructions: string;
  sourceUrl?: string;
  analyzedInstructions?: Array<{
    name: string;
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
  extendedIngredients: Array<{
    original: string;
    amount: number;
    unit: string;
    name: string;
  }>;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

// Our app's meal format
interface GeneratedMeal {
  id: string;
  name: string;
  description: string;
  cookingTime: number;
  prepTime: number;
  servings: number;
  nutrition: {
    protein: number;
    fiber: number;
    calories: number;
    carbs: number;
    fat: number;
  };
  ingredients: string[];
  instructions: string[];
  tips: string[];
  mealStyle: string[];
  glp1Friendly: {
    eatingTips: string;
  };
  complexity?: {
    level: 'Simple' | 'Medium' | 'Advanced';
    score: number;
    factors: string[];
  };
  mealPrep?: {
    friendly: boolean;
    storageInstructions?: string;
    reheatingTips?: string;
    shelfLife?: string;
    batchScaling?: number;
  };
  warnings?: string[]; // For validation warnings
}

class SpoonacularService {
  private apiKey: string;
  private baseUrl = 'https://api.spoonacular.com';

  constructor() {
    this.apiKey = process.env.SPOONACULAR_API_KEY || '';
    if (!this.apiKey) {
      console.warn('SPOONACULAR_API_KEY not found in environment variables');
    }
  }

  /**
   * Map user preferences to Spoonacular diet parameters
   */
  private mapDietPreferences(dietaryRestrictions: string[] | string, proteinSource?: string): string {
    const diets: string[] = [];

    // Handle dietary restrictions (can be array or string)
    const restrictions = Array.isArray(dietaryRestrictions) ? dietaryRestrictions : [dietaryRestrictions];
    
    restrictions.forEach(restriction => {
      if (restriction) {
        switch (restriction.toLowerCase()) {
          case 'vegetarian':
            diets.push('vegetarian');
            break;
          case 'vegan':
            diets.push('vegan');
            break;
          case 'gluten-free':
            diets.push('gluten free');
            break;
          case 'dairy-free':
            diets.push('dairy free');
            break;
          case 'keto':
            diets.push('ketogenic');
            break;
          case 'paleo':
            diets.push('paleo');
            break;
        }
      }
    });

    // Add high-protein preference for GLP-1 optimization
    if (proteinSource === 'high-protein' || !proteinSource) {
      // Note: Spoonacular doesn't have explicit high-protein diet, we'll use query params instead
    }

    return diets.join(',');
  }

  /**
   * Calculate target calories based on meal type and GLP-1 considerations
   */
  private getTargetCalories(mealType: string): number {
    const calorieTargets = {
      breakfast: 400,
      lunch: 500,
      dinner: 600,
      snack: 200
    };

    return calorieTargets[mealType.toLowerCase() as keyof typeof calorieTargets] || 500;
  }

  /**
   * Generate a meal plan using Spoonacular
   */
  async generateMealPlan(preferences: {
    mealType: string;
    dietaryRestrictions?: string[] | string;
    cuisineType?: string;
    proteinSource?: string;
    avoidIngredients?: string[];
    previousMeals?: string[];
    freeTextPrompt?: string;
    minProtein?: number;
    minFiber?: number;
    maxCalories?: number;
    maxReadyTime?: number;
    surpriseMe?: boolean;
  }): Promise<GeneratedMeal> {
    try {      const targetCalories = this.getTargetCalories(preferences.mealType);
      const diet = this.mapDietPreferences(preferences.dietaryRestrictions || '', preferences.proteinSource);

      // Combine ingredients to avoid with previous meals for variety
      const exclude = [
        ...(preferences.avoidIngredients || []),
        ...(preferences.previousMeals || [])
      ].join(',');

      console.log(`\n=== GENERATING SPOONACULAR MEAL ===`);
      console.log(`Meal type: ${preferences.mealType}`);
      console.log(`Target calories: ${targetCalories}`);
      console.log(`Diet: ${diet}`);
      console.log(`Protein source: ${preferences.proteinSource}`);
      console.log(`Cuisine: ${preferences.cuisineType}`);
      console.log(`Exclude: ${exclude}`);

      // Use complexSearch for more targeted results with GLP-1 optimization
      let query = this.buildSearchQuery(preferences);
      
      // Append free text prompt if provided
      if (preferences.freeTextPrompt && preferences.freeTextPrompt.trim()) {
        query = `${preferences.freeTextPrompt} ${query}`.trim();
      }

      const searchParams = {
        apiKey: this.apiKey,
        query,
        number: 20, // Get more options to find best match
        addRecipeInformation: true,
        addRecipeNutrition: true,
        sort: preferences.surpriseMe ? 'random' : 'time', // Randomize if surprise me is enabled
        maxReadyTime: preferences.maxReadyTime || (preferences.mealType === 'snack' ? 30 : 45),
        us: true, // Use US measurements
        // Add random offset to prevent getting same results
        offset: Math.floor(Math.random() * 50),
        // Add enhanced constraints
        ...(preferences.minProtein && { minProtein: preferences.minProtein }),
        ...(preferences.minFiber && { minFiber: preferences.minFiber }),
        ...(preferences.maxCalories && { maxCalories: preferences.maxCalories }),
        // Start with basic params, add constraints gradually
        ...(diet && { diet }),
        ...(preferences.cuisineType && { cuisine: preferences.cuisineType })
      };

      console.log(`Searching for recipes with params:`, searchParams);

      const searchResponse = await axios.get(
        `${this.baseUrl}/recipes/complexSearch`,
        { params: searchParams }
      );

      console.log('Spoonacular API response status:', searchResponse.status);
      console.log('Spoonacular API response data keys:', Object.keys(searchResponse.data));
      console.log(`Found ${searchResponse.data.results?.length || 0} recipes`);

      if (searchResponse.data.results && searchResponse.data.results.length > 0) {
        console.log('First recipe sample:', {
          id: searchResponse.data.results[0].id,
          title: searchResponse.data.results[0].title,
          nutrition: searchResponse.data.results[0].nutrition ? 'present' : 'missing'
        });
      }

      if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
        console.warn('No recipes found, trying with even simpler search...');
        
        // Try again with very basic search
        const basicParams = {
          apiKey: this.apiKey,
          query: preferences.mealType,
          number: 10,
          addRecipeInformation: true,
          addRecipeNutrition: true,
          sort: 'random'
        };

        const retryResponse = await axios.get(
          `${this.baseUrl}/recipes/complexSearch`,
          { params: basicParams }
        );

        if (!retryResponse.data.results || retryResponse.data.results.length === 0) {
          throw new Error('No recipes found even with basic search');
        }

        console.log(`Found ${retryResponse.data.results.length} recipes with basic search`);
        searchResponse.data.results = retryResponse.data.results;
      }

      // Find the recipe with the best protein content for GLP-1
      const bestRecipe = this.selectBestRecipe(searchResponse.data.results, preferences);
      
      if (!bestRecipe) {
        throw new Error('No suitable high-protein recipe found');
      }

      console.log(`Selected recipe: ${bestRecipe.title}`);

      // Fetch full recipe details including ingredients and instructions
      console.log(`Fetching detailed recipe information for ID: ${bestRecipe.id}`);
      const detailedRecipe = await this.getRecipeDetails(bestRecipe.id);
      
      console.log('Detailed recipe keys:', Object.keys(detailedRecipe));
      console.log('Detailed recipe ingredients:', detailedRecipe.extendedIngredients?.length || 0);
      console.log('Detailed recipe instructions:', detailedRecipe.analyzedInstructions?.length || 0);

      // Merge the nutrition from search with detailed recipe info
      const mergedRecipe = {
        ...detailedRecipe,
        nutrition: bestRecipe.nutrition || detailedRecipe.nutrition
      };

      return this.convertToGeneratedMeal(mergedRecipe, bestRecipe.nutrition, preferences.mealType);

    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw new Error(`Failed to generate meal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate multiple meal options (2 meals) using Spoonacular
   */
  async generateMultipleMealOptions(preferences: {
    mealType: string;
    dietaryRestrictions?: string[] | string;
    cuisineType?: string;
    proteinSource?: string;
    avoidIngredients?: string[];
    previousMeals?: string[];
    freeTextPrompt?: string;
    minProtein?: number;
    minFiber?: number;
    maxCalories?: number;
    maxReadyTime?: number;
    surpriseMe?: boolean;
    cookingMethod?: string;
    equipmentAvailable?: string;
    mealPrepOnly?: boolean;
  }): Promise<GeneratedMeal[]> {
    try {      
      const targetCalories = this.getTargetCalories(preferences.mealType);
      const diet = this.mapDietPreferences(preferences.dietaryRestrictions || '', preferences.proteinSource);

      // Combine ingredients to avoid with previous meals for variety
      const exclude = [
        ...(preferences.avoidIngredients || []),
        ...(preferences.previousMeals || [])
      ].join(',');

      console.log(`\n=== GENERATING 2 SPOONACULAR MEAL OPTIONS ===`);
      console.log(`Meal type: ${preferences.mealType}`);
      console.log(`Target calories: ${targetCalories}`);
      console.log(`Diet: ${diet}`);

      // Use complexSearch for more targeted results with GLP-1 optimization
      let query = this.buildSearchQuery(preferences);
      
      // Append free text prompt if provided
      if (preferences.freeTextPrompt && preferences.freeTextPrompt.trim()) {
        query = `${preferences.freeTextPrompt} ${query}`.trim();
      }

      // Add cooking method keywords to query
      if (preferences.cookingMethod && preferences.cookingMethod !== 'any') {
        const methodKeywords = this.getCookingMethodKeywords(preferences.cookingMethod);
        query = `${query} ${methodKeywords}`.trim();
      }

      const searchParams = {
        apiKey: this.apiKey,
        query,
        number: preferences.cookingMethod === 'no-cook' ? 100 : 40, // Get more options for no-cook to find valid ones
        addRecipeInformation: true,
        addRecipeNutrition: true,
        sort: preferences.surpriseMe ? 'random' : 'time',
        maxReadyTime: preferences.maxReadyTime || (preferences.mealType === 'snack' ? 30 : 45),
        us: true,
        // Add random offset to prevent getting same results
        offset: Math.floor(Math.random() * 50),
        // Filter to appropriate dish types for main meals - expand for no-cook
        ...(preferences.mealType !== 'snack' && { 
          type: preferences.cookingMethod === 'no-cook' 
            ? 'main course,lunch,dinner,appetizer,salad,soup,beverage,snack,dessert' 
            : 'main course,lunch,dinner,appetizer,salad,soup,beverage' 
        }),
        ...(preferences.minProtein && { minProtein: preferences.minProtein }),
        ...(preferences.minFiber && { minFiber: preferences.minFiber }),
        ...(preferences.maxCalories && { maxCalories: preferences.maxCalories }),
        ...(diet && { diet }),
        ...(preferences.cuisineType && { cuisine: preferences.cuisineType }),
        ...(preferences.equipmentAvailable && { equipment: preferences.equipmentAvailable })
      };

      console.log(`Searching for recipes with params:`, searchParams);

      const searchResponse = await axios.get(
        `${this.baseUrl}/recipes/complexSearch`,
        { params: searchParams }
      );

      console.log(`Found ${searchResponse.data.results?.length || 0} recipes`);

      if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
        console.warn('No recipes found, trying with basic search...');
        
        const basicParams = {
          apiKey: this.apiKey,
          query: preferences.mealType,
          number: 20,
          addRecipeInformation: true,
          addRecipeNutrition: true,
          sort: 'random'
        };

        const retryResponse = await axios.get(
          `${this.baseUrl}/recipes/complexSearch`,
          { params: basicParams }
        );

        if (!retryResponse.data.results || retryResponse.data.results.length === 0) {
          throw new Error('No recipes found even with basic search');
        }

        searchResponse.data.results = retryResponse.data.results;
      }

      // Select 2 best recipes with variety
      const selectedRecipes = this.selectMultipleBestRecipes(searchResponse.data.results, preferences, 2);
      
      if (selectedRecipes.length === 0) {
        // Special handling for no-cook - provide a helpful fallback
        if (preferences.cookingMethod === 'no-cook') {
          throw new Error('No no-cook recipes found. Try searching for "salad", "smoothie", or "parfait" recipes, or remove the no-cook filter.');
        }
        throw new Error('No suitable recipes found');
      }

      console.log(`Selected ${selectedRecipes.length} recipes`);

      // Fetch detailed information for each recipe and convert to GeneratedMeal
      const mealPromises = selectedRecipes.map(async (recipe) => {
        console.log(`Fetching detailed recipe information for ID: ${recipe.id}`);
        const detailedRecipe = await this.getRecipeDetails(recipe.id);
        
        // Prioritize detailed recipe nutrition over search nutrition for accuracy
        // Search nutrition is often incomplete or aggregated incorrectly
        const mergedRecipe = {
          ...detailedRecipe,
          nutrition: detailedRecipe.nutrition || recipe.nutrition
        };

        // Use search nutrition as fallback since it's already in the expected format
        // The convertToGeneratedMeal method will extract from the mergedRecipe.nutrition properly
        console.log(`Using nutrition from ${detailedRecipe.nutrition ? 'detailed recipe API' : 'search API'} for recipe: ${recipe.title}`);
        
        return this.convertToGeneratedMeal(mergedRecipe, recipe.nutrition, preferences.mealType);
      });

      const generatedMeals = await Promise.all(mealPromises);
      
      console.log(`Successfully generated ${generatedMeals.length} meal options`);
      return generatedMeals;

    } catch (error) {
      console.error('Error generating multiple meal options:', error);
      throw new Error(`Failed to generate meals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed recipe information including ingredients and instructions
   */
  private async getRecipeDetails(recipeId: number): Promise<SpoonacularRecipeDetail> {
    try {
      // Check cache first
      const cachedRecipe = await cacheService.getCachedSpoonacularResponse(
        'recipe-details',
        { recipeId }
      );
      
      if (cachedRecipe) {
        console.log(`🎯 Cache hit for recipe ${recipeId}`);
        return cachedRecipe;
      }
      
      const response = await axios.get<SpoonacularRecipeDetail>(
        `${this.baseUrl}/recipes/${recipeId}/information`,
        {
          params: {
            apiKey: this.apiKey,
            includeNutrition: true,
            instructionsRequired: true, // Ensure instructions are included
            us: true // Request US measurements
          }
        }
      );

      // Cache the successful response
      await cacheService.cacheSpoonacularResponse(
        'recipe-details',
        { recipeId },
        response.data,
        60 * 60 * 24 * 7 // Cache for 7 days
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching recipe details for ID ${recipeId}:`, error);
      throw error;
    }
  }

  /**
   * Convert Spoonacular recipe to our GeneratedMeal format
   */
  private convertToGeneratedMeal(
    recipe: SpoonacularRecipeDetail,
    planNutrients: SpoonacularNutrients,
    mealType: string
  ): GeneratedMeal {
    // Extract nutrition from recipe or use plan nutrients as fallback
    const nutrition = this.extractNutrition(recipe.nutrition, planNutrients);

    // Process instructions from analyzedInstructions or instructions field
    let cleanInstructions: string[] = [];
    
    try {
      if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
        // Use analyzedInstructions if available (structured format)
        const steps = recipe.analyzedInstructions[0].steps || [];
        cleanInstructions = steps
          .filter(step => step.step && step.step.trim().length > 0)
          .map(step => {
            let instruction = step.step.trim();
            
            // Fix temperature formatting
            instruction = instruction.replace(/(\d+)\s*degrees?/gi, '$1°F');
            instruction = instruction.replace(/(\d+)\s*°?\s*(?:fahrenheit|f)/gi, '$1°F');
            instruction = instruction.replace(/(\d+)\s*°?\s*(?:celsius|c)/gi, '$1°C');
            
            // Fix common oven temperature issues
            instruction = instruction.replace(/\b(\d{1,2})°F/g, (match, temp) => {
              const tempNum = parseInt(temp);
              if (tempNum < 100) {
                // Likely missing a digit
                if (tempNum >= 25 && tempNum <= 45) return `${tempNum}0°F`;
                if (tempNum >= 3 && tempNum <= 5) return `${tempNum}50°F`;
              }
              return match;
            });
            
            // Ensure proper capitalization and punctuation
            instruction = instruction.charAt(0).toUpperCase() + instruction.slice(1);
            if (!/[.!?]$/.test(instruction)) {
              instruction += '.';
            }
            
            return `${step.number}. ${instruction}`;
          });
      } else if (recipe.instructions) {
        // Fall back to instructions field
        cleanInstructions = this.cleanInstructions(recipe.instructions);
      }
      
      // Validate instructions quality
      if (cleanInstructions.length === 0 || 
          cleanInstructions.some(inst => inst.includes('not available') || inst.length < 10)) {
        cleanInstructions = this.generateSimpleInstructions(recipe, mealType);
      }
      
    } catch (error) {
      console.error('Error processing instructions:', error);
      cleanInstructions = this.generateSimpleInstructions(recipe, mealType);
    }

    console.log('Recipe data structure:', Object.keys(recipe));
    console.log('Recipe extended ingredients:', recipe.extendedIngredients);
    console.log('Extended ingredients type:', typeof recipe.extendedIngredients);
    console.log('Extended ingredients is array:', Array.isArray(recipe.extendedIngredients));
    console.log('Recipe instructions processed:', cleanInstructions.length);

    // Extract ingredients (with robust fallback for complexSearch results)
    let ingredients: string[] = ['Ingredients not available'];
    
    try {
      if (recipe.extendedIngredients && Array.isArray(recipe.extendedIngredients) && recipe.extendedIngredients.length > 0) {
        ingredients = recipe.extendedIngredients.map(ing => {
          if (ing && typeof ing === 'object') {
            return ing.original || `${ing.amount || ''} ${ing.unit || ''} ${ing.name || ''}`.trim();
          }
          return 'Unknown ingredient';
        });
        console.log('Successfully processed ingredients:', ingredients.length);
      } else {
        console.log('No extendedIngredients found in recipe');
      }
    } catch (error) {
      console.error('Error processing ingredients:', error);
      ingredients = ['Error processing ingredients - using fallback'];
    }

    // Generate GLP-1 specific tips
    const glp1Tips = this.generateGLP1Tips(nutrition, recipe.readyInMinutes);

    // Determine meal styles
    const mealStyles = this.determineMealStyles(nutrition, recipe.readyInMinutes);

    return {
      id: `spoon_${recipe.id}_${Date.now()}`,
      name: recipe.title,
      description: this.cleanDescription(recipe.summary),
      cookingTime: recipe.readyInMinutes,
      prepTime: Math.max(5, Math.floor(recipe.readyInMinutes * 0.3)), // Estimate prep time
      servings: recipe.servings,
      nutrition,
      ingredients,
      instructions: cleanInstructions,
      tips: [
        `This recipe serves ${recipe.servings} people`,
        `Ready in ${recipe.readyInMinutes} minutes`,
        ...this.generateCookingTips(ingredients)
      ],
      mealStyle: mealStyles,
      glp1Friendly: {
        eatingTips: glp1Tips
      },
      mealPrep: this.analyzeMealPrepFriendliness(recipe)
    };
  }

  /**
   * Extract nutrition information from Spoonacular recipe
   */
  private extractNutrition(recipeNutrition: any, fallbackNutrients: SpoonacularNutrients) {
    const nutrition = {
      protein: 0,
      fiber: 0,
      calories: 0,
      carbs: 0,
      fat: 0
    };

    if (recipeNutrition?.nutrients) {
      for (const nutrient of recipeNutrition.nutrients) {
        const name = nutrient.name.toLowerCase();
        const amount = nutrient.amount || 0;

        if (name.includes('protein')) {
          nutrition.protein = amount;
        } else if (name.includes('fiber')) {
          nutrition.fiber = amount;
        } else if (name.includes('calories') || name.includes('energy')) {
          nutrition.calories = amount;
        } else if (name.includes('carbohydrate')) {
          nutrition.carbs = amount;
        } else if (name.includes('fat') && !name.includes('saturated')) {
          nutrition.fat = amount;
        }
      }
    }

    // Use fallback if recipe nutrition is incomplete
    if (nutrition.calories === 0) nutrition.calories = fallbackNutrients.calories;
    if (nutrition.protein === 0) nutrition.protein = fallbackNutrients.protein;
    if (nutrition.carbs === 0) nutrition.carbs = fallbackNutrients.carbohydrates;
    if (nutrition.fat === 0) nutrition.fat = fallbackNutrients.fat;
    if (nutrition.fiber === 0) nutrition.fiber = fallbackNutrients.fiber;

    return nutrition;
  }

  /**
   * Clean HTML from instructions and format as array
   */
  private cleanInstructions(instructions: string): string[] {
    if (!instructions) return ['Instructions not available'];

    // Remove HTML tags and common HTML entities
    const cleaned = instructions
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&deg;/g, '°')
      .trim();

    // Split into steps (look for numbered steps, periods, or line breaks)
    const steps = cleaned
      .split(/(?:\d+\.|\n|\.(?=\s[A-Z]))/g)
      .filter(step => step.trim().length > 5) // Filter out very short fragments
      .map(step => {
        let cleanStep = step.trim();
        
        // Fix common temperature issues - ensure proper temperature formatting
        cleanStep = cleanStep.replace(/(\d+)\s*degrees?/gi, '$1°F');
        cleanStep = cleanStep.replace(/(\d+)\s*°?\s*(?:fahrenheit|f)/gi, '$1°F');
        cleanStep = cleanStep.replace(/(\d+)\s*°?\s*(?:celsius|c)/gi, '$1°C');
        
        // Fix oven temperatures that are too low (likely missing digit)
        cleanStep = cleanStep.replace(/\b(\d{1,2})°F/g, (match, temp) => {
          const tempNum = parseInt(temp);
          if (tempNum < 100) {
            // Likely missing a digit - common oven temps are 300-450°F
            if (tempNum >= 25 && tempNum <= 45) return `${tempNum}0°F`;
            if (tempNum >= 3 && tempNum <= 5) return `${tempNum}50°F`;
          }
          return match;
        });
        
        // Ensure step starts with capital letter
        if (cleanStep.length > 0) {
          cleanStep = cleanStep.charAt(0).toUpperCase() + cleanStep.slice(1);
        }
        
        // Add period if step doesn't end with punctuation
        if (cleanStep.length > 0 && !/[.!?]$/.test(cleanStep)) {
          cleanStep += '.';
        }
        
        return cleanStep;
      })
      .filter(step => step.length > 0);

    return steps.length > 0 ? steps : [cleaned];
  }

  /**
   * Clean description from HTML and limit length
   */
  private cleanDescription(summary: string): string {
    if (!summary) return 'A delicious and nutritious meal';

    const cleaned = summary
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim();

    // Limit to first sentence or 200 characters
    const firstSentence = cleaned.split('.')[0];
    return firstSentence.length > 200 
      ? firstSentence.substring(0, 200) + '...'
      : firstSentence + '.';
  }

  /**
   * Generate GLP-1 specific eating tips
   */
  private generateGLP1Tips(nutrition: any, cookTime: number): string {
    const tips = [];

    if (nutrition.protein >= 20) {
      tips.push('High protein content helps with satiety');
    }
    
    if (nutrition.fiber >= 4) {
      tips.push('Rich in fiber for better digestion');
    }

    if (cookTime <= 15) {
      tips.push('Quick preparation helps with consistent meal timing');
    }

    tips.push('Eat slowly and chew thoroughly to enhance satiety');
    tips.push('Consider having this with a glass of water 30 minutes before eating');

    return tips.join('. ') + '.';
  }

  /**
   * Determine meal style tags
   */
  private determineMealStyles(nutrition: any, cookTime: number): string[] {
    const styles = ['GLP-1 Friendly'];

    if (nutrition.protein >= 20) styles.push('High Protein');
    if (nutrition.fiber >= 4) styles.push('High Fiber');
    if (cookTime <= 15) styles.push('Quick');
    if (cookTime <= 30) styles.push('Easy');
    if (nutrition.calories <= 400) styles.push('Light');

    return styles;
  }

  /**
   * Generate cooking tips based on ingredients
   */
  private generateCookingTips(ingredients: string[]): string[] {
    const tips = [];
    
    if (ingredients.some(ing => ing.toLowerCase().includes('protein'))) {
      tips.push('Don\'t overcook protein to maintain tenderness');
    }
    
    if (ingredients.some(ing => ing.toLowerCase().includes('vegetable'))) {
      tips.push('Cook vegetables until just tender to preserve nutrients');
    }

    return tips;
  }

  /**
   * Validate that meal meets GLP-1 requirements
   */
  validateGLP1Requirements(meal: GeneratedMeal): { valid: boolean; issues: string[] } {
    const issues = [];

    if (meal.nutrition.protein < 20) {
      issues.push(`Protein too low: ${meal.nutrition.protein}g (need 20g+)`);
    }

    if (meal.nutrition.fiber < 4) {
      issues.push(`Fiber too low: ${meal.nutrition.fiber}g (need 4g+)`);
    }

    if (meal.nutrition.calories > 700) {
      issues.push(`Calories too high: ${meal.nutrition.calories} (consider smaller portions)`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Build a search query based on user preferences
   */
  private buildSearchQuery(preferences: {
    mealType: string;
    proteinSource?: string;
    cuisineType?: string;
  }): string {
    const queryParts: string[] = [];

    // Start with meal type and make it more specific for main meals
    if (preferences.mealType === 'breakfast') {
      queryParts.push('breakfast', 'egg', 'protein');
    } else if (preferences.mealType === 'lunch') {
      queryParts.push('lunch', 'main dish', 'entree');
    } else if (preferences.mealType === 'dinner') {
      queryParts.push('dinner', 'main dish', 'entree');
    } else if (preferences.mealType === 'snack') {
      queryParts.push('snack', 'healthy');
    } else {
      queryParts.push(preferences.mealType, 'main course');
    }

    // Add protein source
    if (preferences.proteinSource) {
      switch (preferences.proteinSource.toLowerCase()) {
        case 'chicken':
          queryParts.push('chicken');
          break;
        case 'seafood':
        case 'fish':
          queryParts.push('fish');
          break;
        case 'beef':
          queryParts.push('beef');
          break;
        case 'pork':
          queryParts.push('pork');
          break;
        case 'turkey':
          queryParts.push('turkey');
          break;
        case 'eggs':
          queryParts.push('eggs');
          break;
        case 'high-protein':
          queryParts.push('high protein');
          break;
        default:
          queryParts.push(preferences.proteinSource);
      }
    }

    // Add cuisine if specified
    if (preferences.cuisineType && preferences.cuisineType !== 'any') {
      queryParts.push(preferences.cuisineType);
    }

    // Exclude bread and baked goods for main meals
    if (preferences.mealType !== 'snack') {
      queryParts.push('-bread', '-bagel', '-muffin');
    }

    return queryParts.join(' ');
  }

  /**
   * Select the best recipe based on GLP-1 nutrition criteria and simplicity
   */
  private selectBestRecipe(recipes: any[], preferences: { mealType: string }): any {
    if (!recipes || recipes.length === 0) return null;

    // Score recipes based on GLP-1 criteria (high protein, high fiber, reasonable calories, quick time)
    const scoredRecipes = recipes.map(recipe => {
      let score = 0;
      
      if (recipe.nutrition?.nutrients) {
        const nutrients = recipe.nutrition.nutrients;
        const protein = nutrients.find((n: any) => n.name === 'Protein')?.amount || 0;
        const fiber = nutrients.find((n: any) => n.name === 'Fiber')?.amount || 0;
        const calories = nutrients.find((n: any) => n.name === 'Calories')?.amount || 0;

        // High protein score - MOST important for GLP-1
        if (protein >= 30) score += 150;      // Excellent protein
        else if (protein >= 25) score += 120; // Very good protein
        else if (protein >= 20) score += 100; // Good protein
        else if (protein >= 15) score += 80;  // Acceptable protein
        else if (protein >= 10) score += 50;  // Low protein but acceptable
        else score += 20; // Keep all recipes, just score lower

        // High fiber score - important for satiety and GLP-1
        if (fiber >= 8) score += 80;       // Excellent fiber
        else if (fiber >= 6) score += 60;  // Very good fiber
        else if (fiber >= 4) score += 40;  // Good fiber
        else if (fiber >= 3) score += 30;  // Preferred minimum fiber
        else if (fiber >= 2) score += 20;  // Acceptable fiber
        else score += 10; // Keep all recipes

        // Reasonable calories (important for GLP-1 weight management)
        const targetCalories = preferences.mealType === 'snack' ? 200 : 500;
        if (calories <= targetCalories) score += 40;
        else if (calories <= targetCalories + 200) score += 20;
        else if (calories <= targetCalories + 400) score += 10;
        else score -= 10; // Too many calories

        // HEAVILY favor quick cooking times - this is key for simplicity
        if (recipe.readyInMinutes <= 20) score += 60;      // Very quick
        else if (recipe.readyInMinutes <= 30) score += 40; // Quick 
        else if (recipe.readyInMinutes <= 45) score += 20; // Reasonable
        else if (recipe.readyInMinutes <= 60) score += 5;  // Getting long
        else score -= 10; // Too long

        console.log(`Recipe "${recipe.title}": Protein=${protein}g, Fiber=${fiber}g, Calories=${calories}, Time=${recipe.readyInMinutes}min, Score=${score}`);
      } else {
        // Give base score even without nutrition data
        score = 30;
      }

      return { recipe, score };
    });

    // Sort by score (highest first) and return the best one
    scoredRecipes.sort((a, b) => b.score - a.score);
    
    const best = scoredRecipes[0];
    if (best) {
      console.log(`Selected best recipe: "${best.recipe.title}" with score ${best.score}`);
      return best.recipe;
    }

    // If no recipes, return null
    return null;
  }

  /**
   * Select multiple best recipes based on GLP-1 nutrition criteria and simplicity
   */
  private selectMultipleBestRecipes(recipes: any[], preferences: any, count: number): any[] {
    if (!recipes || recipes.length === 0) return [];

    // First, filter out inappropriate recipes based on title and dish types
    const appropriateRecipes = recipes.filter(recipe => {
      const title = recipe.title?.toLowerCase() || '';
      const dishTypes = recipe.dishTypes || [];
      
      // Filter out bread/baked goods that aren't appropriate for main meals
      const inappropriateTerms = [
        'bagel', 'bagels', 'bread', 'muffin', 'scone', 'croissant', 'toast', 'roll',
        'biscuit', 'waffle', 'pancake', 'donut', 'pastry', 'cake', 'cookie',
        'pie crust', 'dough', 'batter'
      ];
      
      // Check if title contains inappropriate terms
      const hasInappropriateTitle = inappropriateTerms.some(term => title.includes(term));
      
      // Check if dish types are inappropriate for main meals
      const inappropriateDishTypes = [
        'bread', 'side dish', 'sauce', 'condiment', 'dessert', 'beverage',
        'marinade', 'dip', 'spread'
      ];
      
      const hasInappropriateDishType = dishTypes.some((type: string) => 
        inappropriateDishTypes.includes(type.toLowerCase())
      );
      
      // Validate nutrition data consistency
      let hasInconsistentNutrition = false;
      if (recipe.nutrition?.nutrients) {
        const protein = recipe.nutrition.nutrients.find((n: any) => n.name === 'Protein')?.amount || 0;
        const fiber = recipe.nutrition.nutrients.find((n: any) => n.name === 'Fiber')?.amount || 0;
        const calories = recipe.nutrition.nutrients.find((n: any) => n.name === 'Calories')?.amount || 0;
        
        // High fiber (>8g) from recipes without obvious fiber sources is suspicious
        if (fiber > 8) {
          const ingredients = recipe.extendedIngredients || [];
          const hasFiberSources = ingredients.some((ing: any) => {
            const ingName = ing.name?.toLowerCase() || '';
            return ingName.includes('bean') || ingName.includes('lentil') || 
                   ingName.includes('quinoa') || ingName.includes('oat') ||
                   ingName.includes('barley') || ingName.includes('rice') ||
                   ingName.includes('vegetable') || ingName.includes('broccoli') ||
                   ingName.includes('spinach') || ingName.includes('kale') ||
                   ingName.includes('cabbage') || ingName.includes('chard');
          });
          
          if (!hasFiberSources && ingredients.length > 0) {
            hasInconsistentNutrition = true;
            console.log(`Filtering out "${title}" - high fiber (${fiber}g) but no fiber sources in ingredients`);
          }
        }
        
        // Check for impossible protein to calorie ratios
        if (protein > 0 && calories > 0) {
          const proteinCalories = protein * 4; // 4 calories per gram of protein
          const proteinPercentage = (proteinCalories / calories) * 100;
          
          // If protein accounts for >80% of calories, it's likely wrong data
          if (proteinPercentage > 80) {
            hasInconsistentNutrition = true;
            console.log(`Filtering out "${title}" - impossible protein ratio: ${protein}g protein in ${calories} calories (${proteinPercentage.toFixed(1)}%)`);
          }
        }
        
        // For main meals, require reasonable protein content
        if (preferences.mealType !== 'snack' && protein < 8) {
          console.log(`Filtering out "${title}" - protein too low: ${protein}g`);
          return false;
        }
      }
      
      // Log filtering decisions for debugging
      if (hasInappropriateTitle || hasInappropriateDishType || hasInconsistentNutrition) {
        console.log(`Filtering out "${title}" - inappropriate title: ${hasInappropriateTitle}, inappropriate dish type: ${hasInappropriateDishType}, inconsistent nutrition: ${hasInconsistentNutrition}, dish types: ${dishTypes.join(', ')}`);
      }
      
      return !hasInappropriateTitle && !hasInappropriateDishType && !hasInconsistentNutrition;
    });

    console.log(`Filtered inappropriate recipes: ${appropriateRecipes.length} of ${recipes.length} remaining`);

    // Score recipes based on GLP-1 criteria (high protein, high fiber, reasonable calories, quick time)
    const scoredRecipes = appropriateRecipes.map(recipe => {
      let score = 0;
      
      if (recipe.nutrition?.nutrients) {
        const nutrients = recipe.nutrition.nutrients;
        const protein = nutrients.find((n: any) => n.name === 'Protein')?.amount || 0;
        const fiber = nutrients.find((n: any) => n.name === 'Fiber')?.amount || 0;
        const calories = nutrients.find((n: any) => n.name === 'Calories')?.amount || 0;

        // High protein score - MOST important for GLP-1
        if (protein >= 30) score += 150;      // Excellent protein
        else if (protein >= 25) score += 120; // Very good protein
        else if (protein >= 20) score += 100; // Good protein
        else if (protein >= 15) score += 80;  // Acceptable protein
        else if (protein >= 10) score += 50;  // Low protein but acceptable
        else score += 20; // Keep all recipes, just score lower

        // High fiber score - important for satiety and GLP-1
        if (fiber >= 8) score += 80;       // Excellent fiber
        else if (fiber >= 6) score += 60;  // Very good fiber
        else if (fiber >= 4) score += 40;  // Good fiber
        else if (fiber >= 3) score += 30;  // Preferred minimum fiber
        else if (fiber >= 2) score += 20;  // Acceptable fiber
        else score += 10; // Keep all recipes

        // Reasonable calories (important for GLP-1 weight management)
        const targetCalories = preferences.mealType === 'snack' ? 200 : 500;
        if (calories <= targetCalories) score += 40;
        else if (calories <= targetCalories + 200) score += 20;
        else if (calories <= targetCalories + 400) score += 10;
        else score -= 10; // Too many calories

        // HEAVILY favor quick cooking times - this is key for simplicity
        if (recipe.readyInMinutes <= 20) score += 60;      // Very quick
        else if (recipe.readyInMinutes <= 30) score += 40; // Quick 
        else if (recipe.readyInMinutes <= 45) score += 20; // Reasonable
        else if (recipe.readyInMinutes <= 60) score += 5;  // Getting long
        else score -= 10; // Too long

        console.log(`Recipe "${recipe.title}": Protein=${protein}g, Fiber=${fiber}g, Calories=${calories}, Time=${recipe.readyInMinutes}min, Score=${score}`);
      } else {
        // Give base score even without nutrition data
        score = 30;
      }

      return { recipe, score };
    });

    // Sort by score (highest first)
    scoredRecipes.sort((a, b) => b.score - a.score);
    
    // Apply cooking method and meal prep filters
    let filteredRecipes = scoredRecipes;
    
    // Filter by cooking method if specified
    if (preferences.cookingMethod && preferences.cookingMethod !== 'any') {
      console.log(`\n--- COOKING METHOD FILTERING ---`);
      console.log(`Target cooking method: ${preferences.cookingMethod}`);
      console.log(`Recipes before filtering: ${filteredRecipes.length}`);
      
      filteredRecipes = filteredRecipes.filter(scored => {
        const recipe = scored.recipe;
        const matches = this.matchesCookingMethod(recipe, preferences.cookingMethod);
        
        console.log(`Recipe "${recipe.title}": matches cooking method ${preferences.cookingMethod}=${matches}`);
        
        return matches;
      });
      
      console.log(`Filtered by cooking method (${preferences.cookingMethod}): ${filteredRecipes.length} recipes remaining`);
    } else {
      console.log(`No cooking method filtering applied. cookingMethod: ${preferences.cookingMethod}`);
    }
    
    // Filter by meal prep friendliness if specified
    if (preferences.mealPrepOnly) {
      filteredRecipes = filteredRecipes.filter(scored => {
        const recipe = scored.recipe;
        const title = recipe.title.toLowerCase();
        
        // Quick meal prep check
        const mealPrepFriendlyTypes = ['stew', 'soup', 'casserole', 'bowl', 'curry', 'chili', 'pasta', 'grain', 'salad'];
        const isMealPrepFriendly = mealPrepFriendlyTypes.some(type => title.includes(type));
        
        return isMealPrepFriendly;
      });
      
      console.log(`Filtered by meal prep friendly: ${filteredRecipes.length} recipes remaining`);
    }
    
    // Select top N recipes, ensuring variety
    const selected: any[] = [];
    const usedTitles = new Set<string>();

    for (const scored of filteredRecipes) {
      if (selected.length >= count) break;

      const recipe = scored.recipe;
      if (!recipe || usedTitles.has(recipe.title)) continue; // Skip if already selected

      selected.push(recipe);
      usedTitles.add(recipe.title);
    }

    return selected;
  }

  /**
   * Check if recipe matches cooking method preference
   */
  private matchesCookingMethod(recipe: any, cookingMethod: string): boolean {
    const title = recipe.title?.toLowerCase() || '';
    const instructions = recipe.instructions?.toLowerCase() || '';
    const summary = recipe.summary?.toLowerCase() || '';
    const searchText = `${title} ${instructions} ${summary}`;
    
    // Get ingredients for analysis
    const ingredients = recipe.extendedIngredients?.map((ing: any) => ing.original?.toLowerCase() || '') || [];
    const allText = `${searchText} ${ingredients.join(' ')}`;
    
    switch (cookingMethod) {
      case 'no-cook':
        // Must explicitly be no-cook recipes
        const isExplicitNoCook = allText.includes('no cook') || 
                                allText.includes('no cooking') ||
                                allText.includes('raw') ||
                                allText.includes('uncooked') ||
                                allText.includes('no heat');
        
        // Or be typical no-cook foods (salads, smoothies, etc.)
        const isTypicalNoCook = (
          (title.includes('salad') || title.includes('smoothie') || 
           title.includes('parfait') || title.includes('trail mix') ||
           title.includes('overnight oats') || title.includes('chia pudding') ||
           title.includes('wrap') || title.includes('sandwich') ||
           title.includes('bowl') || title.includes('yogurt')) &&
          !allText.includes('bake') && !allText.includes('cook') && 
          !allText.includes('fry') && !allText.includes('heat') &&
          !allText.includes('sauté') && !allText.includes('roast') &&
          !allText.includes('grill') && !allText.includes('simmer')
        );
        
        // Check if ready time is very short (likely no-cook)
        const isQuickRecipe = recipe.readyInMinutes <= 15 && 
                             !allText.includes('cook') && !allText.includes('bake') &&
                             !allText.includes('fry') && !allText.includes('heat') &&
                             !allText.includes('sauté') && !allText.includes('roast');
        
        // Exclude any recipes that definitely require cooking
        const hasCookingTerms = allText.includes('bake') || allText.includes('roast') ||
                               allText.includes('fry') || allText.includes('sauté') ||
                               allText.includes('grill') || allText.includes('simmer') ||
                               allText.includes('boil') || allText.includes('steam') ||
                               (allText.includes('cook') && !allText.includes('no cook'));
        
        return (isExplicitNoCook || isTypicalNoCook || isQuickRecipe) && !hasCookingTerms;
      
      case 'stovetop-only':
        return (searchText.includes('pan') || searchText.includes('skillet') || 
                searchText.includes('stove') || searchText.includes('sauté') ||
                searchText.includes('fry')) &&
               !searchText.includes('oven') && !searchText.includes('bake');
      
      case 'oven-only':
        return searchText.includes('bake') || searchText.includes('roast') || 
               searchText.includes('oven') || title.includes('baked');
      
      case 'one-pot':
        return searchText.includes('one pot') || searchText.includes('one pan') ||
               searchText.includes('skillet') || searchText.includes('casserole') ||
               title.includes('one pot') || title.includes('one pan');
      
      case 'advanced':
        return searchText.includes('braise') || searchText.includes('confit') ||
               searchText.includes('sous vide') || searchText.includes('flambé') ||
               searchText.includes('reduce') || searchText.includes('emulsify');
      
      default:
        return true; // 'any' method
    }
  }

  /**
   * Calculate recipe complexity based on multiple factors
   */
  private calculateComplexity(recipe: SpoonacularRecipeDetail): {
    level: 'Simple' | 'Medium' | 'Advanced';
    score: number;
    factors: string[];
  } {
    let score = 0;
    const factors: string[] = [];

    // Factor 1: Number of ingredients (40% weight)
    const ingredientCount = recipe.extendedIngredients?.length || 0;
    if (ingredientCount <= 6) {
      score += 10; // Simple
      factors.push(`Few ingredients (${ingredientCount})`);
    } else if (ingredientCount <= 12) {
      score += 20; // Medium
      factors.push(`Moderate ingredients (${ingredientCount})`);
    } else {
      score += 35; // Advanced
      factors.push(`Many ingredients (${ingredientCount})`);
    }

    // Factor 2: Number of steps (30% weight)
    const stepCount = this.getInstructionStepCount(recipe);
    if (stepCount <= 4) {
      score += 5; // Simple
      factors.push(`Quick steps (${stepCount})`);
    } else if (stepCount <= 8) {
      score += 15; // Medium
      factors.push(`Several steps (${stepCount})`);
    } else {
      score += 25; // Advanced
      factors.push(`Many steps (${stepCount})`);
    }

    // Factor 3: Cooking time (20% weight)
    const totalTime = recipe.readyInMinutes || 0;
    if (totalTime <= 20) {
      score += 5; // Simple
      factors.push('Quick cooking');
    } else if (totalTime <= 45) {
      score += 10; // Medium
      factors.push('Moderate time');
    } else {
      score += 20; // Advanced
      factors.push('Long cooking');
    }

    // Factor 4: Cooking techniques (10% weight)
    const techniques = this.identifyCookingTechniques(recipe);
    if (techniques.basic) {
      score += 2;
      factors.push('Basic techniques');
    }
    if (techniques.intermediate) {
      score += 8;
      factors.push('Some skill required');
    }
    if (techniques.advanced) {
      score += 15;
      factors.push('Advanced techniques');
    }

    // Determine level based on total score
    let level: 'Simple' | 'Medium' | 'Advanced';
    if (score <= 35) {  // Increased from 25 to be more inclusive
      level = 'Simple';
    } else if (score <= 55) {  // Increased from 50 to be more inclusive
      level = 'Medium';
    } else {
      level = 'Advanced';
    }

    return { level, score, factors };
  }

  /**
   * Count instruction steps from recipe
   */
  private getInstructionStepCount(recipe: SpoonacularRecipeDetail): number {
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
      return recipe.analyzedInstructions[0].steps?.length || 0;
    }
    
    // Fallback: count from instructions string
    if (recipe.instructions) {
      const steps = recipe.instructions.split(/\d+\.|\n/).filter(step => step.trim().length > 10);
      return steps.length;
    }
    
    return 0;
  }

  /**
   * Identify cooking techniques used in recipe
   */
  private identifyCookingTechniques(recipe: SpoonacularRecipeDetail): {
    basic: boolean;
    intermediate: boolean;
    advanced: boolean;
  } {
    const instructions = (recipe.instructions || '').toLowerCase();
    const title = recipe.title.toLowerCase();
    
    // Basic techniques
    const basicTechniques = ['boil', 'steam', 'mix', 'combine', 'chop', 'slice', 'heat', 'warm'];
    const basic = basicTechniques.some(tech => instructions.includes(tech) || title.includes(tech));

    // Intermediate techniques
    const intermediateTechniques = ['sauté', 'grill', 'roast', 'bake', 'fry', 'simmer', 'marinate', 'season'];
    const intermediate = intermediateTechniques.some(tech => instructions.includes(tech) || title.includes(tech));

    // Advanced techniques
    const advancedTechniques = ['braise', 'confit', 'sous vide', 'flambé', 'reduce', 'emulsify', 'caramelize', 'tempering'];
    const advanced = advancedTechniques.some(tech => instructions.includes(tech) || title.includes(tech));

    return { basic, intermediate, advanced };
  }

  /**
   * Generate simple instructions when none are available from the API
   */
  private generateSimpleInstructions(recipe: SpoonacularRecipeDetail, mealType: string): string[] {
    const instructions: string[] = [];
    const ingredients = recipe.extendedIngredients || [];
    
    // Analyze ingredients to determine cooking method
    const hasOven = ingredients.some(ing => 
      ing.original?.toLowerCase().includes('bake') || 
      recipe.title.toLowerCase().includes('baked') ||
      recipe.title.toLowerCase().includes('roast')
    );
    
    const hasStove = ingredients.some(ing => 
      ing.original?.toLowerCase().includes('sauté') || 
      ing.original?.toLowerCase().includes('cook') ||
      recipe.title.toLowerCase().includes('stir') ||
      recipe.title.toLowerCase().includes('pan')
    );
    
    const hasPasta = ingredients.some(ing => 
      ing.name?.toLowerCase().includes('pasta') ||
      ing.name?.toLowerCase().includes('noodle') ||
      ing.name?.toLowerCase().includes('rice')
    );
    
    const hasProtein = ingredients.some(ing => 
      ing.name?.toLowerCase().includes('chicken') ||
      ing.name?.toLowerCase().includes('beef') ||
      ing.name?.toLowerCase().includes('fish') ||
      ing.name?.toLowerCase().includes('turkey') ||
      ing.name?.toLowerCase().includes('tofu')
    );
    
    // Generate instructions based on cooking method and meal type
    switch (mealType.toLowerCase()) {
      case 'snack':
        instructions.push(
          "1. Gather all ingredients and prepare your workspace.",
          "2. Combine or arrange ingredients as desired.",
          "3. If heating is needed, use low-medium heat for 2-3 minutes.",
          "4. Serve immediately or chill if preferred.",
          "5. Enjoy your healthy, protein-rich snack!"
        );
        break;
        
      case 'breakfast':
        if (hasOven) {
          instructions.push(
            "1. Preheat oven to 375°F (190°C).",
            "2. Prepare all ingredients as listed.",
            "3. Arrange ingredients in baking dish or on baking sheet.",
            "4. Bake for 15-25 minutes until golden and cooked through.",
            "5. Let cool for 2-3 minutes before serving."
          );
        } else {
          instructions.push(
            "1. Heat a non-stick pan over medium heat.",
            "2. Prepare and measure all ingredients.",
            "3. Cook ingredients in the order they require, starting with proteins.",
            "4. Combine ingredients and cook for 5-8 minutes until heated through.",
            "5. Season to taste and serve hot."
          );
        }
        break;
        
      default: // lunch/dinner
        if (hasOven) {
          instructions.push(
            "1. Preheat oven to 400°F (200°C).",
            "2. Prep all ingredients - wash, chop, and measure as needed.",
            hasProtein ? "3. Season protein with salt, pepper, and any spices." : "3. Prepare main ingredients in a baking dish.",
            "4. Arrange ingredients in baking dish or on sheet pan.",
            "5. Bake for 20-30 minutes until proteins reach safe internal temperature.",
            "6. Let rest for 5 minutes before serving."
          );
        } else if (hasPasta) {
          instructions.push(
            "1. Bring a large pot of salted water to boil.",
            "2. Cook pasta according to package directions until al dente.",
            "3. Meanwhile, heat oil in a large pan over medium-high heat.",
            hasProtein ? "4. Cook protein pieces until golden and cooked through, about 6-8 minutes." : "4. Sauté aromatics (onions, garlic) until fragrant.",
            "5. Add remaining ingredients and simmer for 10-15 minutes.",
            "6. Drain pasta and combine with sauce. Serve hot."
          );
        } else {
          instructions.push(
            "1. Heat 1-2 tablespoons oil in a large skillet over medium-high heat.",
            "2. Prep all ingredients - wash, chop, and measure.",
            hasProtein ? "3. Season and cook protein first, about 6-8 minutes until cooked through. Set aside." : "3. Start with aromatics - cook onions and garlic until fragrant.",
            "4. Add vegetables in order of cooking time needed (harder vegetables first).",
            "5. Return protein to pan if using, add seasonings and any sauces.",
            "6. Cook for 5-10 minutes until vegetables are tender and flavors meld.",
            "7. Taste and adjust seasoning. Serve hot."
          );
        }
    }

    // Add recipe source reference
    if (recipe.sourceUrl) {
      instructions.push(`\nNote: For the original detailed recipe, visit: ${recipe.sourceUrl}`);
    }
    
    return instructions;
  }

  /**
   * Get search keywords for cooking methods
   */
  private getCookingMethodKeywords(cookingMethod: string): string {
    const keywordMap: { [key: string]: string } = {
      'no-cook': 'no cook raw fresh salad smoothie parfait overnight oats chia pudding trail mix',
      'stovetop-only': 'pan fry sauté stir skillet stovetop',
      'oven-only': 'baked roasted oven sheet pan',
      'one-pot': 'one pot one pan skillet casserole',
      'advanced': 'braise confit sous vide flambé'
    };
    
    return keywordMap[cookingMethod] || '';
  }

  /**
   * Determine if recipe is meal prep friendly and provide optimization tips
   */
  private analyzeMealPrepFriendliness(recipe: SpoonacularRecipeDetail): {
    friendly: boolean;
    storageInstructions?: string;
    reheatingTips?: string;
    shelfLife?: string;
    batchScaling?: number;
  } {
    const title = recipe.title.toLowerCase();
    const instructions = (recipe.instructions || '').toLowerCase();
    const ingredients = recipe.extendedIngredients?.map(ing => ing.name.toLowerCase()) || [];

    let score = 0;
    let reasons: string[] = [];

    // Positive factors for meal prep
    const mealPrepFriendlyTypes = ['stew', 'soup', 'casserole', 'bowl', 'curry', 'chili', 'pasta', 'grain', 'salad'];
    if (mealPrepFriendlyTypes.some(type => title.includes(type))) {
      score += 30;
      reasons.push('meal prep friendly dish type');
    }

    // Protein + grain/vegetable combinations are excellent for meal prep
    const hasProtein = ingredients.some(ing => 
      ['chicken', 'turkey', 'fish', 'tofu', 'beans', 'lentils', 'eggs'].some(protein => ing.includes(protein))
    );
    const hasGrains = ingredients.some(ing => 
      ['rice', 'quinoa', 'pasta', 'barley', 'oats'].some(grain => ing.includes(grain))
    );
    if (hasProtein && hasGrains) {
      score += 25;
      reasons.push('protein + grain combination');
    }

    // Foods that store well
    const storableFoods = ['roasted', 'baked', 'grilled', 'steamed', 'cooked'];
    if (storableFoods.some(method => instructions.includes(method))) {
      score += 20;
      reasons.push('uses storage-friendly cooking methods');
    }

    // Negative factors
    const mealPrepUnfriendly = ['fried', 'crispy', 'fresh', 'raw', 'lettuce', 'avocado', 'bread'];
    if (mealPrepUnfriendly.some(item => title.includes(item) || instructions.includes(item))) {
      score -= 15;
      reasons.push('contains ingredients that don\'t store well');
    }

    // Determine if meal prep friendly (score >= 35)
    const friendly = score >= 35;

    // Generate storage and reheating instructions
    let storageInstructions = '';
    let reheatingTips = '';
    let shelfLife = '';
    let batchScaling = 1;

    if (friendly) {
      // Storage instructions
      if (mealPrepFriendlyTypes.some(type => ['soup', 'stew', 'curry', 'chili'].includes(type) && title.includes(type))) {
        storageInstructions = 'Store in airtight containers in refrigerator. Can be frozen for longer storage.';
        reheatingTips = 'Reheat in microwave (2-3 minutes) or stovetop over medium heat. Add splash of water/broth if needed.';
        shelfLife = '3-4 days refrigerated, 3 months frozen';
        batchScaling = 4; // Great for batch cooking
      } else if (title.includes('bowl') || (hasProtein && hasGrains)) {
        storageInstructions = 'Store components separately if possible. Keep dressing/sauce separate until serving.';
        reheatingTips = 'Reheat in microwave (1-2 minutes) or enjoy cold. Add fresh garnishes before serving.';
        shelfLife = '3-4 days refrigerated';
        batchScaling = 3;
      } else {
        storageInstructions = 'Store in refrigerator in airtight containers.';
        reheatingTips = 'Reheat in microwave (1-2 minutes) until heated through.';
        shelfLife = '2-3 days refrigerated';
        batchScaling = 2;
      }
    }

    return {
      friendly,
      storageInstructions: friendly ? storageInstructions : undefined,
      reheatingTips: friendly ? reheatingTips : undefined,
      shelfLife: friendly ? shelfLife : undefined,
      batchScaling: friendly ? batchScaling : undefined
    };
  }

  /**
   * Provide fallback meals when API quota is exceeded
   */
  getFallbackMeals(mealType: string): GeneratedMeal[] {
    // Return a simple fallback meal
    return [{
      id: `fallback_${mealType}_${Date.now()}`,
      name: `Sample ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Recipe`,
      description: 'This is a sample recipe shown due to API limits. Upgrade your Spoonacular plan for fresh recipes.',
      cookingTime: 20,
      prepTime: 10,
      servings: 2,
      nutrition: {
        protein: 25,
        fiber: 6,
        calories: 400,
        carbs: 30,
        fat: 15
      },
      ingredients: [
        'Sample ingredient 1',
        'Sample ingredient 2',
        'Sample ingredient 3'
      ],
      instructions: [
        '1. This is a sample recipe due to API quota limits.',
        '2. Please upgrade your Spoonacular API plan for fresh recipes.',
        '3. Thank you for understanding!'
      ],
      tips: [
        'API quota exceeded - showing sample data',
        'Consider upgrading your Spoonacular plan'
      ],
      mealStyle: ['sample'],
      glp1Friendly: {
        eatingTips: 'This is sample data due to API limits.'
      },
      complexity: {
        level: 'Simple',
        score: 30,
        factors: ['Sample complexity data']
      },
      mealPrep: {
        friendly: true,
        storageInstructions: 'Sample storage instructions',
        reheatingTips: 'Sample reheating tips'
      }
    }];
  }
}

export const spoonacularService = new SpoonacularService();
