import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { nutritionService } from '../../../services/nutritionService';

// Lazy-load OpenAI client to avoid build-time instantiation
let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openai;
}

export async function POST(request: NextRequest) {
  try {
    const { preferences, previousMeals = [] } = await request.json();
    
    // Create a detailed prompt for OpenAI
    const prompt = createMealPrompt(preferences, previousMeals);

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a creative nutrition expert specializing in high-protein, high-fiber meals for people using GLP-1 medications. You must STRICTLY follow time constraints - if user wants 5 minutes, the TOTAL time (prep + cook) must be 5 minutes or less with no exceptions. Focus on variety, creativity, and practical kitchen reality. Always ensure meals have at least 20g protein and 4g fiber. Return ONLY valid JSON, no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 1.0, // Maximum creativity for variety
      max_tokens: 1500,
    });

    const mealText = completion.choices[0].message.content;
    
    if (!mealText) {
      throw new Error('No meal generated');
    }

    // Parse the JSON response from OpenAI
    const meal = JSON.parse(mealText);
    
    // Add some post-processing to ensure consistency and calculate accurate nutrition
    const processedMeal = await processMeal(meal, preferences);
    
    return NextResponse.json(processedMeal);

  } catch (error) {
    console.error('Error generating meal:', error);
    
    // Get preferences for fallback
    const { preferences } = await request.json().catch(() => ({ preferences: {} }));
    
    // Fallback to a simple meal if OpenAI fails
    const fallbackMeal = createFallbackMeal(preferences);
    return NextResponse.json(fallbackMeal);
  }
}

