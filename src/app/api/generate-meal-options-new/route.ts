import { NextRequest, NextResponse } from 'next/server';
import { generateMealOptions } from '../../../services/mealGenerationService';
import { generateCuratedMeals } from '../../../services/curatedMealService';
import { symptomMealService } from '../../../services/symptomMealService';
import { subscriptionService } from '../../../services/subscriptionService';

// Simple auth check - in production, you'd verify the token properly
async function verifyUser(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  // For development: extract user ID from token
  // The frontend sends the user's UID as the token when Firebase Admin isn't configured
  // This is temporary - in production you should properly verify Firebase tokens
  if (token && token.length > 0) {
    // Basic validation - check if it looks like a Firebase UID
    if (token.match(/^[a-zA-Z0-9]{20,}$/)) {
      return token; // Use the token as the user ID directly
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify user authentication
    const userId = await verifyUser(request);
    
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
        message: 'Please sign in to access AI meal generation.',
        upgradeUrl: '/analytics',
        feature: 'ai_meal_generation'
      }, { status: 401 });
    }
    
    // Check if user has premium access for AI meal generation
    const hasPremiumAccess = await subscriptionService.hasPremiumAccess(userId);
    if (!hasPremiumAccess) {
      return NextResponse.json({
        error: 'Premium subscription required',
        message: 'AI meal generation is available for premium subscribers only.',
        upgradeUrl: '/analytics',
        feature: 'ai_meal_generation'
      }, { status: 403 });
    }
    
    // Get symptom-based meal preferences
    let symptomEnhancement = '';
    try {
      symptomEnhancement = await symptomMealService.createSymptomPromptEnhancement(userId);
    } catch (symptomError) {
      // If symptom service fails, continue without enhancement
      console.error('Symptom enhancement failed:', symptomError);
    }
    
    const body = await request.json();
    const { preferences } = body;
    
    if (!preferences) {
      return NextResponse.json(
        { error: 'Missing preferences in request body' },
        { status: 400 }
      );
    }
    
    // Add symptom enhancement to preferences if available
    if (symptomEnhancement) {
      preferences.symptomEnhancement = symptomEnhancement;
    }
    
    try {
      // Try AI generation first
      const result = await generateMealOptions(preferences);
      
      const duration = Date.now() - startTime;
      
      return NextResponse.json({
        success: true,
        meals: result.meals,
        generationMethod: result.generationMethod,
        cacheStatus: result.cacheStatus,
        duration,
        timestamp: new Date().toISOString()
      });
      
    } catch (generationError) {
      console.error('Recipe generation failed:', generationError);
      // Fall back to curated recipes
      const curatedResult = await generateCuratedMeals(preferences);
      
      const duration = Date.now() - startTime;
      
      return NextResponse.json({
        success: true,
        meals: curatedResult.meals,
        generationMethod: 'curated_fallback',
        cacheStatus: 'miss',
        duration,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Complete meal generation failure after ${duration}ms:`, error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate meal options',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}