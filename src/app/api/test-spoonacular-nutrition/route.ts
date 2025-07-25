import { NextRequest, NextResponse } from 'next/server';
import { spoonacularNutritionService } from '../../../services/spoonacularNutritionService';

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();
    
    console.log('🧪 Testing Spoonacular nutrition service with:', ingredients);
    
    // Test the ingredients that were causing problems before
    const testIngredients = ingredients || [
      { name: 'cooked shrimp', amount: 6, unit: 'oz' },
      { name: 'cooked quinoa', amount: 0.5, unit: 'cup' },
      { name: 'black beans', amount: 0.5, unit: 'cup' },
      { name: 'avocado', amount: 0.25, unit: 'medium' }
    ];
    
    const startTime = Date.now();
    
    // Get nutrition data using our new service
    const nutritionData = await spoonacularNutritionService.getNutritionForIngredients(testIngredients);
    
    // Calculate totals
    const totals = spoonacularNutritionService.calculateTotalNutrition(nutritionData);
    
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      testIngredients,
      individualNutrition: nutritionData,
      totals,
      duration: `${duration}ms`,
      summary: {
        protein: `${totals.protein.toFixed(1)}g`,
        fiber: `${totals.fiber.toFixed(1)}g`,
        calories: Math.round(totals.calories),
        source: totals.source
      }
    });
    
  } catch (error) {
    console.error('❌ Spoonacular nutrition test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to test Spoonacular nutrition service'
    }, { status: 500 });
  }
}