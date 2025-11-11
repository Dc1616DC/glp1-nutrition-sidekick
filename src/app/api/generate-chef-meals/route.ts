import { NextRequest, NextResponse } from 'next/server';
import { GrokService } from '../../../services/grokService';
import { subscriptionService } from '../../../services/subscriptionService';
import { verifyIdToken, isAdminInitialized } from '../../../lib/firebase-admin';

const grokService = new GrokService();

/**
 * Verify user authentication
 */
async function verifyUser(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];

  if (isAdminInitialized()) {
    try {
      const decodedToken = await verifyIdToken(token);
      return decodedToken.uid;
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      return null;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyUser(request);

    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
        message: 'Please sign in to access AI meal generation.',
        upgradeUrl: '/pricing',
        feature: 'ai_meal_generation'
      }, { status: 401 });
    }

    // Check usage limits (enforces 5 free meals/month for free users)
    const usageStats = await subscriptionService.getUsageStats(userId);

    if (!usageStats.canGenerate) {
      return NextResponse.json({
        error: 'Meal generation limit reached',
        message: `You've used all ${usageStats.mealGenerationsLimit} free meal generations this month. Upgrade to Premium for unlimited AI meal generation.`,
        upgradeUrl: '/pricing',
        feature: 'ai_meal_generation',
        usageStats: {
          used: usageStats.mealGenerationsUsed,
          limit: usageStats.mealGenerationsLimit,
          resetDate: usageStats.resetDate,
          daysUntilReset: usageStats.daysUntilReset
        }
      }, { status: 403 });
    }

    const requestBody = await request.json();

    console.log('\n=== GENERATING CHEF-INSPIRED MEALS WITH GROK ===');
    console.log('Request params:', {
      mealType: requestBody.mealType,
      allergies: requestBody.preferences?.allergies || [],
      creativityLevel: requestBody.preferences?.creativityLevel || 'simple',
      assemblyToRecipeRatio: requestBody.preferences?.assemblyToRecipeRatio || 60
    });

    // Enhanced preferences with chef-inspired features
    const enhancedPreferences = {
      mealType: requestBody.mealType || 'lunch',
      dietaryRestrictions: requestBody.preferences?.dietaryRestrictions || [],
      allergies: requestBody.preferences?.allergies || [], // New allergies filter
      numOptions: 2,
      maxCookingTime: requestBody.preferences?.maxCookingTime || 30,
      proteinTarget: 20,
      fiberTarget: 4,
      calorieRange: { min: 300, max: 600 },
      creativityLevel: requestBody.preferences?.creativityLevel || 'simple',
      assemblyToRecipeRatio: requestBody.preferences?.assemblyToRecipeRatio || 60 // 60% assemblies, 40% recipes
    };

    // Generate chef-inspired meals
    const meals = await grokService.generateGLP1Recipes(enhancedPreferences);

    // Increment usage counter AFTER successful generation
    const usageResult = await subscriptionService.useMealGeneration(userId);

    console.log(`✅ Generated ${meals.length} chef-inspired meals`);

    // Return meals with appealing presentation
    return NextResponse.json({
      meals: meals.map(meal => ({
        id: meal.id,
        name: meal.title,
        description: `${meal.appealingClassification || 'Delicious Creation'} - ${meal.glp1Notes}`,
        type: meal.tags?.includes('quick-assembly') ? 'Quick Assembly' : 'Structured Recipe',
        cookingTime: meal.cookingTime,
        prepTime: 5, // Estimated prep time
        servings: meal.servings,
        nutrition: {
          protein: meal.nutritionTotals.protein,
          fiber: meal.nutritionTotals.fiber,
          calories: meal.nutritionTotals.calories,
          carbs: meal.nutritionTotals.carbs,
          fat: meal.nutritionTotals.fat
        },
        ingredients: meal.ingredients.map(ing =>
          typeof ing === 'string' ? ing : `${ing.amount} ${ing.unit} ${ing.name}`.trim()
        ),
        instructions: meal.instructions,
        chef_tips: meal.chefTips || [],
        satisfaction_factors: meal.satisfactionFactors || [],
        assembly_tips: meal.assemblyTips || [],
        mealStyle: [
          ...(meal.tags || []),
          meal.appealingClassification || 'Chef-Inspired'
        ],
        glp1Friendly: {
          eatingTips: meal.glp1Notes
        },
        mealPrep: {
          friendly: meal.mealPrepFriendly || false
        },
        nutritionSource: 'Grok AI Chef-Inspired'
      })),
      usageStats: {
        used: usageResult.usageStats.mealGenerationsUsed,
        remaining: usageResult.usageStats.mealGenerationsRemaining,
        limit: usageResult.usageStats.mealGenerationsLimit,
        resetDate: usageResult.usageStats.resetDate
      }
    });

  } catch (error) {
    console.error('Error generating chef-inspired meals:', error);

    // Fallback to appealing mock meal
    const fallbackMeal = {
      id: `chef_fallback_${Date.now()}`,
      name: "Mediterranean Protein Power Bowl",
      description: "Energizing Power Bowl - A nourishing combination that makes eating enough feel effortless and satisfying",
      type: "Quick Assembly",
      cookingTime: 0,
      prepTime: 5,
      servings: 1,
      nutrition: {
        protein: 22,
        fiber: 6,
        calories: 420,
        carbs: 25,
        fat: 18
      },
      ingredients: [
        "1 cup plain Greek yogurt",
        "2 tablespoons mixed nuts, chopped",
        "1/2 cup mixed berries",
        "2 tablespoons granola",
        "1 tablespoon honey drizzle",
        "Fresh mint leaves for garnish"
      ],
      instructions: [
        "Layer Greek yogurt in an appealing bowl",
        "Arrange berries artfully on top",
        "Sprinkle chopped nuts for satisfying crunch",
        "Add granola for texture contrast",
        "Drizzle lightly with honey",
        "Garnish with fresh mint leaves"
      ],
      chef_tips: [
        "The variety of textures keeps every bite interesting",
        "Perfect protein-to-fiber ratio for GLP-1 goals",
        "Beautiful presentation makes it feel special"
      ],
      satisfaction_factors: [
        "Creamy yogurt base",
        "Crunchy nuts and granola",
        "Sweet berry bursts",
        "Fresh mint aroma"
      ],
      mealStyle: ["GLP-1 Friendly", "High Protein", "Quick Assembly", "Chef-Inspired"],
      glp1Friendly: {
        eatingTips: "High protein supports satiety and blood sugar stability. The variety of textures encourages slow, mindful eating."
      },
      mealPrep: {
        friendly: true
      },
      nutritionSource: "Chef-Inspired Fallback"
    };

    return NextResponse.json({
      meals: [fallbackMeal],
      warning: "Using fallback chef-inspired meal due to service temporarily unavailable"
    });
  }
}

