import { NextRequest, NextResponse } from 'next/server';
import { nutritionService } from '../../../services/nutritionService';

export async function GET() {
  const logs: string[] = [];
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Capture console output
  console.log = (...args) => {
    logs.push(`LOG: ${args.join(' ')}`);
    originalConsoleLog(...args);
  };
  
  console.error = (...args) => {
    logs.push(`ERROR: ${args.join(' ')}`);
    originalConsoleError(...args);
  };
  
  console.warn = (...args) => {
    logs.push(`WARN: ${args.join(' ')}`);
    originalConsoleWarn(...args);
  };
  
  try {
    logs.push('=== STARTING SEARCH TEST ===');
    
    // Test the API key first
    const apiKey = process.env.USDA_API_KEY;
    logs.push(`API Key available: ${!!apiKey}`);
    
    // Test direct axios call to isolate service vs direct call
    const axios = require('axios');
    
    try {
      logs.push('Testing direct USDA API call...');
      const directResponse = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
        params: {
          query: 'chicken breast',
          dataType: 'Foundation',
          api_key: apiKey,
          pageSize: 1
        },
        timeout: 10000
      });
      logs.push(`Direct API call successful. Status: ${directResponse.status}`);
      logs.push(`Foods found: ${directResponse.data.foods.length}`);
      if (directResponse.data.foods.length > 0) {
        const firstFood = directResponse.data.foods[0];
        logs.push(`First result: FDC ID ${firstFood.fdcId}, Description: ${firstFood.description}`);
      }
    } catch (directError) {
      logs.push(`Direct API call failed: ${directError instanceof Error ? directError.message : directError}`);
    }
    
    logs.push('Now testing through NutritionService...');
    const searchResult = await nutritionService.searchFood('chicken breast');
    
    // Restore console functions
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    
    return NextResponse.json({
      success: true,
      searchResult: searchResult ? {
        fdcId: searchResult.fdcId,
        description: searchResult.description,
        dataType: searchResult.dataType,
        isFallback: searchResult.fdcId >= 999000
      } : null,
      logs,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    // Restore console functions
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    
    logs.push(`Outer catch error: ${error instanceof Error ? error.message : error}`);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs
    });
  }
}
