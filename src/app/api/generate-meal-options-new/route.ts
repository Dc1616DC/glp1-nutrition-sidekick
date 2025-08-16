import { NextRequest, NextResponse } from 'next/server';
import { GrokService } from '../../../services/grokService';
import { symptomMealService } from '../../../services/symptomMealService';
import { subscriptionService } from '../../../services/subscriptionService';
import { verifyIdToken, isAdminInitialized } from '../../../lib/firebase-admin';
import { withRateLimit, rateLimiters } from '../../../lib/rateLimiter';
import { createErrorResponse, createAuthError, sanitizeError } from '../../../lib/error-sanitizer';
import '../../../lib/env-validation'; // Validate environment on import

const grokService = new GrokService();

/**
 * Verify user authentication
 * Supports both Firebase Admin SDK (production) and fallback for development
 */
async function verifyUser(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  // Try Firebase Admin SDK verification first (production)
  if (isAdminInitialized()) {
    try {
      const decodedToken = await verifyIdToken(token);
      return decodedToken.uid;
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      return null;
    }
  }
  
  // Fallback for development when Firebase Admin isn't configured
  // This should only be used in development environments with explicit opt-in
  if (process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_AUTH === 'true') {
    console.warn('⚠️ Using development authentication fallback - not for production!');
    // More strict validation for development - must be a known test user ID
    const allowedDevUserIds = process.env.DEV_USER_IDS?.split(',') || [];
    if (allowedDevUserIds.includes(token)) {
      return token;
    }
  }
  
  return null;
}

async function handlePOST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify user authentication
    const userId = await verifyUser(request);
    
    if (!userId) {
      return createAuthError();
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
    
    // The body itself contains the preferences directly
    const preferences = {
      mealType: body.mealType,
      dietaryRestrictions: body.dietaryRestrictions,
      allergies: body.allergies,
      numOptions: body.numOptions || 2,
      maxCookingTime: body.maxCookingTime,
      proteinTarget: body.proteinTarget,
      fiberTarget: body.fiberTarget,
      calorieRange: body.calorieRange,
      creativityLevel: body.creativityLevel,
      assemblyToRecipeRatio: body.assemblyToRecipeRatio,
      avoidIngredients: body.allergies || [],
      previousMeals: []
    };
    
    // Add symptom enhancement to preferences if available
    if (symptomEnhancement) {
      preferences.symptomEnhancement = symptomEnhancement;
    }
    
    try {
      // Generate meals using Grok AI service
      const meals = await grokService.generateGLP1Recipes({
        mealType: preferences.mealType || 'lunch',
        dietaryRestrictions: preferences.dietaryRestrictions || [],
        allergies: preferences.allergies || [],
        numOptions: preferences.numOptions || 2,
        maxCookingTime: preferences.maxCookingTime || 30,
        proteinTarget: preferences.proteinTarget || 20,
        fiberTarget: preferences.fiberTarget || 4,
        calorieRange: preferences.calorieRange || { min: 400, max: 600 },
        creativityLevel: preferences.creativityLevel || 'flavorful-twists',
        assemblyToRecipeRatio: preferences.assemblyToRecipeRatio || 0.6
      });
      
      const duration = Date.now() - startTime;
      
      return NextResponse.json({
        success: true,
        meals: meals,
        generationMethod: 'spoonacular',
        cacheStatus: 'fresh',
        duration,
        timestamp: new Date().toISOString()
      });
      
    } catch (generationError) {
      console.error('Recipe generation failed:', generationError);
      
      // Try to return a helpful error message
      const duration = Date.now() - startTime;
      
      return NextResponse.json({
        success: false,
        error: 'Failed to generate meals',
        details: generationError instanceof Error ? generationError.message : 'Unknown error',
        duration,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Complete meal generation failure after ${duration}ms:`, error);
    
    return createErrorResponse(error, 500, 'MEAL_GENERATION_FAILED');
  }
}

// Export the POST handler with rate limiting
export const POST = withRateLimit(handlePOST, rateLimiters.aiGeneration);