function createMealPrompt(preferences: any, previousMeals: string[] = []): string {
  // Create ultra-specific time constraints based on reality
  const getTimeConstraints = (timeChoice: string, mealType: string) => {
    if (timeChoice === '5min') {
      if (mealType === 'snack') {
        return `5 minutes MAXIMUM - NO COOKING ALLOWED. Assembly only with pre-prepared ingredients. Examples: 
        - Greek yogurt with nuts and berries
        - Cottage cheese with pre-cut vegetables  
        - Hard-boiled egg (pre-made) with hummus
        - Protein smoothie (just blending pre-measured ingredients)
        - Cheese with pre-sliced vegetables
        STRICT FORBIDS: Any cooking, chopping, meal prep, heating, or knife work`;
      } else {
        return `5 minutes MAXIMUM - Only assembly or 1-minute microwave heating. Examples:
        - Microwaved egg scramble with pre-shredded cheese (2 min total)
        - Canned tuna mixed with pre-made ingredients
        - Protein wrap with pre-cooked chicken strips
        - Instant oatmeal with protein powder (3 min total)
        STRICT FORBIDS: Stir-frying, sautéing, chopping vegetables, cooking raw proteins, preheating ovens`;
      }
    } else if (timeChoice === '15min') {
      return `15 minutes MAXIMUM total time (prep + cook). Light cooking allowed:
      - Simple pan cooking (scrambled eggs, pre-cooked proteins) - max 5 min cook time
      - Quick microwave steaming of frozen vegetables - max 3 min
      - Minimal chopping of pre-washed, easy-cut ingredients - max 2 min
      - Simple assembly with 1-2 cooking steps
      AVOID: Raw meat cooking, extensive prep work, multiple pans, complex seasoning`;
    } else if (timeChoice === '30min') {
      return `30 minutes MAXIMUM - Normal cooking allowed but keep it efficient:
      - One-pot or sheet-pan methods preferred
      - Up to 20 minutes active cooking time
      - Simple preparation techniques
      - Reasonable ingredient prep (chopping, measuring)`;
    } else if (timeChoice === 'batch') {
      return `Batch cooking - 45-60 minutes total, makes 4-6 servings:
      - Designed for meal prep and storage
      - Sheet-pan, slow cooker, or large pot methods
      - Portions freeze/refrigerate well
      - Efficient prep techniques for larger quantities`;
    } else {
      return `Any cooking time acceptable - focus on flavor and nutrition`;
    }
  };

  const timeConstraint = getTimeConstraints(preferences.cookingTime, preferences.mealType);

  const styleMapping: Record<string, string> = {
    'one-pot': 'one-pot meal (everything cooked in single vessel)',
    'sheet-pan': 'sheet pan meal (roasted together on one pan)',
    'meal-prep': 'meal prep friendly (stores well, easy to portion)',
    'quick': 'quick and easy (minimal steps, common ingredients)',
    'any': 'any cooking style'
  };

  // Enhanced variety system - track more than just meal names
  const getMealVarietyContext = (previousMeals: string[]) => {
    if (previousMeals.length === 0) return '';
    
    const recentMeals = previousMeals.slice(-5);
    
    // Generate diversity directives based on recent meals
    const diversityPrompts = [
      'Incorporate unique flavor combinations not seen in recent meals',
      'Use a completely different cooking method from previous suggestions',
      'Draw inspiration from fusion cuisines or unconventional ingredient pairings',
      'Focus on seasonal or less common ingredients if possible',
      'Avoid repeating the same protein preparation style',
      'Vary the vegetable choices and cooking techniques significantly'
    ];
    
    const randomDiversityPrompt = diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)];
    
    return `\n\nVARIETY REQUIREMENTS:
${randomDiversityPrompt}

AVOID REPETITION - Do NOT create anything similar to these recent meals:
${recentMeals.map((meal, i) => `${i + 1}. ${meal}`).join('\n')}

Create something with distinctly different:
- Primary ingredients or protein preparation
- Cooking method or flavor profile  
- Cultural cuisine influence
- Texture and presentation style\n`;
  };

  const previousMealsContext = getMealVarietyContext(previousMeals);

  // Enhanced cuisine diversity
  const getCuisineGuidance = (preferredCuisine: string) => {
    if (preferredCuisine === 'any') {
      const cuisines = [
        'Mediterranean with herbs and olive oil',
        'Asian-inspired with ginger and soy flavors', 
        'Mexican with cumin and lime',
        'Italian with garlic and tomatoes',
        'Middle Eastern with tahini and spices',
        'Indian with warming spices',
        'Thai with fresh herbs and citrus',
        'Greek with feta and olives'
      ];
      const randomCuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
      return `Draw inspiration from ${randomCuisine}`;
    }
    return `${preferredCuisine} cuisine style`;
  };

  const cuisineGuidance = getCuisineGuidance(preferences.preferredCuisine);

  return `Generate a unique ${preferences.mealType} recipe with these requirements:

CRITICAL TIME REQUIREMENTS:
${timeConstraint}

NUTRITION REQUIREMENTS (STRICT):
- MINIMUM 20g protein per serving (this is non-negotiable)
- MINIMUM 4g fiber per serving (must include high-fiber ingredients)
- Include vegetables (except for snacks where optional)
- Balanced macronutrients appropriate for GLP-1 medication users
- Prioritize satiety and stable blood sugar

STYLE & PREFERENCES:
- Cooking style: ${styleMapping[preferences.mealStyle] || 'any style'}
- Primary protein: ${preferences.proteinSource === 'any' ? 'any high-quality protein source' : preferences.proteinSource}
- Dietary needs: ${preferences.dietaryRestriction === 'none' ? 'no restrictions' : preferences.dietaryRestriction}
- Cuisine inspiration: ${cuisineGuidance}${previousMealsContext}

INGREDIENT FORMATTING REQUIREMENTS:
- Use precise measurements with units (e.g., "200g chicken breast", "1 cup spinach", "2 tbsp olive oil")
- Include quantities that are realistic for single servings unless meal-prep style
- Specify preparation in ingredient list when relevant (e.g., "chopped", "diced", "pre-cooked")

INSTRUCTION QUALITY:
- Provide clear, step-by-step instructions
- Include realistic timing for each step
- Mention any prep that can be done ahead
- Keep instructions practical for busy people
- Include food safety notes if relevant (internal temperatures, etc.)

Return ONLY this JSON structure (no additional text):
{
  "name": "Creative and appetizing meal name",
  "description": "Brief, appealing description highlighting key flavors and benefits", 
  "cookingTime": number_in_minutes_realistic,
  "prepTime": number_in_minutes_realistic,
  "servings": number,
  "nutrition": {
    "protein": number_minimum_20,
    "fiber": number_minimum_4,
    "calories": realistic_number,
    "carbs": number,
    "fat": number
  },
  "ingredients": ["Precise measurements with units - e.g. '200g chicken breast, diced'"],
  "instructions": ["Clear step-by-step instructions with realistic timing"],
  "tips": ["3-4 helpful cooking, storage, or eating tips specific to this meal"],
  "mealStyle": ["Relevant descriptive tags"]
}

Create something delicious, nutritious, and perfectly suited for someone managing their health with GLP-1 medication.`;
}

