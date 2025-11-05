import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase/config';

const functions = getFunctions(app);

// Firebase Functions types
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

interface SymptomInsightResponse {
  insight: string;
  generatedAt: string;
  medication: string;
  symptoms: string[];
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

export class GrokService {
  // Firebase Functions callable references
  private getSymptomInsightFn = httpsCallable<SymptomInsightRequest, SymptomInsightResponse>(
    functions, 
    'getSymptomInsight'
  );
  
  private getMealSuggestionFn = httpsCallable<MealSuggestionRequest, MealSuggestionResponse>(
    functions, 
    'getMealSuggestion'
  );

  /**
   * Get AI-powered symptom insights for GLP-1 users using Firebase Functions
   */
  async getSymptomInsight(request: SymptomInsightRequest): Promise<SymptomInsightResponse> {
    try {
      const result = await this.getSymptomInsightFn(request);
      return result.data;
    } catch (error) {
      console.error('Error getting symptom insight:', error);
      throw new Error('Failed to get symptom insight. Please try again.');
    }
  }

  /**
   * Get AI-powered meal suggestions optimized for GLP-1 users using Firebase Functions
   */
  async getMealSuggestionFromAI(request: MealSuggestionRequest): Promise<MealSuggestionResponse> {
    try {
      // Temporarily use test endpoint due to Firebase auth issues
      const response = await fetch('/api/test-grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
      // Original Firebase Functions code - restore after auth is fixed
      // const result = await this.getMealSuggestionFn(request);
      // return result.data;
    } catch (error) {
      console.error('Error getting meal suggestion:', error);
      throw new Error('Failed to get meal suggestions. Please try again.');
    }
  }

  /**
   * Get personalized symptom insights with user profile context
   */
  async getPersonalizedSymptomInsight(
    symptoms: string[],
    medication: string,
    userProfile?: {
      age?: number;
      experience?: 'new' | 'experienced' | 'struggling';
      primaryConcerns?: string[];
    }
  ): Promise<SymptomInsightResponse> {
    return this.getSymptomInsight({
      symptoms,
      medication,
      userContext: userProfile
    });
  }

  /**
   * Get meal suggestions with current symptoms and preferences using Firebase Functions
   */
  async getPersonalizedMealSuggestionFromAI(
    medication: string,
    options: {
      symptoms?: string[];
      dietaryRestrictions?: string[];
      preferences?: string[];
      experience?: 'new' | 'experienced' | 'struggling';
      primaryConcerns?: string[];
    } = {}
  ): Promise<MealSuggestionResponse> {
    return this.getMealSuggestionFromAI({
      medication,
      symptoms: options.symptoms,
      dietaryRestrictions: options.dietaryRestrictions,
      preferences: options.preferences,
      userContext: {
        experience: options.experience,
        primaryConcerns: options.primaryConcerns
      }
    });
  }

  // ===== DEPRECATED METHODS =====
  // These methods have been moved to Firebase Functions for security and performance
  // The direct OpenAI/Grok API calls are now handled server-side

  /**
   * @deprecated This method has been moved to Firebase Functions
   */
  async generateGLP1Recipes(): Promise<any[]> {
    throw new Error('generateGLP1Recipes has been moved to Firebase Functions. Use getMealSuggestionFromAI instead.');
  }

  /**
   * @deprecated This method has been moved to Firebase Functions
   */
  async enhanceWithFlavorfulTwists(): Promise<any> {
    throw new Error('enhanceWithFlavorfulTwists has been moved to Firebase Functions.');
  }

  /**
   * @deprecated This method has been moved to Firebase Functions
   */
  async adjustRecipe(): Promise<any> {
    throw new Error('adjustRecipe has been moved to Firebase Functions.');
  }

  /**
   * @deprecated This method has been moved to Firebase Functions
   */
  async generateSymptomTip(): Promise<string> {
    throw new Error('generateSymptomTip has been moved to Firebase Functions. Use getSymptomInsight instead.');
  }

  /**
   * @deprecated This method has been moved to Firebase Functions
   */
  async modifyRecipe(): Promise<any> {
    throw new Error('modifyRecipe has been moved to Firebase Functions.');
  }
}

export const grokService = new GrokService();