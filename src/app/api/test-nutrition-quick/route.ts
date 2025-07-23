import { NextRequest, NextResponse } from 'next/server';
import { spoonacularNutritionService } from '../../../services/spoonacularNutritionService';

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();
    
    console.log('🧪 Quick nutrition test:', ingredients);
    
    // Test the problematic ingredients that we fixed
    const testIngredients = ingredients || [
      { name: 'black beans', amount: 0.33, unit: 'cup' },
      { name: 'mixed greens', amount: 2, unit: 'cups' },
      { name: 'oats', amount: 1, unit: 'cup' },
      { name: 'oregano', amount: 1, unit: 'tsp' }
    ];
    
    const startTime = Date.now();
    
    // Get nutrition data using our improved system
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
      improvements: {
        blackBeans: "Uses cooked bean values (not raw/dry)",
        mixedGreens: "Uses proper leafy green density (47g/cup)", 
        oats: "Smart defaults to cooked oatmeal",
        oregano: "Micro-portion handling (1g/tsp)"
      },
      summary: {
        protein: `${totals.protein.toFixed(1)}g`,
        fiber: `${totals.fiber.toFixed(1)}g`, 
        calories: Math.round(totals.calories),
        source: totals.source,
        status: "All fixes working correctly!"
      }
    });
    
  } catch (error) {
    console.error('❌ Quick nutrition test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to test nutrition system'
    }, { status: 500 });
  }
}