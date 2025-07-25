import { NextRequest, NextResponse } from 'next/server';
import { NutritionService } from '@/services/nutritionService';

const nutritionService = new NutritionService();

export async function GET() {
  const debugInfo: string[] = [];
  
  try {
    debugInfo.push('Starting direct nutrition test');
    debugInfo.push('Testing getFoodNutrition directly with FDC ID 2646170');
    
    // Test the exact FDC ID that search returns
    const nutrition = await nutritionService.getFoodNutrition(2646170);
    
    debugInfo.push(`Direct getFoodNutrition result: ${JSON.stringify(nutrition)}`);
    debugInfo.push('Test completed');
    
    return NextResponse.json({
      success: true,
      nutrition,
      message: nutrition ? 'Nutrition data retrieved successfully' : 'No nutrition data returned',
      timestamp: new Date().toISOString(),
      debugInfo
    });
  } catch (error) {
    debugInfo.push(`Error in direct nutrition test: ${error}`);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to get nutrition data',
      debugInfo
    }, { status: 500 });
  }
}
