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

    // Recreate the exact logic from getFoodNutrition
    const detailsUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`;
    const params = { api_key: apiKey };

    const response = await axios.get(detailsUrl, { params });
    
    if (!response.data.foodNutrients) {
      return NextResponse.json({
        success: false,
        error: 'No foodNutrients in response'
      });
    }

    // USDA nutrient IDs (same as in service)
    const nutrientIds = {
      protein: 1003,  
      fiber: 1079,    
      calories: [1008, 2047, 2048], 
      carbs: 1005,    
      fat: 1004       
    };

    // Initialize nutrition object
    const nutrition = {
      protein: 0,
      fiber: 0,
      calories: 0,
      carbs: 0,
      fat: 0
    };

    let foundNutrients: string[] = [];
    let processedNutrients: string[] = [];

    response.data.foodNutrients.forEach((nutrient: any) => {
      const amount = nutrient.amount || 0;
      const nutrientId = nutrient.nutrient?.id || 0;
      const nutrientName = nutrient.nutrient?.name || 'unknown';
      
      if (amount > 0) {
        foundNutrients.push(`${nutrientName} (${nutrientId}): ${amount}`);
      }
      
      // Track what we're processing
      if (nutrientId === nutrientIds.protein) {
        nutrition.protein = amount;
        processedNutrients.push(`Set protein = ${amount} from nutrient ${nutrientId}`);
      } else if (nutrientId === nutrientIds.fiber) {
        nutrition.fiber = amount;
        processedNutrients.push(`Set fiber = ${amount} from nutrient ${nutrientId}`);
      } else if (nutrientId === nutrientIds.carbs) {
        nutrition.carbs = amount;
        processedNutrients.push(`Set carbs = ${amount} from nutrient ${nutrientId}`);
      } else if (nutrientId === nutrientIds.fat) {
        nutrition.fat = amount;
        processedNutrients.push(`Set fat = ${amount} from nutrient ${nutrientId}`);
      } else if (nutrientIds.calories.includes(nutrientId)) {
        if (nutrition.calories === 0 || nutrientId === 2047) {
          nutrition.calories = amount;
          processedNutrients.push(`Set calories = ${amount} from nutrient ${nutrientId}`);
        }
      }
    });

    // Check if we got meaningful data
    const hasData = nutrition.protein > 0 || nutrition.fat > 0 || nutrition.carbs >= 0 || nutrition.calories > 0;

    return NextResponse.json({
      success: true,
      fdcId,
      totalNutrients: response.data.foodNutrients.length,
      foundNutrientsCount: foundNutrients.length,
      processedNutrientsCount: processedNutrients.length,
      finalNutrition: nutrition,
      hasData,
      processedNutrients: processedNutrients,
      foundNutrients: foundNutrients.slice(0, 10)  // First 10 for brevity
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
