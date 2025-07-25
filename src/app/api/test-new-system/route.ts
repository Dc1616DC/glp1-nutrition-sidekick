import { NextRequest, NextResponse } from 'next/server';
import { nutritionValidationService } from '../../../services/nutritionValidationNew';
import { Recipe } from '../../../types/recipe';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing new GLP-1 meal generation system...');

    // Test recipe for validation
    const testRecipe: Recipe = {
      id: 'test_001',
      title: 'High-Protein Chicken & Broccoli Bowl',
      ingredients: [
        { name: 'chicken breast', amount: 150, unit: 'g' },
        { name: 'broccoli', amount: 200, unit: 'g' },
        { name: 'quinoa', amount: 60, unit: 'g' },
        { name: 'olive oil', amount: 10, unit: 'ml' }
      ],
      instructions: [
        'Season and grill chicken breast for 6-8 minutes per side',
        'Steam broccoli until tender, about 5 minutes',
        'Cook quinoa according to package directions',
        'Combine in bowl, drizzle with olive oil'
      ],
      nutritionTotals: {
        protein: 35,
        fiber: 8,
        calories: 420,
        carbs: 25,
        fat: 12
      },
      glp1Notes: 'High protein for satiety, high fiber for blood sugar control',
      cookingTime: 25,
      servings: 1,
      mealType: 'lunch',
      difficulty: 'easy',
      tags: ['GLP-1 Friendly', 'High Protein', 'High Fiber']
    };

    // Test validation
    const validation = nutritionValidationService.validateGLP1Recipe(testRecipe);
    const disclaimer = nutritionValidationService.generateNutritionDisclaimer(validation);

    // Test corruption detection
    const corruptedIngredient = { name: '2Fry onion in oil till golden', amount: 1, unit: 'step' };
    const isCorrupt = !nutritionValidationService.validateIngredient(corruptedIngredient);

    // Test GI estimation
    const testIngredients = [
      { name: 'chicken breast', amount: 100, unit: 'g' },
      { name: 'white rice', amount: 50, unit: 'g' }
    ];
    const giScore = nutritionValidationService.estimateGIScore(testIngredients);

    const results = {
      success: true,
      tests: {
        validation: {
          passed: validation.valid,
          score: validation.score,
          issues: validation.issues,
          disclaimer
        },
        corruptionDetection: {
          passed: isCorrupt,
          message: isCorrupt ? 'Successfully detected corrupted ingredient' : 'Failed to detect corruption'
        },
        glycemicIndex: {
          score: giScore,
          interpretation: giScore < 55 ? 'Low GI (Good)' : giScore < 70 ? 'Medium GI' : 'High GI (Avoid)'
        }
      },
      environment: {
        hasGrokKey: !!process.env.GROK_API_KEY && process.env.GROK_API_KEY !== 'your_grok_api_key_here',
        hasUSDAKey: !!process.env.USDA_API_KEY && process.env.USDA_API_KEY !== 'your_usda_api_key_here',
        hasOpenAIKey: !!process.env.OPENAI_API_KEY
      }
    };

    console.log('✅ System test completed:', results);
    
    return NextResponse.json(results);

  } catch (error) {
    console.error('❌ System test failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'System test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}