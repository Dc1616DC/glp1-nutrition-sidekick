import { NextRequest, NextResponse } from 'next/server';
import { nutritionService } from '../../../services/nutritionService';

export async function GET() {
  try {
    console.log('\n=== TESTING FULL WORKFLOW STEP BY STEP ===');
    
    const ingredient = '1 cup chicken breast';
    
    // Step 1: Parse ingredient
    const parsed = nutritionService.parseIngredient(ingredient);
    console.log('Step 1 - Parsed ingredient:', parsed);
    
    // Step 2: Search food
    const food = await nutritionService.searchFood(parsed.name);
    console.log('Step 2 - Search result:', food);
    
    if (!food) {
      return NextResponse.json({
        success: false,
        message: 'Search returned null',
        step: 2
      });
    }
    
    // Step 3: Get nutrition
    let nutrition;
    let nutritionError = null;
    try {
      nutrition = await nutritionService.getFoodNutrition(food.fdcId);
      console.log('Step 3 - Nutrition result:', nutrition);
    } catch (error) {
      nutritionError = error;
      console.log('Step 3 - Nutrition error:', error);
    }
    
    if (!nutrition) {
      return NextResponse.json({
        success: false,
        message: `No nutrition data for FDC ID ${food.fdcId}`,
        step: 3,
        fdcId: food.fdcId,
        nutritionError: nutritionError instanceof Error ? nutritionError.message : nutritionError
      });
    }
    
    // Step 4: Calculate scaling
    const gramsQuantity = nutritionService.convertToGrams(parsed.quantity, parsed.unit);
    const scale = gramsQuantity / 100;
    
    console.log('Step 4 - Scaling:', { gramsQuantity, scale });
    
    // Step 5: Scale nutrition
    const scaledNutrition = {
      protein: nutrition.protein * scale,
      calories: nutrition.calories * scale,
      fat: nutrition.fat * scale,
      carbs: nutrition.carbs * scale,
      fiber: nutrition.fiber * scale
    };
    
    console.log('Step 5 - Scaled nutrition:', scaledNutrition);
    
    return NextResponse.json({
      success: true,
      steps: {
        parsed,
        food,
        nutrition,
        gramsQuantity,
        scale,
        scaledNutrition
      },
      analysis: {
        isRealUSDA: food.fdcId < 999000 || food.fdcId >= 1000000, // Real USDA data is outside fallback range
        dataType: food.dataType,
        fdcId: food.fdcId
      }
    });
    
  } catch (error) {
    console.error('Step-by-step test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