// Enhanced meal endpoint for "Add Flavorful Twists"
// NOTE: This does NOT count as a meal generation - it's an enhancement of an already generated meal
export async function PATCH(request: NextRequest) {
  try {
    // Verify user authentication (but don't check limits for enhancements)
    const userId = await verifyUser(request);

    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
        message: 'Please sign in to enhance meals.'
      }, { status: 401 });
    }

    const requestBody = await request.json();
    const { mealId, originalMeal, preferences } = requestBody;

    console.log('\n=== ENHANCING MEAL WITH FLAVORFUL TWISTS ===');
    console.log('Enhancing meal:', originalMeal?.name);

    // Convert request format to Recipe format for enhancement
    const recipeToEnhance = {
      id: mealId,
      title: originalMeal.name,
      ingredients: originalMeal.ingredients?.map((ing: string) => ({
        name: ing,
        amount: 1,
        unit: 'serving'
      })) || [],
      instructions: originalMeal.instructions || [],
      nutritionTotals: originalMeal.nutrition || {
        protein: 20,
        fiber: 4,
        calories: 400,
        carbs: 20,
        fat: 15
      },
      glp1Notes: originalMeal.glp1Friendly?.eatingTips || 'GLP-1 optimized',
      cookingTime: originalMeal.cookingTime || 10,
      servings: originalMeal.servings || 1,
      mealType: preferences?.mealType || 'lunch',
      difficulty: 'easy' as const,
      tags: originalMeal.mealStyle || ['GLP-1 Friendly']
    };

    const enhancedPreferences = {
      ...preferences,
      allergies: preferences?.allergies || []
    };

    // Enhance with flavorful twists
    const enhancedMeal = await grokService.enhanceWithFlavorfulTwists(
      recipeToEnhance,
      enhancedPreferences
    );

    console.log('✅ Enhanced meal with flavorful twists');

    // Return enhanced meal in expected format
    return NextResponse.json({
      meal: {
        id: enhancedMeal.id,
        name: enhancedMeal.title,
        description: `Enhanced with flavorful twists - ${enhancedMeal.glp1Notes}`,
        type: "Enhanced Creation",
        cookingTime: enhancedMeal.cookingTime,
        prepTime: 5,
        servings: enhancedMeal.servings,
        nutrition: enhancedMeal.nutritionTotals,
        ingredients: enhancedMeal.ingredients.map(ing =>
          typeof ing === 'string' ? ing : `${ing.amount} ${ing.unit} ${ing.name}`.trim()
        ),
        instructions: enhancedMeal.instructions,
        chef_tips: enhancedMeal.chefTips || [],
        satisfaction_factors: enhancedMeal.satisfactionFactors || [],
        mealStyle: enhancedMeal.tags,
        glp1Friendly: {
          eatingTips: enhancedMeal.glp1Notes
        },
        nutritionSource: 'Grok AI Enhanced'
      }
    });

  } catch (error) {
    console.error('Error enhancing meal:', error);

    return NextResponse.json({
      error: 'Failed to enhance meal',
      message: error instanceof Error ? error.message : 'Enhancement service temporarily unavailable'
    }, { status: 500 });
  }
}
