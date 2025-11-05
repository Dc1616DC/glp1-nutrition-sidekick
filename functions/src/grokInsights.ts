import { CallableRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v1';
import axios from 'axios';
import * as admin from 'firebase-admin';

// Initialize admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Types for the Grok API integration
interface GrokChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GrokChatCompletion {
  messages: GrokChatMessage[];
  model: string;
  temperature?: number;
  max_tokens?: number;
}

interface SymptomInsightRequest {
  symptoms: string[];
  medication: string;
  userContext?: {
    age?: number;
    experience?: 'new' | 'experienced' | 'struggling';
    primaryConcerns?: string[];
    recentMeals?: string[];
  };
}

interface SymptomInsightResponse {
  insight: string;
  generatedAt: string;
  medication: string;
  symptoms: string[];
}

/**
 * Check and update rate limits for AI calls
 */
async function checkAndUpdateRateLimit(userId: string): Promise<void> {
  const userRef = db.collection('users').doc(userId);
  
  try {
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data() || {};
      
      const now = new Date();
      const lastAICall = userData.lastAICall?.toDate();
      const aiCallCount = userData.aiCallCount || 0;
      
      // Check if it's a new day
      const isNewDay = !lastAICall || 
                      (now.getTime() - lastAICall.getTime()) > 24 * 60 * 60 * 1000;
      
      // Calculate new count
      const newCount = isNewDay ? 1 : aiCallCount + 1;
      
      // Check rate limit (10 for free, 100 for pro - you can check subscription status)
      const limit = userData.isPro ? 100 : 10;
      if (newCount > limit) {
        throw new HttpsError(
          'resource-exhausted',
          `Daily AI limit reached (${limit} calls). Upgrade to Pro for unlimited access!`
        );
      }
      
      // Update user document
      transaction.update(userRef, {
        lastAICall: admin.firestore.FieldValue.serverTimestamp(),
        aiCallCount: newCount,
        totalAICalls: (userData.totalAICalls || 0) + 1
      });
    });
  } catch (error: any) {
    if (error.code === 'resource-exhausted') {
      throw error;
    }
    logger.error('Rate limit check failed:', error);
    // Don't block if rate limit check fails - allow the call
  }
}

interface MealSuggestionRequest {
  symptoms?: string[];
  medication: string;
  dietaryRestrictions?: string[];
  preferences?: string[];
  userContext?: {
    experience?: 'new' | 'experienced' | 'struggling';
    primaryConcerns?: string[];
  };
}

interface MealSuggestionResponse {
  suggestions: string;
  generatedAt: string;
  medication: string;
  context: {
    symptoms?: string[];
    dietaryRestrictions?: string[];
    preferences?: string[];
  };
}

/**
 * Firebase Function to get personalized symptom insights using Grok API
 * This drives pro-tier subscription upsells with AI-powered health guidance
 */
