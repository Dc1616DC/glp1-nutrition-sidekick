import { NextRequest, NextResponse } from 'next/server';
import { grokService } from '../../../services/grokService';
import { withRateLimit, rateLimiters } from '../../../lib/rateLimiter';

export const maxDuration = 30;

async function handlePOST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { recipe, allergies } = await request.json();
    
    console.log(`🎨 Enhancing recipe "${recipe.title || recipe.name}" with flavorful twists...`);
    
    const enhancedRecipe = await grokService.enhanceWithFlavorfulTwists(recipe, {
      allergies: allergies || [],
      mealType: recipe.mealType || 'lunch',
      dietaryRestrictions: [],
      numOptions: 1,
      maxCookingTime: 30
    });
    
    const duration = Date.now() - startTime;
    console.log(`✨ Enhanced recipe in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      enhancedRecipe,
      originalRecipe: recipe,
      enhancementTime: duration
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Enhancement failed after ${duration}ms:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to enhance recipe',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Export with rate limiting for enhancement operations
export const POST = withRateLimit(handlePOST, rateLimiters.enhancement);