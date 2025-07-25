import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const fdcId = 2646170; // Known good FDC ID
    const apiKey = process.env.USDA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'USDA_API_KEY not found'
      });
    }

    // Make the exact same call that our service makes
    const detailsUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`;
    const params = {
      api_key: apiKey
    };

    console.log('Making axios call to:', detailsUrl);
    console.log('With params:', params);

    const response = await axios.get(detailsUrl, { params });
    
    console.log('Axios response status:', response.status);
    console.log('Axios response data keys:', Object.keys(response.data));
    console.log('Food nutrients array length:', response.data.foodNutrients?.length || 0);
    
    // Check if we have the specific nutrients we need
    const foodNutrients = response.data.foodNutrients || [];
    const targetNutrientIds = [1003, 1079, 2047, 1008, 1005, 1004]; // protein, fiber, calories (2 types), carbs, fat
    
    const foundNutrients: Record<number, any> = {};
    foodNutrients.forEach((nutrient: any) => {
      const nutrientId = nutrient.nutrient?.id || nutrient.nutrientId || 0;
      const amount = nutrient.amount || nutrient.value || 0;
      
      if (targetNutrientIds.includes(nutrientId)) {
        foundNutrients[nutrientId] = {
          id: nutrientId,
          name: nutrient.nutrient?.name || nutrient.nutrientName || 'unknown',
          amount: amount
        };
      }
    });

    return NextResponse.json({
      success: true,
      fdcId: response.data.fdcId,
      description: response.data.description,
      totalNutrients: foodNutrients.length,
      foundTargetNutrients: foundNutrients,
      nutrientCount: Object.keys(foundNutrients).length
    });

  } catch (error) {
    console.error('Axios test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: (error as any).response?.data || null
    });
  }
}
