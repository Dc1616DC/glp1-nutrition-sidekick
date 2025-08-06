import { NextRequest, NextResponse } from 'next/server';
import { proAnalyticsService } from '../../../services/proAnalyticsService';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Initialize Firebase Admin if not already initialized
    if (getApps().length === 0) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK || '{}');
      initializeApp({
        credential: cert(serviceAccount)
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    console.log('🔍 Generating personalized recommendations for user:', userId);

    // Generate personalized meal recommendations
    const recommendations = await proAnalyticsService.generatePersonalizedMealRecommendations(userId);

    return NextResponse.json({
      success: true,
      recommendations,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Return appropriate error status
    const statusCode = errorMessage.includes('permission') ? 403 : 
                      errorMessage.includes('not found') ? 404 : 500;

    return NextResponse.json(
      { 
        error: 'Failed to generate personalized recommendations',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}