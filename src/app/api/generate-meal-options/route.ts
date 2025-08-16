import { NextRequest, NextResponse } from 'next/server';
import { GrokService } from '../../../services/grokService';
import { symptomMealService } from '../../../services/symptomMealService';
import { subscriptionService } from '../../../services/subscriptionService';
import { verifyIdToken, isAdminInitialized } from '../../../lib/firebase-admin';

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
  
  // Temporary production bypass until Firebase Admin SDK is configured
  // TODO: Remove this after setting up Firebase Admin environment variables
  if (!isAdminInitialized() && process.env.VERCEL === '1') {
    console.warn('⚠️ TEMPORARY: Bypassing authentication - Firebase Admin not configured in production');
    // Basic token validation - should be a valid Firebase UID format
    if (token && token.length >= 10 && !token.includes(' ')) {
      return token;
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

    const body = await request.json();
    
    // Extract values from nested preferences object or direct properties
    const mealType = body.mealType || 'lunch';
    const preferences = body.preferences || {};
    const dietaryRestrictions = preferences.dietaryRestrictions || body.dietaryRestrictions || [];
    const avoidIngredients = body.avoidIngredients || body.allergies || [];

    console.log('\n=== GENERATING 2 MEAL OPTIONS WITH GROK AI ===');
    console.log('Request params:', {
      mealType,
      dietaryRestrictions,
      avoidIngredients: avoidIngredients.length
    });

    // Get symptom-based meal preferences
    let symptomEnhancement = '';
    try {
      symptomEnhancement = await symptomMealService.createSymptomPromptEnhancement(userId);
    } catch (symptomError) {
      // If symptom service fails, continue without enhancement
      console.error('Symptom enhancement failed:', symptomError);
    }
    
    // Build meal generation parameters from request body
    const mealParams = {
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
    
    // Add symptom enhancement to parameters if available
    if (symptomEnhancement) {
      mealParams.symptomEnhancement = symptomEnhancement;
    }
    
    try {
      // Generate meals using Grok AI service
      const meals = await grokService.generateGLP1Recipes({
        mealType: mealParams.mealType || 'lunch',
        dietaryRestrictions: mealParams.dietaryRestrictions || [],
        allergies: mealParams.allergies || [],
        numOptions: mealParams.numOptions || 2,
        maxCookingTime: mealParams.maxCookingTime || 30,
        proteinTarget: mealParams.proteinTarget || 20,
        fiberTarget: mealParams.fiberTarget || 4,
        calorieRange: mealParams.calorieRange || { min: 400, max: 600 },
        creativityLevel: mealParams.creativityLevel || 'flavorful-twists',
        assemblyToRecipeRatio: mealParams.assemblyToRecipeRatio || 0.6
      });
      
      const duration = Date.now() - startTime;
      
      return NextResponse.json({
        success: true,
        meals: meals,
        generationMethod: 'grok',
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
