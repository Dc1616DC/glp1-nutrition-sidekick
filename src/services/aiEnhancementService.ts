import OpenAI from 'openai';

interface RecipeEnhancement {
  type: 'protein-boost' | 'fiber-boost' | 'vegetarian' | 'simplify' | 'meal-prep' | 'shopping-list' | 'scale';
  originalRecipe: any;
  parameters?: {
    targetProtein?: number;
    targetFiber?: number;
    servings?: number;
    maxTime?: number;
  };
}

interface EnhancementResult {
  success: boolean;
  enhancedRecipe?: any;
  modifications?: string[];
  error?: string;
}

export class AIEnhancementService {
  private openai: OpenAI;
  private lastRequestTime: number = 0;
  private readonly REQUEST_DELAY = 3000; // 3 seconds minimum between requests
  private requestCount: number = 0;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 60000, // 60 second timeout
    });
  }

  private async rateLimitDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    this.requestCount++;
    
    // Increase delay based on request count
    const dynamicDelay = this.REQUEST_DELAY + (this.requestCount * 1000); // Add 1s per request
    const effectiveDelay = Math.min(dynamicDelay, 10000); // Max 10 seconds
    
    if (timeSinceLastRequest < effectiveDelay) {
      const delay = effectiveDelay - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${delay}ms before request #${this.requestCount}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
    
    // Reset counter after 5 minutes of inactivity
    setTimeout(() => {
      if (Date.now() - this.lastRequestTime > 300000) {
        this.requestCount = 0;
        console.log('Request counter reset due to inactivity');
      }
    }, 300000);
  }

  /**
   * Boost protein content to meet GLP-1 requirements
   */
  async boostProtein(recipe: any, targetProtein: number = 20): Promise<EnhancementResult> {
    const currentProtein = recipe.nutrition.protein;
    const proteinGap = targetProtein - currentProtein;

    if (proteinGap <= 0) {
      return {
        success: true,
        enhancedRecipe: recipe,
        modifications: ['Recipe already meets protein target']
      };
    }

    const prompt = `
You are a nutrition expert helping GLP-1 medication users. Take this recipe and modify it to add ${proteinGap}g more protein while keeping it practical and delicious.

ORIGINAL RECIPE:
Name: ${recipe.name}
Current Protein: ${currentProtein}g
Target Protein: ${targetProtein}g
Ingredients: ${recipe.ingredients.join(', ')}
Instructions: ${recipe.instructions.join(' ')}

REQUIREMENTS:
- Add exactly ${proteinGap}g more protein through practical ingredient additions
- Keep the recipe simple and GLP-1-friendly
- Suggest specific protein-rich ingredients with amounts
- Maintain the cooking method and complexity
- Do NOT estimate nutrition facts - just modify the recipe

Respond in this JSON format:
{
  "modifiedIngredients": ["updated ingredient list with protein additions"],
  "modifiedInstructions": ["updated cooking instructions"],
  "addedIngredients": ["list of new protein ingredients added"],
  "modifications": ["List of changes made"],
  "nutritionNote": "Nutrition facts kept from original recipe. Actual values may differ due to ingredient additions."
}`;

    try {
      await this.rateLimitDelay();
      
      console.log(`Making OpenAI request for enhancement...`);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });
      console.log(`OpenAI request completed successfully`);

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      const enhancedRecipe = {
        ...recipe,
        ingredients: result.modifiedIngredients,
        instructions: result.modifiedInstructions,
        // Keep original nutrition - AI estimates are unreliable
        nutrition: recipe.nutrition,
        tips: [
          ...recipe.tips, 
          `Added ${result.addedIngredients.join(', ')} for extra protein`,
          '⚠️ Nutrition facts from original recipe - actual values may differ due to modifications'
        ],
        mealStyle: [...recipe.mealStyle, 'AI Enhanced', 'High Protein'],
        nutritionSource: 'Original Spoonacular (AI modified recipe)',
        warnings: [
          ...(recipe.warnings || []),
          'Recipe modified by AI - nutrition facts may not reflect ingredient changes'
        ]
      };

      return {
        success: true,
        enhancedRecipe,
        modifications: result.modifications
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      let errorMessage = 'Failed to enhance recipe';
      
      if (error instanceof Error) {
        if (error.message.includes('rate_limit')) {
          errorMessage = 'API rate limit exceeded - please wait a moment';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out - please try again';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error - check connection';
        } else {
          errorMessage = `Failed to enhance recipe: ${error.message}`;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Convert recipe to vegetarian while maintaining nutrition
   */
  async makeVegetarian(recipe: any): Promise<EnhancementResult> {
    const prompt = `
Convert this recipe to vegetarian while maintaining the same protein and nutrition profile for GLP-1 users.

ORIGINAL RECIPE:
Name: ${recipe.name}
Protein: ${recipe.nutrition.protein}g
Ingredients: ${recipe.ingredients.join(', ')}
Instructions: ${recipe.instructions.join(' ')}

REQUIREMENTS:
- Replace all meat/fish with high-protein vegetarian alternatives
- Aim to maintain similar protein levels with plant-based sources
- Keep the cooking method similar
- Use practical vegetarian protein sources (beans, lentils, tofu, eggs, dairy)
- Do NOT estimate nutrition facts - just convert the recipe

Respond in this JSON format:
{
  "modifiedName": "new vegetarian recipe name",
  "modifiedIngredients": ["updated ingredient list"],
  "modifiedInstructions": ["updated cooking instructions"],
  "substitutions": ["original ingredient -> vegetarian substitute"],
  "modifications": ["List of changes made"],
  "nutritionNote": "Nutrition facts kept from original recipe. Actual values will differ due to ingredient substitutions."
}`;

    try {
      await this.rateLimitDelay();
      
      console.log(`Making OpenAI request for enhancement...`);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });
      console.log(`OpenAI request completed successfully`);

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      const enhancedRecipe = {
        ...recipe,
        name: result.modifiedName,
        ingredients: result.modifiedIngredients,
        instructions: result.modifiedInstructions,
        // Keep original nutrition - conversions change nutrition unpredictably
        nutrition: recipe.nutrition,
        tips: [
          ...recipe.tips, 
          ...result.substitutions.map((sub: string) => `Substitution: ${sub}`),
          '⚠️ Nutrition facts from original recipe - actual values will differ due to vegetarian substitutions'
        ],
        mealStyle: [...recipe.mealStyle.filter(style => style !== 'Non-Vegetarian'), 'Vegetarian', 'AI Enhanced'],
        nutritionSource: 'Original Spoonacular (AI converted to vegetarian)',
        warnings: [
          ...(recipe.warnings || []),
          'Recipe converted to vegetarian - nutrition facts may not reflect ingredient changes'
        ]
      };

      return {
        success: true,
        enhancedRecipe,
        modifications: result.modifications
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to convert to vegetarian: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Simplify recipe for time-constrained users
   */
  async simplifyRecipe(recipe: any, maxTime: number = 20): Promise<EnhancementResult> {
    const prompt = `
Simplify this recipe to take no more than ${maxTime} minutes while maintaining nutrition for GLP-1 users.

ORIGINAL RECIPE:
Name: ${recipe.name}
Current Time: ${recipe.cookingTime} minutes
Protein: ${recipe.nutrition.protein}g
Ingredients: ${recipe.ingredients.join(', ')}
Instructions: ${recipe.instructions.join(' ')}

REQUIREMENTS:
- Reduce cooking time to ${maxTime} minutes or less
- Simplify cooking techniques (fewer steps, basic methods)
- Use shortcuts like pre-cooked ingredients when helpful
- Keep it GLP-1 friendly
- Do NOT estimate nutrition facts - just simplify the recipe

Respond in this JSON format:
{
  "modifiedName": "simplified recipe name",
  "modifiedIngredients": ["simplified ingredient list"],
  "modifiedInstructions": ["simplified cooking steps"],
  "timeSavingTips": ["list of shortcuts used"],
  "newCookingTime": ${maxTime},
  "modifications": ["List of simplifications made"],
  "nutritionNote": "Nutrition facts kept from original recipe. Values may differ due to ingredient shortcuts."
}`;

    try {
      await this.rateLimitDelay();
      
      console.log(`Making OpenAI request for enhancement...`);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });
      console.log(`OpenAI request completed successfully`);

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      const enhancedRecipe = {
        ...recipe,
        name: result.modifiedName,
        ingredients: result.modifiedIngredients,
        instructions: result.modifiedInstructions,
        cookingTime: Number(result.newCookingTime),
        prepTime: Math.min(Number(recipe.prepTime), Number(result.newCookingTime)),
        // Keep original nutrition - simplifications change nutrition unpredictably
        nutrition: recipe.nutrition,
        tips: [
          ...recipe.tips, 
          ...result.timeSavingTips,
          '⚠️ Nutrition facts from original recipe - actual values may differ due to recipe simplifications'
        ],
        mealStyle: [...recipe.mealStyle, 'AI Enhanced', 'Quick', 'Simplified'],
        complexity: {
          level: 'Simple' as const,
          score: 15,
          factors: ['AI Simplified', 'Time Optimized']
        },
        nutritionSource: 'Original Spoonacular (AI simplified recipe)',
        warnings: [
          ...(recipe.warnings || []),
          'Recipe simplified by AI - nutrition facts may not reflect ingredient/method changes'
        ]
      };

      return {
        success: true,
        enhancedRecipe,
        modifications: result.modifications
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to simplify recipe: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Add meal prep instructions and batch cooking tips
   */
  async addMealPrepInstructions(recipe: any): Promise<EnhancementResult> {
    const prompt = `
Add comprehensive meal prep instructions to this recipe for GLP-1 users who want to batch cook.

ORIGINAL RECIPE:
Name: ${recipe.name}
Servings: ${recipe.servings}
Ingredients: ${recipe.ingredients.join(', ')}
Instructions: ${recipe.instructions.join(' ')}

REQUIREMENTS:
- Scale recipe to 8-12 servings total (reasonable batch size)
- Add proper storage instructions
- Include reheating tips that maintain quality
- Suggest prep-ahead components
- Estimate shelf life
- Keep nutrition per serving the same

Respond in this JSON format:
{
  "batchIngredients": ["ingredient list scaled for batch cooking"],
  "batchInstructions": ["batch cooking instructions"],
  "mealPrepTips": ["prep-ahead suggestions"],
  "storageInstructions": "how to store properly",
  "reheatingInstructions": "best reheating methods",
  "shelfLife": "how long it keeps",
  "portionGuidance": "how to portion for meals",
  "modifications": ["meal prep changes made"]
}`;

    try {
      await this.rateLimitDelay();
      
      console.log(`Making OpenAI request for enhancement...`);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });
      console.log(`OpenAI request completed successfully`);

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      const enhancedRecipe = {
        ...recipe,
        ingredients: result.batchIngredients,
        instructions: result.batchInstructions,
        tips: [
          ...recipe.tips,
          ...result.mealPrepTips,
          `Storage: ${result.storageInstructions}`,
          `Reheating: ${result.reheatingInstructions}`,
          `Keeps for: ${result.shelfLife}`
        ],
        mealStyle: [...recipe.mealStyle, 'AI Enhanced', 'Meal Prep Friendly', 'Batch Cooking'],
        mealPrep: {
          friendly: true,
          storageInstructions: result.storageInstructions,
          reheatingTips: result.reheatingInstructions,
          shelfLife: result.shelfLife,
          batchScaling: Math.min(Math.ceil(10 / recipe.servings), 3) // Scale to ~10 servings, max 3x original
        },
        nutritionSource: 'AI Enhanced from Spoonacular'
      };

      return {
        success: true,
        enhancedRecipe,
        modifications: result.modifications
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to add meal prep instructions: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Handle custom user requests about the recipe
   */
  async handleCustomRequest(recipe: any, userRequest: string): Promise<EnhancementResult> {
    const prompt = `
You are a nutrition expert helping GLP-1 medication users customize their meals. A user has asked a specific question or request about this recipe.

ORIGINAL RECIPE:
Name: ${recipe.name}
Servings: ${recipe.servings}
Protein: ${recipe.nutrition.protein}g
Fiber: ${recipe.nutrition.fiber}g
Ingredients: ${recipe.ingredients.join(', ')}
Instructions: ${recipe.instructions.join(' ')}

USER REQUEST: "${userRequest}"

REQUIREMENTS:
- Address the user's specific request as accurately as possible
- Keep modifications GLP-1 friendly (high protein, high fiber when possible)
- If it's a question, provide a helpful answer
- If it's a modification request, modify the recipe appropriately
- If asking for pairings/sides, suggest GLP-1-friendly options
- Always be practical and realistic
- Do NOT estimate new nutrition facts - keep original nutrition data

Respond in this JSON format:
{
  "responseType": "modification|suggestion|answer",
  "response": "Your detailed response to the user's request",
  "modifiedName": "new recipe name if modified, otherwise original name",
  "modifiedIngredients": ["ingredient list if modified, otherwise original"],
  "modifiedInstructions": ["instruction list if modified, otherwise original"],
  "modifications": ["List of changes made, or key points if it's advice/suggestions"],
  "nutritionNote": "Note about nutrition accuracy if recipe was modified"
}`;

    try {
      await this.rateLimitDelay();
      
      console.log(`Making OpenAI request for custom enhancement: "${userRequest.substring(0, 50)}..."`);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });
      console.log(`OpenAI request completed successfully`);

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Determine if this was a modification or just advice/suggestions
      const wasModified = result.responseType === 'modification' && 
                         (JSON.stringify(result.modifiedIngredients) !== JSON.stringify(recipe.ingredients) ||
                          JSON.stringify(result.modifiedInstructions) !== JSON.stringify(recipe.instructions));
      
      const enhancedRecipe = {
        ...recipe,
        name: result.modifiedName || recipe.name,
        ingredients: result.modifiedIngredients || recipe.ingredients,
        instructions: result.modifiedInstructions || recipe.instructions,
        // Keep original nutrition - AI estimates are unreliable
        nutrition: recipe.nutrition,
        tips: [
          ...recipe.tips,
          `💬 AI Response: ${result.response}`,
          ...(result.nutritionNote ? [`⚠️ ${result.nutritionNote}`] : [])
        ],
        mealStyle: [...recipe.mealStyle, 'AI Enhanced', 'Custom Modified'],
        nutritionSource: wasModified ? 'Original Spoonacular (AI customized)' : recipe.nutritionSource,
        warnings: [
          ...(recipe.warnings || []),
          ...(wasModified ? ['Recipe customized by AI - nutrition facts may not reflect changes'] : [])
        ]
      };

      return {
        success: true,
        enhancedRecipe,
        modifications: result.modifications || [`Responded to: "${userRequest}"`]
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      let errorMessage = 'Failed to process custom request';
      
      if (error instanceof Error) {
        if (error.message.includes('rate_limit')) {
          errorMessage = 'API rate limit exceeded - please wait a moment';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out - please try again';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error - check connection';
        } else {
          errorMessage = `Failed to process custom request: ${error.message}`;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Generate smart shopping list with organization
   */
  async generateShoppingList(recipes: any[]): Promise<{
    success: boolean;
    shoppingList?: {
      produce: string[];
      proteins: string[];
      pantry: string[];
      dairy: string[];
      other: string[];
    };
    error?: string;
  }> {
    const allIngredients = recipes.flatMap(recipe => recipe.ingredients);
    
    const prompt = `
Create an organized shopping list from these recipe ingredients for GLP-1 users.

INGREDIENTS FROM RECIPES:
${allIngredients.join(', ')}

REQUIREMENTS:
- Organize by grocery store sections
- Combine duplicate items with quantities
- Prioritize fresh, high-quality ingredients
- Include GLP-1-friendly alternatives when relevant
- Remove very common pantry items people likely have

Respond in this JSON format:
{
  "produce": ["fresh fruits and vegetables"],
  "proteins": ["meat, fish, eggs, etc."],
  "pantry": ["grains, spices, canned goods"],
  "dairy": ["milk, cheese, yogurt"],
  "other": ["miscellaneous items"],
  "tips": ["shopping tips for GLP-1 users"]
}`;

    try {
      await this.rateLimitDelay();
      
      console.log(`Making OpenAI request for enhancement...`);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });
      console.log(`OpenAI request completed successfully`);

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        success: true,
        shoppingList: {
          produce: result.produce,
          proteins: result.proteins,
          pantry: result.pantry,
          dairy: result.dairy,
          other: result.other
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate shopping list: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const aiEnhancementService = new AIEnhancementService();