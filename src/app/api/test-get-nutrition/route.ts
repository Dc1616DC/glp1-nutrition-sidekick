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
    logs.push('=== TESTING getFoodNutrition DIRECTLY ===');
    
    const fdcId = 2646170;
    logs.push(`Testing FDC ID: ${fdcId}`);
    
    const nutrition = await nutritionService.getFoodNutrition(fdcId);
    
    // Restore console functions
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    
    return NextResponse.json({
      success: !!nutrition,
      fdcId,
      nutrition,
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
