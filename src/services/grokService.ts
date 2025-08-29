import OpenAI from 'openai';
import { Recipe, MealPreferences } from '../types/recipe';
import { MealType, CreativityLevel, DifficultyLevel } from '../types/meal';
import { NutritionInfo } from '../types/common';

const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY!,
  baseURL: 'https://api.x.ai/v1',
});

interface CalorieRange {
  min: number;
  max: number;
}

interface GLP1RecipePrompt {
  mealType: MealType;
  restrictions: string[];
  numOptions: number;
  proteinTarget: number;
  fiberTarget: number;
  calorieRange: CalorieRange;
  maxCookingTime: number;
}

// Enhanced preferences for chef-inspired meals
interface EnhancedMealPreferences extends MealPreferences {
  allergies?: string[];
  creativityLevel?: CreativityLevel;
  assemblyToRecipeRatio?: number; // 0-1 ratio (0.6 = 60% assemblies, 40% recipes)
  availableIngredients?: string[];
  specificMeal?: string; // When user requests a specific meal like "High-fiber smoothie with berries"
}

interface GrokRecipeResponse {
  recipes: Array<{
    title?: string;
    chefName?: string;
    type?: 'quick-assembly' | 'structured-recipe';
    appealingClassification?: string;
    servings?: number;
    cookingTime?: number;
    prepTime?: number;
    difficulty?: DifficultyLevel;
    ingredients?: string[];
    instructions?: string[];
    assemblySteps?: string[];
    chefTips?: string[];
    satisfactionFactors?: string[];
    glp1Benefits?: string;
    mealPrepFriendly?: boolean;
    estimatedNutrition?: NutritionInfo;
    tags?: string[];
  }>;
}

