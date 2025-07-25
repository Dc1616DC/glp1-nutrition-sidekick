import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
    
    // Test 1: Simple search
    console.log('Testing USDA search...');
    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=chicken breast&dataType=Foundation&api_key=${apiKey}&pageSize=1`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    console.log('Search response:', JSON.stringify(searchData, null, 2));
    
    if (searchData.foods && searchData.foods.length > 0) {
      const food = searchData.foods[0];
      const fdcId = food.fdcId;
      
      // Test 2: Get food details
      console.log(`Getting details for FDC ID: ${fdcId}`);
      const detailsUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      
      console.log('Details response:', JSON.stringify(detailsData, null, 2));
      
      return NextResponse.json({
        success: true,
        searchResults: searchData.foods.length,
        foodName: food.description,
        fdcId: fdcId,
        nutrientsCount: detailsData.foodNutrients?.length || 0,
        sampleNutrients: detailsData.foodNutrients?.slice(0, 5) || []
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No foods found in search',
        searchData
      });
    }
    
  } catch (error) {
    console.error('Direct USDA test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
