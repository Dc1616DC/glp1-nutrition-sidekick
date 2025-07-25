import { NextRequest, NextResponse } from 'next/server';
import { spoonacularService } from '../../../services/spoonacularService';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    
    // Extract values from nested preferences object or direct properties
    const mealType = requestBody.mealType || 'lunch';
    const dietaryRestrictions = requestBody.preferences?.dietaryRestrictions || requestBody.dietaryRestrictions;
    const cuisineType = requestBody.preferences?.cuisineType || requestBody.cuisineType;
    const proteinSource = requestBody.preferences?.proteinSource || requestBody.proteinSource;
    const avoidIngredients = requestBody.avoidIngredients || [];
    const previousMeals = requestBody.previousMeals || [];

    console.log('\n=== GENERATING MEAL WITH SPOONACULAR ===');
    console.log('Request params:', {
      mealType,
      dietaryRestrictions,
      cuisineType,
      proteinSource,
      avoidIngredients,
      previousMeals: previousMeals.length
    });

    // Generate meal using Spoonacular
    const meal = await spoonacularService.generateMealPlan({
      mealType,
      dietaryRestrictions,
      cuisineType,
      proteinSource,
      avoidIngredients,
      previousMeals
    });

    // Validate GLP-1 requirements
    const validation = spoonacularService.validateGLP1Requirements(meal);
    
    if (!validation.valid) {
      console.warn('Generated meal does not meet GLP-1 requirements:', validation.issues);
      
      // Try to regenerate with high-protein preference if not already specified
      if (!proteinSource || proteinSource !== 'high-protein') {
        console.log('Retrying with high-protein preference...');
        try {
          const retryMeal = await spoonacularService.generateMealPlan({
            mealType,
            dietaryRestrictions,
            cuisineType,
            proteinSource: 'high-protein',
            avoidIngredients,
            previousMeals
          });
          
          const retryValidation = spoonacularService.validateGLP1Requirements(retryMeal);
          if (retryValidation.valid) {
            console.log('Retry successful!');
            return NextResponse.json(retryMeal);
          }
        } catch (retryError) {
          console.warn('Retry failed:', retryError);
        }
      }
      
      // Return the meal anyway but with warnings
      console.log('Returning meal with validation warnings');
      return NextResponse.json({
        ...meal,
        warnings: validation.issues
      });
    }

    console.log('✅ Generated valid GLP-1 meal:', {
      name: meal.name,
      protein: meal.nutrition.protein,
      fiber: meal.nutrition.fiber,
      calories: meal.nutrition.calories
    });

    return NextResponse.json(meal);

  } catch (error) {
    console.error('Error generating meal with Spoonacular:', error);
    
    return NextResponse.json({
      error: 'Failed to generate meal',
      message: error instanceof Error ? error.message : 'Service temporarily unavailable',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