async function processMeal(meal: any, preferences: any): Promise<any> {
  // Validate time accuracy
  const isTimeRealistic = validateTimeAccuracy(meal, preferences.cookingTime);
  
  if (!isTimeRealistic) {
    console.warn('Generated meal exceeds realistic time constraints');
    // Could trigger regeneration here, but for now just log
  }

  // Calculate accurate nutrition using USDA API
  let accurateNutrition = null;
  let nutritionSource = 'AI-estimated';
  
  try {
    console.log('Calculating USDA nutrition for ingredients:', meal.ingredients);
    const usdaResult = await nutritionService.calculateRecipeNutrition(meal.ingredients);
    
    if (usdaResult.calculatedIngredients > 0) {
      accurateNutrition = {
        protein: usdaResult.protein,
        fiber: usdaResult.fiber,
        calories: usdaResult.calories,
        carbs: usdaResult.carbs,
        fat: usdaResult.fat
      };
      
      nutritionSource = usdaResult.dataSource;
      
      if (usdaResult.failedIngredients.length > 0) {
        console.warn('Failed to calculate nutrition for:', usdaResult.failedIngredients);
      }
      
      // Validate against GLP-1 requirements
      const validation = nutritionService.validateNutritionRequirements(accurateNutrition);
      if (!validation.valid) {
        console.warn('Nutrition validation failed:', validation.issues);
        // In production, you might want to regenerate the meal here
      }
    }
  } catch (error) {
    console.error('Error calculating USDA nutrition:', error);
    // Fallback to AI nutrition
  }

  // Ensure required fields and add GLP-1 specific content
  return {
    id: Date.now().toString(),
    ...meal,
    nutrition: accurateNutrition || meal.nutrition, // Use USDA data if available, fallback to AI
    nutritionSource, // Add source information for transparency
    glp1Friendly: {
      eatingTips: "Chew thoroughly and eat slowly - GLP-1 medications help you feel full faster, so take your time to enjoy each bite"
    },
    // Ensure tags include our requirements
    mealStyle: [
      ...meal.mealStyle,
      'High Protein',
      'High Fiber', 
      'GLP-1 Friendly'
    ].filter((tag, index, array) => array.indexOf(tag) === index) // Remove duplicates
  };
}

function validateTimeAccuracy(meal: any, timeConstraint: string): boolean {
  const totalTime = (meal.prepTime || 0) + (meal.cookingTime || 0);
  
  // Define realistic time limits
  const timeLimits: Record<string, number> = {
    '5min': 5,
    '15min': 15,
    '30min': 30
  };
  
  const maxTime = timeLimits[timeConstraint];
  if (!maxTime) return true; // No constraint
  
  // Check if total time exceeds limit
  if (totalTime > maxTime) {
    return false;
  }
  
  // Additional validation for 5-minute constraint
  if (timeConstraint === '5min') {
    const hasComplexTasks = meal.instructions?.some((instruction: string) => 
      instruction.toLowerCase().includes('chop') ||
      instruction.toLowerCase().includes('dice') ||
      instruction.toLowerCase().includes('sauté') ||
      instruction.toLowerCase().includes('stir-fry') ||
      instruction.toLowerCase().includes('cook until golden') ||
      instruction.toLowerCase().includes('brown the')
    );
    
    if (hasComplexTasks) {
      return false;
    }
  }
  
  return true;
}

function createFallbackMeal(preferences: any): any {
  // Simple fallback meal if OpenAI fails
  return {
    id: Date.now().toString(),
    name: "High-Protein Power Bowl",
    description: "A nutritious bowl packed with protein and fiber",
    cookingTime: 20,
    prepTime: 10,
    servings: 1,
    nutrition: {
      protein: 25,
      fiber: 8,
      calories: 400,
      carbs: 30,
      fat: 12
    },
    ingredients: [
      "6 oz lean protein source",
      "2 cups mixed vegetables",
      "1/2 cup quinoa",
      "1 tbsp olive oil",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Cook quinoa according to package directions",
      "Season and cook protein in a pan with olive oil",
      "Steam or sauté vegetables until tender",
      "Combine all ingredients in a bowl",
      "Season to taste and serve"
    ],
    tips: [
      "This meal can be prepped ahead of time",
      "Substitute any vegetables you prefer",
      "Add herbs or spices for extra flavor"
    ],
    mealStyle: ["High Protein", "High Fiber", "GLP-1 Friendly", "Quick"],
    glp1Friendly: {
      eatingTips: "Chew thoroughly and eat slowly - this helps with satiety and digestion"
    }
  };
}
