import { NextRequest, NextResponse } from 'next/server';
import { nutritionService } from '../../../services/nutritionService';

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();
    
    console.log('Testing USDA nutrition calculation for:', ingredients);
    
    const result = await nutritionService.calculateRecipeNutrition(ingredients);
    
    return NextResponse.json({
      success: true,
      result,
      message: `Successfully calculated nutrition for ${result.calculatedIngredients}/${ingredients.length} ingredients`
    });
    
  } catch (error) {
    console.error('Error testing USDA nutrition:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
