import { NextRequest, NextResponse } from 'next/server';
import { GrokService } from '../../../services/grokService';

const grokService = new GrokService();

/**
 * TEMPORARY BYPASS ENDPOINT - REMOVE AFTER FIREBASE IS FIXED
 * This allows the meal generator to work without authentication
 * while we debug the Firebase Admin SDK issues
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // TEMPORARY: Skip authentication for now
    console.warn('⚠️ Using bypass endpoint - authentication skipped');
    
    const body = await request.json();
    
    // Extract values from request
    const mealType = body.mealType || 'lunch';
    const preferences = body.preferences || {};
    const dietaryRestrictions = preferences.dietaryRestrictions || body.dietaryRestrictions || [];
    const avoidIngredients = body.avoidIngredients || body.allergies || [];

    console.log('Generating meals with bypass endpoint:', {
      mealType,
      dietaryRestrictions,
      avoidIngredients: avoidIngredients.length
    });
    
    // Build meal generation parameters
    const mealParams = {
      mealType: body.mealType,
      dietaryRestrictions: body.dietaryRestrictions,
      allergies: body.allergies,
      numOptions: body.numOptions || 2,
      maxCookingTime: body.maxCookingTime,
      proteinTarget: body.proteinTarget,
      fiberTarget: body.fiberTarget,
      calorieRange: body.calorieRange,
      creativityLevel: body.creativityLevel,
      assemblyToRecipeRatio: body.assemblyToRecipeRatio,
      avoidIngredients: body.allergies || [],
      previousMeals: []
    };
    
    // Generate meals using Grok AI service
    const meals = await grokService.generateGLP1Recipes({
      mealType: mealParams.mealType || 'lunch',
      dietaryRestrictions: mealParams.dietaryRestrictions || [],
      allergies: mealParams.allergies || [],
      numOptions: mealParams.numOptions || 2,
      maxCookingTime: mealParams.maxCookingTime || 30,
      proteinTarget: mealParams.proteinTarget || 20,
      fiberTarget: mealParams.fiberTarget || 4,
      calorieRange: mealParams.calorieRange || { min: 400, max: 600 },
      creativityLevel: mealParams.creativityLevel || 'flavorful-twists',
      assemblyToRecipeRatio: mealParams.assemblyToRecipeRatio || 0.6
    });
    
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      meals: meals,
      generationMethod: 'grok',
      bypassUsed: true, // Flag to indicate bypass was used
      cacheStatus: 'fresh',
      duration,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Bypass endpoint failure after ${duration}ms:`, error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate meal options',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}