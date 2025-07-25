import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 Testing nutrition matching for salmon bowl ingredients...');
  
  // Test the exact ingredients from the problematic recipe
  const testIngredients = [
    { name: "pre-cooked salmon fillet", amount: 4, unit: "oz" },
    { name: "mixed greens (arugula, spinach)", amount: 1, unit: "cup" },
    { name: "medium ripe avocado, sliced", amount: 0.5, unit: "medium" },
    { name: "cherry tomatoes, halved", amount: 0.25, unit: "cup" },
    { name: "red onion, thinly sliced", amount: 2, unit: "tablespoons" },
    { name: "fresh dill, chopped", amount: 1, unit: "tablespoon" },
    { name: "lemon juice", amount: 1, unit: "tablespoon" },
    { name: "Salt and pepper to taste", amount: 1, unit: "serving" }
  ];

  const results = [];

  try {
    // Dynamic import to avoid top-level require
    const { COMMON_NUTRITION_DATA, findClosestMatch } = require('../../../data/commonNutrition');
    const { unitConversionService } = require('../../../services/unitConversionService');
    
    for (const ingredient of testIngredients) {
      const matchResult = findClosestMatch(ingredient.name);
      
      let nutritionData = null;
      let source = 'no-match';
      
      if (matchResult && COMMON_NUTRITION_DATA[matchResult]) {
        // Found in USDA database
        const nutritionPer100g = COMMON_NUTRITION_DATA[matchResult];
        const conversionResult = unitConversionService.convertToGrams(
          ingredient.amount, 
          ingredient.unit, 
          ingredient.name,
          true
        );
        
        const scale = conversionResult.grams / 100;
        
        nutritionData = {
          protein: (nutritionPer100g.protein * scale).toFixed(1),
          fiber: (nutritionPer100g.fiber * scale).toFixed(1),
          calories: Math.round(nutritionPer100g.calories * scale),
          grams: conversionResult.grams
        };
        source = 'usda-match';
      }
      
      results.push({
        ingredient: ingredient.name,
        amount: `${ingredient.amount} ${ingredient.unit}`,
        matchFound: matchResult,
        source,
        nutrition: nutritionData,
        issues: matchResult ? [] : ['No USDA match found - would use Spoonacular']
      });
    }
    
    // Calculate totals if all matched USDA
    const usdaMatched = results.filter(r => r.source === 'usda-match');
    const totalNutrition = usdaMatched.reduce((sum, item) => ({
      protein: sum.protein + parseFloat(item.nutrition?.protein || '0'),
      fiber: sum.fiber + parseFloat(item.nutrition?.fiber || '0'),
      calories: sum.calories + parseInt(item.nutrition?.calories || '0')
    }), { protein: 0, fiber: 0, calories: 0 });

    return NextResponse.json({
      testIngredients: results,
      summary: {
        totalIngredients: testIngredients.length,
        usdaMatches: usdaMatched.length,
        spoonacularFallbacks: results.filter(r => r.source === 'no-match').length,
        estimatedTotals: {
          protein: `${totalNutrition.protein.toFixed(1)}g`,
          fiber: `${totalNutrition.fiber.toFixed(1)}g`, 
          calories: totalNutrition.calories
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Nutrition matching test failed:', error);
    return NextResponse.json({
      error: error.message,
      details: 'Failed to test nutrition matching'
    }, { status: 500 });
  }
}