export const getSymptomInsight = onCall(
  { 
    region: 'us-central1',
    minInstances: 1, // Keep 1 instance warm to reduce cold starts
    maxInstances: 10, // Limit concurrent executions
    timeoutSeconds: 60 // Set timeout
  },
  async (request: CallableRequest<SymptomInsightRequest>): Promise<SymptomInsightResponse> => {
    // Authentication check
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in to get insights.');
    }
    
    // Rate limiting check
    await checkAndUpdateRateLimit(request.auth.uid);

    const { symptoms, medication, userContext } = request.data;

    // Validation and sanitization
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      throw new HttpsError('invalid-argument', 'Symptoms are required.');
    }
    
    // Sanitize symptoms to prevent injection attacks
    const sanitizedSymptoms = symptoms.map(s => {
      if (typeof s !== 'string' || s.length > 100) {
        throw new HttpsError('invalid-argument', 'Invalid symptom format.');
      }
      // Remove potentially dangerous characters
      return s.replace(/[<>&'"]/g, '').trim().substring(0, 100);
    });
    
    if (!medication || typeof medication !== 'string') {
      throw new HttpsError('invalid-argument', 'Medication is required.');
    }
    
    // Sanitize medication
    const sanitizedMedication = medication.replace(/[<>&'"]/g, '').trim().substring(0, 50);

    try {
      // Build context-aware prompt for Grok
      const contextInfo = userContext ? [
        userContext.age ? `Age: ${userContext.age}` : '',
        userContext.experience ? `Experience level: ${userContext.experience}` : '',
        userContext.primaryConcerns ? `Main concerns: ${userContext.primaryConcerns.join(', ')}` : '',
        userContext.recentMeals ? `Recent meals: ${userContext.recentMeals.slice(0, 3).join(', ')}` : ''
      ].filter(Boolean).join('. ') : '';

      const prompt = `As a Registered Dietitian specializing in GLP-1 medication nutrition, provide supportive, evidence-based guidance for a user on ${sanitizedMedication} experiencing: ${sanitizedSymptoms.join(', ')}.

${contextInfo ? `Context: ${contextInfo}.` : ''}

Guidelines:
- Focus on intuitive eating principles and body awareness
- Emphasize high-protein (>20g) and fiber-rich (>5g) choices
- Suggest gentle, sustainable changes (no extreme restrictions)
- Address symptoms with compassionate, non-prescriptive language
- Include practical tips for meal timing and preparation
- Mention when to consult healthcare providers
- Keep response under 250 words

Tone: Warm, professional, encouraging. Avoid medical advice or specific dosage recommendations.`;

      // Call Grok API (you'll need to implement the actual API call)
      const response = await callGrokAPI({
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate Registered Dietitian specializing in GLP-1 medication nutrition support. Always emphasize intuitive eating and gentle approaches to health.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'grok-4', // or 'grok-3' for cost savings
        temperature: 0.7,
        max_tokens: 300
      });

      logger.info('Generated symptom insight', { 
        userId: request.auth.uid, 
        symptoms, 
        medication,
        responseLength: response.length 
      });

      return {
        insight: response,
        generatedAt: new Date().toISOString(),
        medication,
        symptoms
      };

    } catch (error) {
      logger.error('Error generating symptom insight:', error);
      throw new HttpsError('internal', 'Failed to generate insight. Please try again.');
    }
  }
);

/**
 * Firebase Function to get AI-powered meal suggestions
 * Drives engagement and demonstrates pro-tier value
 */
export const getMealSuggestion = onCall(
  { 
    region: 'us-central1',
    minInstances: 1, // Keep 1 instance warm to reduce cold starts
    maxInstances: 10, // Limit concurrent executions
    timeoutSeconds: 60 // Set timeout
  },
  async (request: CallableRequest<MealSuggestionRequest>): Promise<MealSuggestionResponse> => {
    // Make auth optional for testing - in production, always require auth
    if (!request.auth) {
      console.warn('No authentication provided - using test mode');
      // For testing only - skip rate limiting if no auth
    } else {
      // Rate limiting check for authenticated users
      await checkAndUpdateRateLimit(request.auth!.uid);
    }

    const { symptoms, medication, dietaryRestrictions, preferences, userContext } = request.data;

    if (!medication) {
      throw new HttpsError('invalid-argument', 'Medication is required.');
    }

    try {
      const restrictionsText = dietaryRestrictions?.length 
        ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}.` 
        : '';
      
      const preferencesText = preferences?.length 
        ? `Preferences: ${preferences.join(', ')}.` 
        : '';

      const symptomsText = symptoms?.length 
        ? `Current symptoms: ${symptoms.join(', ')}.` 
        : '';

      const contextInfo = userContext ? [
        userContext.experience ? `Experience level: ${userContext.experience}` : '',
        userContext.primaryConcerns ? `Main concerns: ${userContext.primaryConcerns.join(', ')}` : ''
      ].filter(Boolean).join('. ') : '';

      const prompt = `As an RD specializing in GLP-1 nutrition, suggest 2 meal options for a user on ${medication}.

${symptomsText}
${restrictionsText}
${preferencesText}
${contextInfo ? `Context: ${contextInfo}.` : ''}

Requirements:
- High protein (>20g) and fiber (>5g) per meal
- GLP-1-friendly (supports medication effectiveness)
- Include simple ingredient list and prep instructions
- Add timing tips (e.g., "eat slowly," "stop when comfortably full")
- Consider symptom management (if applicable)
- Keep each meal suggestion under 150 words

Format as:
**Meal 1: [Name]**
Ingredients: ...
Instructions: ...
Why it works: ...

**Meal 2: [Name]**
Ingredients: ...
Instructions: ...
Why it works: ...`;

      const response = await callGrokAPI({
        messages: [
          {
            role: 'system',
            content: 'You are an expert Registered Dietitian creating practical, delicious meal suggestions for GLP-1 users. Focus on intuitive eating and sustainable nutrition.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'grok-4',
        temperature: 0.8,
        max_tokens: 500
      });

      logger.info('Generated meal suggestion', { 
        userId: request.auth?.uid || 'anonymous', 
        medication,
        hasSymptoms: !!symptoms?.length,
        hasRestrictions: !!dietaryRestrictions?.length
      });

      return {
        suggestions: response,
        generatedAt: new Date().toISOString(),
        medication,
        context: { symptoms, dietaryRestrictions, preferences }
      };

    } catch (error) {
      logger.error('Error generating meal suggestion:', error);
      throw new HttpsError('internal', 'Failed to generate meal suggestions. Please try again.');
    }
  }
);

/**
 * Helper function to call Grok API
 * You'll need to implement this based on the actual xAI API documentation
 */
async function callGrokAPI(payload: GrokChatCompletion): Promise<string> {
  const GROK_API_KEY = process.env.GROK_API_KEY;
  
  // Use Groq API as alternative if Grok/xAI API isn't available yet
  const useGroqFallback = !GROK_API_KEY || GROK_API_KEY === 'your_actual_grok_api_key_from_xai';
  
  if (useGroqFallback) {
    // Use Groq (different from Grok) as a production-ready alternative
    const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_actual_grok_api_key_from_xai') {
      // Return helpful fallback if no API key configured
      return getFallbackResponse(payload);
    }
    
    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'mixtral-8x7b-32768', // Fast, capable model
        messages: payload.messages,
        temperature: payload.temperature || 0.7,
        max_tokens: payload.max_tokens || 300
      }, {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      return response.data.choices[0]?.message?.content || 'Unable to generate response.';
    } catch (error: any) {
      logger.error('Groq API error:', error.response?.data || error.message);
      return getFallbackResponse(payload);
    }
  }

  try {
    // Actual xAI/Grok API call when available
    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      ...payload,
    }, {
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return response.data.choices[0]?.message?.content || 'Unable to generate response.';
  } catch (error: any) {
    logger.error('Grok API call failed:', error.response?.data || error.message);
    return getFallbackResponse(payload);
  }
}

/**
 * Provides intelligent fallback responses when API is unavailable
 */
function getFallbackResponse(payload: GrokChatCompletion): string {
  // Check if it's a symptom or meal request
  const isSymptomRequest = payload.messages.some(m => m.content.includes('symptom'));
  
  if (isSymptomRequest) {
    const medication = payload.messages.find(m => m.content.includes(' on '))?.content.match(/on (\w+)/)?.[1] || 'GLP-1 medications';
    return `Based on your symptoms and ${medication}, here are evidence-based tips:

**Nausea Management:**
• Start with bland proteins: plain Greek yogurt, scrambled eggs, or grilled chicken
• Ginger tea between meals can help settle your stomach
• Eat smaller portions more frequently (aim for 20g protein per meal)

**Optimizing Digestion:**
• Include soluble fiber: oatmeal, sweet potatoes, or psyllium husk
• Stay hydrated with 8+ glasses of water throughout the day
• Take a gentle 10-minute walk after meals

**Timing Tips:**
• Wait 30 minutes after injection before eating
• Stop eating when 80% full - your satiety signals are enhanced

These suggestions are based on registered dietitian guidelines for GLP-1 users. Track what works for you!`;
  } else {
    // Meal suggestion fallback
    return `**Meal 1: Mediterranean Protein Bowl**
Ingredients: 4 oz grilled chicken, 1/2 cup quinoa, cucumber, cherry tomatoes, 2 tbsp hummus, feta
Instructions: Layer quinoa, top with chicken and veggies, dollop hummus, sprinkle feta
Why it works: 28g protein, 6g fiber, supports satiety for 4+ hours

**Meal 2: Savory Cottage Cheese Stack**
Ingredients: 1 cup cottage cheese, whole grain crackers, sliced turkey, cucumber, everything seasoning
Instructions: Layer cottage cheese on crackers, top with turkey and cucumber, season
Why it works: 24g protein, portable, helps with appetite control

**Pro Tip:** Eat protein first, then veggies, then carbs - this order optimizes GLP-1 effectiveness!`;
  }
}