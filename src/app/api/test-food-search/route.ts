import { NextRequest, NextResponse } from 'next/server';
import { nutritionService } from '../../../services/nutritionService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const food = searchParams.get('food') || 'shrimp';
  
  try {
    console.log(`\n=== TESTING SEARCH FOR: ${food} ===`);
    
    const searchResult = await nutritionService.searchFood(food);
    
    if (!searchResult) {
      return NextResponse.json({
        success: false,
        message: `No search result found for: ${food}`
      });
    }

    return NextResponse.json({
      success: true,
      food: food,
      searchResult: {
        fdcId: searchResult.fdcId,
        description: searchResult.description,
        dataType: searchResult.dataType
      },
      analysis: {
        isRealUSDA: searchResult.fdcId < 999000 || searchResult.fdcId >= 1000000,
        possibleIssue: searchResult.description.toLowerCase().includes('fried') || 
                      searchResult.description.toLowerCase().includes('battered') ||
                      searchResult.description.toLowerCase().includes('breaded')
      }
    });
    
  } catch (error) {
    console.error('Search test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
