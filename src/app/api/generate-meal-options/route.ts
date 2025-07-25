import { NextRequest, NextResponse } from 'next/server';
import { spoonacularService } from '../../../services/spoonacularService';

export async function POST(request: NextRequest) {
  let mealType = 'lunch'; // Default fallback
  
  try {
    const requestBody = await request.json();
    
    // Extract values from nested preferences object or direct properties
    mealType = requestBody.mealType || 'lunch';
    const preferences = requestBody.preferences || {};
    const dietaryRestrictions = preferences.dietaryRestrictions || requestBody.dietaryRestrictions;
    const cuisineType = preferences.cuisineType || requestBody.cuisineType;
    const proteinSource = preferences.proteinSource || requestBody.proteinSource;
    const avoidIngredients = requestBody.avoidIngredients || [];
    const previousMeals = requestBody.previousMeals || [];

    // Extract enhanced parameters
    const freeTextPrompt = preferences.freeTextPrompt;
    const minProtein = preferences.minProtein;
    const minFiber = preferences.minFiber;
    const maxCalories = preferences.maxCalories;
    const maxReadyTime = preferences.maxReadyTime;
    const surpriseMe = preferences.surpriseMe;
    const cookingMethod = preferences.cookingMethod;
    const equipmentAvailable = preferences.equipmentAvailable;
    const mealPrepOnly = preferences.mealPrepOnly;

    console.log('\n=== GENERATING 2 MEAL OPTIONS WITH SPOONACULAR ===');
    console.log('Request params:', {
      mealType,
      dietaryRestrictions,
      cuisineType,
      proteinSource,
      freeTextPrompt,
      minProtein,
      minFiber,
      maxCalories,
      maxReadyTime,
      surpriseMe,
      cookingMethod,
      equipmentAvailable,
      mealPrepOnly,
      avoidIngredients,
      previousMeals: previousMeals.length
    });

    // Generate multiple meal options using Spoonacular
    const meals = await spoonacularService.generateMultipleMealOptions({
      mealType,
      dietaryRestrictions,
      cuisineType,
      proteinSource,
      avoidIngredients,
      previousMeals,
      freeTextPrompt,
      minProtein,
      minFiber,
      maxCalories,
      maxReadyTime,
      surpriseMe,
      cookingMethod,
      equipmentAvailable,
      mealPrepOnly
    });

    // Validate GLP-1 requirements for each meal
    const validatedMeals = meals.map(meal => {
      const validation = spoonacularService.validateGLP1Requirements(meal);
      
      if (!validation.valid) {
        console.warn(`Meal "${meal.name}" does not meet GLP-1 requirements:`, validation.issues);
        // Add warnings to the meal
        meal.warnings = validation.issues;
      }

      return meal;
    });

    console.log(`Successfully generated ${validatedMeals.length} meal options`);

    return NextResponse.json({ meals: validatedMeals });

  } catch (error) {
    console.error('Error in /api/generate-meal-options:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Check if it's a quota/payment error (402) or API limit error
    if (errorMessage.includes('402') || errorMessage.includes('quota') || errorMessage.includes('payment')) {
      console.log('API quota exceeded, providing fallback meals...');
      
      // Return sample GLP-1 friendly meals as fallback
      const fallbackMeals = spoonacularService.getFallbackMeals(mealType);
      return NextResponse.json({ 
        meals: fallbackMeals,
        notice: 'Using sample recipes due to API limits. Consider upgrading your Spoonacular plan for fresh recipes.',
        fallback: true
      });
    }
    
    // Return specific error information for other errors
    const statusCode = errorMessage.includes('API key') ? 500 : 
                      errorMessage.includes('No recipes') ? 404 : 500;

    return NextResponse.json(
      { 
        error: 'Failed to generate meal options',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}
