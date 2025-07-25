import { NextRequest, NextResponse } from 'next/server';
import { spoonacularService } from '../../../services/spoonacularService';

export async function GET(request: NextRequest) {
  try {
    console.log('\n=== TESTING SPOONACULAR INTEGRATION ===');
    
    const url = new URL(request.url);
    const debug = url.searchParams.get('debug') === 'true';
    
    // Test basic connectivity
    const testMeal = await spoonacularService.generateMealPlan({
      mealType: 'lunch',
      proteinSource: 'high-protein'
    });

    // Validate the result
    const validation = spoonacularService.validateGLP1Requirements(testMeal);

    const response: any = {
      success: true,
      meal: {
        name: testMeal.name,
        nutrition: testMeal.nutrition,
        cookingTime: testMeal.cookingTime,
        ingredientCount: testMeal.ingredients.length,
        instructionCount: testMeal.instructions.length
      },
      validation,
      message: 'Spoonacular integration working!'
    };

    if (debug) {
      response.meal = {
        ...response.meal,
        ingredients: testMeal.ingredients,
        instructions: testMeal.instructions,
        fullMeal: testMeal
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Spoonacular test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Check your SPOONACULAR_API_KEY in .env.local'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const params = await request.json();
    
    console.log('\n=== TESTING SPOONACULAR WITH CUSTOM PARAMS ===');
    console.log('Params:', params);
    
    const meal = await spoonacularService.generateMealPlan(params);
    const validation = spoonacularService.validateGLP1Requirements(meal);

    return NextResponse.json({
      success: true,
      meal,
      validation,
      message: 'Custom meal generated successfully!'
    });

  } catch (error) {
    console.error('Custom Spoonacular test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