export class GrokService {
  /**
   * Generate GLP-1 optimized recipes using Grok AI with chef-inspired names and appeal
   */
  async generateGLP1Recipes(preferences: EnhancedMealPreferences): Promise<Recipe[]> {
    const prompt = this.buildChefInspiredPrompt(preferences);
    
    try {
      console.log('🤖 Generating chef-inspired recipes with Grok AI...');
      
      const response = await grok.chat.completions.create({
        model: 'grok-2-1212',
        messages: [
          { 
            role: 'system', 
            content: 'You are a popular chef who specializes in creating appealing, practical meals for people using GLP-1 medications. You excel at making simple foods sound delicious and satisfying with creative, appealing names.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from Grok');
      }

      const generated = JSON.parse(content);
      
      if (!generated.recipes || !Array.isArray(generated.recipes)) {
        throw new Error('Invalid response format from Grok');
      }

      // Convert to our Recipe interface with chef-inspired enhancements
      const recipes = (generated as GrokRecipeResponse).recipes.map((recipe, index: number) => ({
        id: `grok_chef_${Date.now()}_${index}`,
        title: recipe.title || recipe.chefName || 'Delicious Creation',
        ingredients: this.parseIngredients(recipe.ingredients || []),
        instructions: recipe.instructions || recipe.assemblySteps || [],
        nutritionTotals: {
          protein: recipe.estimatedNutrition?.protein || 0,
          fiber: recipe.estimatedNutrition?.fiber || 0,
          calories: recipe.estimatedNutrition?.calories || 0,
          carbs: recipe.estimatedNutrition?.carbs || 0,
          fat: recipe.estimatedNutrition?.fat || 0,
        },
        glp1Notes: recipe.glp1Benefits || 'Optimized for GLP-1 medication users with satisfying appeal',
        cookingTime: recipe.cookingTime || 0,
        servings: recipe.servings || 1,
        mealType: preferences.mealType,
        difficulty: recipe.type === 'quick-assembly' ? 'easy' : (recipe.difficulty || 'moderate'),
        tags: [
          ...(recipe.tags || ['GLP-1 Friendly', 'High Protein', 'High Fiber']),
          ...(recipe.satisfactionFactors || []),
          recipe.appealingClassification || 'Chef-Inspired'
        ],
        // Enhanced fields for chef-inspired appeal
        chefTips: recipe.chefTips || [],
        satisfactionFactors: recipe.satisfactionFactors || [],
        appealingClassification: recipe.appealingClassification || 'Satisfying Creation',
        assemblyTips: recipe.assemblyTips || [],
        mealPrepFriendly: recipe.mealPrepFriendly || false
      }));

      console.log(`✅ Generated ${recipes.length} chef-inspired recipes from Grok`);
      return recipes;

    } catch (error) {
      console.error('❌ Grok API error:', error);
      throw new Error(`Failed to generate recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enhance existing recipe with "Add Flavorful Twists"
   */
  async enhanceWithFlavorfulTwists(recipe: Recipe, preferences: EnhancedMealPreferences): Promise<Recipe> {
    const allergiesText = preferences.allergies?.length 
      ? `STRICTLY AVOID: ${preferences.allergies.join(', ')}. Double-check all ingredients.`
      : '';

    const prompt = `
As a creative chef, add flavorful twists to this meal while keeping it GLP-1-friendly and practical:

ORIGINAL MEAL: ${recipe.title}
INGREDIENTS: ${recipe.ingredients.join(', ')}
INSTRUCTIONS: ${recipe.instructions.join(' ')}

${allergiesText}

TASK: Create an appealing variation that:
- Keeps the same nutrition profile (≥20g protein, ≥4g fiber)
- Adds exciting flavors, textures, or presentations
- Stays simple and doable
- Feels like an upgrade, not a complete change

Examples of "flavorful twists":
- Add herb-infused elements
- Include crunchy toppings
- Suggest flavor combinations
- Offer creative plating ideas
- Add aromatic spices or citrus

Give me 1 exciting variation with a new appealing name and enhanced instructions.

Return as JSON with this structure:
{
  "enhancedRecipe": {
    "title": "New appealing name",
    "ingredients": ["ingredient list"],
    "instructions": ["step by step"],
    "chefTips": ["enhancement tips"],
    "satisfactionFactors": ["what makes it more appealing"],
    "glp1Benefits": "why it's great for GLP-1 users"
  }
}
`;

    try {
      const response = await grok.chat.completions.create({
        model: 'grok-2-1212',
        messages: [
          { 
            role: 'system', 
            content: 'You are a creative chef who excels at making simple meals more exciting with practical flavor enhancements.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty enhancement response from Grok');
      }

      const generated = JSON.parse(content);
      const enhanced = generated.enhancedRecipe;

      // Return enhanced recipe
      return {
        ...recipe,
        id: `enhanced_${recipe.id}_${Date.now()}`,
        title: enhanced.title || `Enhanced ${recipe.title}`,
        ingredients: enhanced.ingredients || recipe.ingredients,
        instructions: enhanced.instructions || recipe.instructions,
        glp1Notes: enhanced.glp1Benefits || recipe.glp1Notes,
        tags: [...recipe.tags, 'Enhanced', 'Flavorful Twist'],
        chefTips: enhanced.chefTips || [],
        satisfactionFactors: enhanced.satisfactionFactors || []
      };

    } catch (error) {
      console.error('❌ Error enhancing recipe:', error);
      
      // Return original with simple enhancement
      return {
        ...recipe,
        title: `Enhanced ${recipe.title}`,
        tags: [...recipe.tags, 'Enhanced'],
        chefTips: ['Try adding fresh herbs for extra flavor!']
      };
    }
  }

  /**
   * Adjust a recipe to fix GLP-1 compliance issues
   */
  async adjustRecipe(recipe: Recipe, issues: string[]): Promise<Recipe> {
    const prompt = `
      Adjust this GLP-1 recipe to fix the following issues: ${issues.join(', ')}
      
      Original Recipe:
      ${JSON.stringify(recipe, null, 2)}
      
      Requirements:
      - Must have ≥20g protein for satiety
      - Must have ≥4g fiber for blood sugar control
      - Calories should be 400-600 for portion control
      - Use low glycemic index ingredients
      - Focus on satiety and slow eating
      
      Return the adjusted recipe as JSON with the same structure.
    `;

    try {
      const response = await grok.chat.completions.create({
        model: 'grok-2-1212',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Lower temperature for consistency
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from Grok');
      }

      const adjusted = JSON.parse(content);
      
      return {
        ...recipe,
        ...adjusted,
        id: recipe.id, // Preserve original ID
      };

    } catch (error) {
      console.error('❌ Grok adjustment error:', error);
      throw new Error(`Failed to adjust recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build chef-inspired prompt for appealing GLP-1 recipes
   */
  private buildChefInspiredPrompt(preferences: EnhancedMealPreferences): string {
    const restrictions = preferences.dietaryRestrictions?.length > 0 
      ? preferences.dietaryRestrictions.join(', ') 
      : 'none';
    
    const allergiesText = preferences.allergies?.length 
      ? `STRICTLY AVOID ALL ALLERGENS: ${preferences.allergies.join(', ')}. Double-check every ingredient.`
      : '';
    
    const assemblyRatio = preferences.assemblyToRecipeRatio || 60;
    const symptomEnhancement = preferences.symptomEnhancement || '';
    
    const availableIngredientsText = preferences.availableIngredients?.length 
      ? `PRIORITIZE THESE AVAILABLE INGREDIENTS: ${preferences.availableIngredients.join(', ')}. Focus on using as many of these as possible to reduce food waste and utilize what's already on hand.`
      : '';
    
    const specificMealText = preferences.specificMeal 
      ? `SPECIFIC MEAL REQUEST: Create versions of "${preferences.specificMeal}" that meet all GLP-1 requirements. Focus specifically on this meal type, but make it chef-inspired and appealing.`
      : '';

    return `
As a popular chef specializing in GLP-1-friendly meals, ${preferences.specificMeal ? `create ${preferences.numOptions || 2} delicious versions of "${preferences.specificMeal}"` : `create ${preferences.numOptions || 2} appealing ${preferences.mealType} options`} that make eating enough feel enjoyable and satisfying.

${allergiesText}

${symptomEnhancement}

${availableIngredientsText}

${specificMealText}

CHEF'S MISSION: Transform simple, healthy ingredients into "doable decadence" - meals that feel indulgent yet support GLP-1 goals.

MEAL DISTRIBUTION:
- ${assemblyRatio}% Quick Assemblies: Simple builds with chef-inspired names
- ${100-assemblyRatio}% Structured Recipes: Family-friendly with batch cooking potential

CRITICAL GLP-1 REQUIREMENTS (ALL MEALS MUST MEET):
- Minimum 20g protein per serving (enhanced satiety)
- Minimum 4g fiber per serving (blood sugar control)  
- Calories: 300-600 per serving (accounts for reduced appetite)
- Maximum ${preferences.maxCookingTime || 30} minutes prep/cook time
- LOW glycemic ingredients only
- HIGH SATIETY focus: lean proteins, healthy fats, high-volume vegetables

DIETARY RESTRICTIONS: ${restrictions}

CHEF'S NAMING EXAMPLES (make yours similar):
- "Mediterranean Tuna Crunch Pack" (not "tuna and crackers")
- "Zesty Bean Fiesta Bowl" (not "bean salad")  
- "Garden Fresh Pasta Medley" (not "pasta with vegetables")
- "Savory Chicken Harvest Wrap" (not "chicken wrap")
- "Protein Power Bowl Supreme" (not "yogurt bowl")

SATISFACTION FACTORS TO EMPHASIZE:
- Crunchy textures for satisfying eating
- Fresh herb brightness  
- Creamy richness from avocado/yogurt
- Vibrant colors and visual appeal
- Aromatic spices and seasonings
- Temperature contrasts (warm proteins, cool elements)

QUICK ASSEMBLY FOCUS: 
- Pre-cooked proteins for convenience
- Fresh, crisp vegetables for texture
- Flavor-packed elements (herbs, citrus, spices)
- Beautiful plating suggestions
- Assembly tips for best results

OUTPUT FORMAT (JSON):
{
  "recipes": [
    {
      "title": "Chef-Inspired Appealing Name",
      "chefName": "Alternative appealing name if needed",
      "type": "quick-assembly" or "structured-recipe",
      "appealingClassification": "e.g., Protein-Packed Crunch Pack",
      "servings": 1,
      "cookingTime": 0-30,
      "prepTime": 5-15,
      "difficulty": "easy|moderate",
      "ingredients": [
        "1 can (5 oz) tuna in water",
        "10-12 whole grain crackers", 
        "1/2 medium ripe avocado",
        "2 tablespoons fresh herbs, chopped"
      ],
      "instructions": [
        "Clear step-by-step instructions",
        "Assembly tips for Quick Assemblies",
        "Cooking steps for Structured Recipes"
      ],
      "assemblySteps": ["For quick assemblies only"],
      "chefTips": [
        "What makes this feel gourmet and satisfying",
        "Texture and flavor enhancement suggestions"
      ],
      "satisfactionFactors": [
        "Crunchy texture contrast",
        "Fresh herb brightness",
        "Visual appeal"
      ],
      "glp1Benefits": "Why this is perfect for GLP-1 users",
      "mealPrepFriendly": true/false,
      "estimatedNutrition": {
        "protein": 25,
        "fiber": 8, 
        "calories": 380,
        "carbs": 18,
        "fat": 22
      },
      "tags": ["GLP-1 Friendly", "High Protein", "Quick", "Satisfying"]
    }
  ]
}

Make every meal sound delicious and feel like a special treat while meeting all GLP-1 requirements!
`;
  }

  /**
   * Build the GLP-1 specific prompt for recipe generation
   */
  private buildGLP1Prompt(preferences: MealPreferences): string {
    const restrictions = preferences.dietaryRestrictions.length > 0 
      ? preferences.dietaryRestrictions.join(', ') 
      : 'none';

    return `
      Generate ${preferences.numOptions} unique, delicious ${preferences.mealType} recipes specifically optimized for people taking GLP-1 medications (Ozempic, Wegovy, Mounjaro, etc.).

      CRITICAL GLP-1 REQUIREMENTS (ALL RECIPES MUST MEET THESE):
      - Minimum 20g protein per serving (for enhanced satiety and muscle preservation)
      - Minimum 4g fiber per serving (for blood sugar control and digestive health)
      - Calories: ${preferences.calorieRange?.min || 400}-${preferences.calorieRange?.max || 600} per serving (accounts for reduced appetite)
      - Maximum ${preferences.maxCookingTime} minutes cooking time
      - Use LOW glycemic index ingredients (avoid sugar, white bread, white rice, potatoes)
      - Focus on HIGH SATIETY ingredients: lean proteins, healthy fats, high-volume vegetables
      - Portion sizes should account for reduced appetite on GLP-1 medications

      DIETARY RESTRICTIONS: ${restrictions}

      GLP-1 OPTIMIZATION PRINCIPLES:
      1. Protein First: Start meals with protein to maximize satiety signals
      2. Volume & Fiber: Include high-volume, low-calorie vegetables for fullness
      3. Healthy Fats: Include moderate amounts for hormone production and satiety
      4. Slow Eating: Cooking methods and textures that encourage mindful eating
      5. Blood Sugar Stability: Ingredients that won't cause glucose spikes
      6. Meal Timing: Consider how the recipe fits into GLP-1 injection schedules

      PREFERRED INGREDIENTS:
      - Proteins: Chicken breast, fish, eggs, Greek yogurt, tofu, legumes
      - Vegetables: Leafy greens, broccoli, cauliflower, zucchini, peppers
      - Healthy Fats: Avocado, olive oil, nuts, seeds
      - Whole Grains: Quinoa, steel-cut oats, brown rice (small portions)
      - Flavor Enhancers: Herbs, spices, citrus, vinegar

      AVOID:
      - Added sugars, honey, maple syrup
      - White bread, pasta, rice
      - Processed foods with high sodium
      - High-fat dairy (unless specified)
      - Alcohol

      OUTPUT FORMAT (JSON):
      {
        "recipes": [
          {
            "title": "Recipe Name",
            "servings": 1,
            "cookingTime": 25,
            "difficulty": "easy|moderate|advanced",
            "ingredients": [
              {
                "name": "ingredient name",
                "amount": 150,
                "unit": "g"
              }
            ],
            "instructions": [
              "Step 1: Detailed instruction",
              "Step 2: Next step"
            ],
            "estimatedNutrition": {
              "protein": 28,
              "fiber": 6,
              "calories": 450,
              "carbs": 15,
              "fat": 18
            },
            "glp1Notes": "Specific notes about GLP-1 benefits, eating tips, timing recommendations",
            "tags": ["GLP-1 Friendly", "High Protein", "Low GI"]
          }
        ]
      }

      Make each recipe unique, flavorful, and practical for busy people managing diabetes/weight with GLP-1 medications.
    `;
  }

  /**
   * Parse ingredients from various formats into Ingredient objects
   */
  private parseIngredients(ingredients: (string | { name: string; amount: number; unit: string })[]): Array<{ name: string; amount: number; unit: string }> {
    return ingredients.map((ingredient, index) => {
      // If already an object with name, amount, unit - return as is
      if (typeof ingredient === 'object' && ingredient.name && ingredient.amount && ingredient.unit) {
        return ingredient;
      }

      // If it's a string, try to parse it
      if (typeof ingredient === 'string') {
        const parsed = this.parseIngredientString(ingredient);
        return parsed;
      }

      // Fallback for any other format
      return {
        name: `Ingredient ${index + 1}`,
        amount: 1,
        unit: 'serving'
      };
    });
  }

  /**
   * Parse ingredient strings like "1 cup chicken breast" into structured objects
   */
  private parseIngredientString(ingredientStr: string): { name: string; amount: number; unit: string } {
    // Common patterns for ingredient parsing
    const patterns = [
      // "1 cup chicken breast", "2 tablespoons olive oil"
      /^(\d+(?:\.\d+)?)\s+(\w+(?:\s+\w+)?)\s+(.+)$/,
      // "1/2 cup flour", "3/4 teaspoon salt" 
      /^(\d+\/\d+)\s+(\w+(?:\s+\w+)?)\s+(.+)$/,
      // "2-3 medium apples"
      /^(\d+(?:-\d+)?)\s+(\w+(?:\s+\w+)?)\s+(.+)$/,
      // Just the ingredient name without measurements
      /^(.+)$/
    ];

    for (const pattern of patterns) {
      const match = ingredientStr.trim().match(pattern);
      if (match) {
        if (match.length === 4) {
          // Has amount, unit, and name
          let amount: number;
          const amountStr = match[1];
          
          // Handle fractions
          if (amountStr.includes('/')) {
            const [num, den] = amountStr.split('/').map(Number);
            amount = num / den;
          } else if (amountStr.includes('-')) {
            // Handle ranges like "2-3", use the average
            const [min, max] = amountStr.split('-').map(Number);
            amount = (min + max) / 2;
          } else {
            amount = parseFloat(amountStr);
          }

          return {
            name: match[3].trim(),
            amount: amount,
            unit: match[2].trim()
          };
        } else {
          // Just ingredient name, no measurements
          return {
            name: match[1].trim(),
            amount: 1,
            unit: 'serving'
          };
        }
      }
    }

    // Fallback if no pattern matches
    return {
      name: ingredientStr,
      amount: 1,
      unit: 'serving'
    };
  }

  /**
   * Generate RD-backed symptom tip for GLP-1 users
   */
  async generateSymptomTip({ symptom, severity }: { symptom: string; severity: number }): Promise<string> {
    const prompt = `As a registered dietitian specializing in GLP-1 medication support, provide a gentle, practical tip for a user experiencing ${symptom} at severity ${severity}/10.

Focus on:
- Intuitive eating approaches (not restrictive)
- Nourishment and comfort
- Practical solutions that work with GLP-1 medications
- Emphasis on fiber and protein when appropriate
- Hydration and meal timing

Keep the tip concise (2-3 sentences max) and compassionate. Avoid medical advice - focus on nutritional comfort strategies.

Examples:
- For mild nausea: "Try sipping ginger tea between meals and eating smaller, more frequent portions. Focus on bland, high-protein foods like Greek yogurt or scrambled eggs."
- For constipation: "Aim for warm liquids in the morning and gradually increase fiber-rich foods like berries and cooked vegetables. Stay hydrated with at least 8 glasses of water daily."`;

    try {
      const response = await grok.chat.completions.create({
        model: 'grok-2-1212',
        messages: [
          { 
            role: 'system', 
            content: 'You are a compassionate registered dietitian helping GLP-1 medication users manage symptoms through gentle nutrition strategies.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      const content = response.choices[0].message.content;
      return content || 'Stay hydrated and eat small, frequent meals. Consider keeping a food diary to identify triggers.';

    } catch (error) {
      console.error('Error generating symptom tip:', error);
      return 'Focus on gentle, nourishing foods and stay well-hydrated. Contact your healthcare provider if symptoms persist.';
    }
  }

  /**
   * Generate a single recipe modification (for user requests)
   */
  async modifyRecipe(recipe: Recipe, modification: string): Promise<Recipe> {
    const prompt = `
      Modify this GLP-1 recipe based on user request: "${modification}"
      
      Original Recipe:
      ${JSON.stringify(recipe, null, 2)}
      
      Maintain GLP-1 requirements (≥20g protein, ≥4g fiber, 400-600 calories).
      Return the modified recipe as JSON.
    `;

    try {
      const response = await grok.chat.completions.create({
        model: 'grok-2-1212',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from Grok');
      }

      const modified = JSON.parse(content);
      
      return {
        ...recipe,
        ...modified,
        id: `${recipe.id}_modified_${Date.now()}`,
      };

    } catch (error) {
      console.error('❌ Grok modification error:', error);
      throw new Error(`Failed to modify recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const grokService = new GrokService();