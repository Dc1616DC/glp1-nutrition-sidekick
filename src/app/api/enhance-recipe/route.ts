import { NextRequest, NextResponse } from 'next/server';
import { aiEnhancementService } from '../../../services/aiEnhancementService';

// Increase timeout for OpenAI requests
export const maxDuration = 60; // 60 seconds

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { enhancementType, recipe, parameters } = await request.json();

    console.log(`\n=== AI ENHANCEMENT REQUEST ===`);
    console.log(`Type: ${enhancementType}`);
    console.log(`Recipe: ${recipe.name}`);
    console.log(`Parameters:`, parameters);
    console.log(`Request started at: ${new Date().toISOString()}`);

    let result;

    switch (enhancementType) {
      case 'protein-boost':
        result = await aiEnhancementService.boostProtein(
          recipe, 
          parameters?.targetProtein || 20
        );
        break;

      case 'fiber-boost':
        // For now, use protein boost logic adapted for fiber
        // In a real implementation, you'd create a separate fiber boost method
        result = await aiEnhancementService.boostProtein(recipe, 20);
        break;

      case 'vegetarian':
        result = await aiEnhancementService.makeVegetarian(recipe);
        break;

      case 'simplify':
        result = await aiEnhancementService.simplifyRecipe(
          recipe, 
          parameters?.maxTime || 20
        );
        break;

      case 'meal-prep':
        result = await aiEnhancementService.addMealPrepInstructions(recipe);
        break;

      case 'shopping-list':
        const recipes = parameters?.recipes || [recipe];
        const shoppingResult = await aiEnhancementService.generateShoppingList(recipes);
        return NextResponse.json(shoppingResult);

      case 'custom':
        if (!parameters?.request) {
          return NextResponse.json(
            { success: false, error: 'Custom request text is required' },
            { status: 400 }
          );
        }
        result = await aiEnhancementService.handleCustomRequest(recipe, parameters.request);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown enhancement type' },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;
    console.log(`Request completed in ${duration}ms`);

    if (result.success) {
      console.log(`✅ Enhancement successful: ${result.modifications?.join(', ')}`);
    } else {
      console.error(`❌ Enhancement failed: ${result.error}`);
    }

    return NextResponse.json(result);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Error in /api/enhance-recipe after ${duration}ms:`, error);
    
    // Enhanced error details for debugging
    let errorMessage = 'Failed to enhance recipe';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      // Check for specific error types
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out - try again';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'API rate limit exceeded - please wait a moment';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error - check connection';
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: errorDetails,
        duration: `${duration}ms`
      },
      { status: 500 }
    );
  }
}