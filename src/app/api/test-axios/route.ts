import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const apiKey = process.env.USDA_API_KEY;
    const fdcId = 2646170;
    const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`;
    
    const params = {
      api_key: apiKey
    };

    const response = await axios.get(url, { params });
    
    // Check basic response structure
    const data = response.data;
    const hasNutrients = data.foodNutrients && data.foodNutrients.length > 0;
    
    // Find specific nutrients we care about
    const proteinNutrient = hasNutrients ? data.foodNutrients.find((n: any) => n.nutrient?.id === 1003) : null;
    const fatNutrient = hasNutrients ? data.foodNutrients.find((n: any) => n.nutrient?.id === 1004) : null;
    const carbsNutrient = hasNutrients ? data.foodNutrients.find((n: any) => n.nutrient?.id === 1005) : null;
    const energyNutrient = hasNutrients ? data.foodNutrients.find((n: any) => n.nutrient?.id === 2047) : null;
    
    return NextResponse.json({
      success: true,
      response: {
        status: response.status,
        fdcId: data.fdcId,
        description: data.description,
        dataType: data.dataType,
        nutrientCount: hasNutrients ? data.foodNutrients.length : 0
      },
      nutrients: {
        protein: proteinNutrient ? { id: proteinNutrient.nutrient.id, amount: proteinNutrient.amount } : null,
        fat: fatNutrient ? { id: fatNutrient.nutrient.id, amount: fatNutrient.amount } : null,
        carbs: carbsNutrient ? { id: carbsNutrient.nutrient.id, amount: carbsNutrient.amount } : null,
        energy: energyNutrient ? { id: energyNutrient.nutrient.id, amount: energyNutrient.amount } : null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : 'unknown'
    }, { status: 500 });
  }
}
