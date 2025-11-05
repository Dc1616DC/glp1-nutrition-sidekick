# GROK COMPREHENSIVE CODE ANALYSIS & DEBUG REQUEST

## 🎯 **ANALYSIS REQUEST**

Please analyze this GLP-1 nutrition app codebase for:
1. **Critical bugs** that could cause runtime errors
2. **Performance bottlenecks** in React components or Firebase operations
3. **Security vulnerabilities** in Firebase Functions or client code
4. **TypeScript type safety** issues that could cause production failures
5. **Firebase integration** issues (Firestore rules, Functions, authentication)
6. **React best practices** violations that affect UX
7. **Memory leaks** or inefficient state management
8. **Production deployment** readiness

## 📊 **CURRENT PRODUCTION ISSUES REPORTED**

1. **Firestore undefined field errors** - Users can't save injection data
2. **Race conditions** - "r.map is not a function" errors in components
3. **Authentication timeouts** - Firebase auth expires during long sessions
4. **Loading state issues** - Components render before async data loads
5. **Memory usage** - App becomes slow after extended use

---

## 🔥 **CRITICAL FILES FOR ANALYSIS**

### **1. FIREBASE FUNCTIONS (Revenue-Critical AI Features)**

#### `/functions/src/grokInsights.ts`
```typescript
import { CallableRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v1';
import axios from 'axios';

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

/**
 * Firebase Function to get personalized symptom insights using Grok API
 * This drives pro-tier subscription upsells with AI-powered health guidance
 */
export const getSymptomInsight = onCall(
  { region: 'us-central1' },
  async (request: CallableRequest<SymptomInsightRequest>) => {
    // Authentication check
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in to get insights.');
    }

    const { symptoms, medication, userContext } = request.data;

    // Validation
    if (!symptoms || symptoms.length === 0) {
      throw new HttpsError('invalid-argument', 'Symptoms are required.');
    }
    if (!medication) {
      throw new HttpsError('invalid-argument', 'Medication is required.');
    }

    try {
      // Build context-aware prompt for Grok
      const contextInfo = userContext ? [
        userContext.age ? `Age: ${userContext.age}` : '',
        userContext.experience ? `Experience level: ${userContext.experience}` : '',
        userContext.primaryConcerns ? `Main concerns: ${userContext.primaryConcerns.join(', ')}` : '',
        userContext.recentMeals ? `Recent meals: ${userContext.recentMeals.slice(0, 3).join(', ')}` : ''
      ].filter(Boolean).join('. ') : '';

      const prompt = `As a Registered Dietitian specializing in GLP-1 medication nutrition, provide supportive, evidence-based guidance for a user on ${medication} experiencing: ${symptoms.join(', ')}.

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
  { region: 'us-central1' },
  async (request: CallableRequest<MealSuggestionRequest>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in to get meal suggestions.');
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
        userId: request.auth.uid, 
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
  // This is a placeholder - replace with actual xAI API integration
  // For now, returning a mock response to test the function structure
  
  const GROK_API_KEY = process.env.GROK_API_KEY;
  if (!GROK_API_KEY) {
    throw new Error('GROK_API_KEY not configured. Set it as an environment variable in Firebase Functions.');
  }

  try {
    // Replace with actual xAI API endpoint when available
    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      ...payload,
    }, {
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    return response.data.choices[0]?.message?.content || 'Unable to generate response.';
  } catch (error) {
    logger.error('Grok API call failed:', error);
    
    // Fallback response for testing/development
    if (payload.messages.some(m => m.content.includes('symptom'))) {
      return `Thank you for sharing your symptoms. While I work on connecting with our AI nutritionist, here are some general tips for ${payload.messages.find(m => m.content.includes('on '))?.content.match(/on (\\w+)/)?.[1] || 'your medication'}:

• Focus on smaller, protein-rich meals (20+ grams protein)
• Include fiber from gentle sources like oats or bananas
• Eat slowly and honor your fullness cues
• Stay hydrated throughout the day

For personalized guidance, please consult your healthcare provider. Our AI insights feature is coming soon!`;
    } else {
      return `**Meal 1: Protein-Packed Smoothie Bowl**
Ingredients: Greek yogurt, protein powder, berries, chia seeds, almonds
Instructions: Blend yogurt and protein powder, top with berries, chia seeds, and sliced almonds
Why it works: High protein (25g) and fiber (8g), easy to digest, customizable

**Meal 2: Turkey & Veggie Wrap**
Ingredients: Whole wheat tortilla, turkey breast, avocado, spinach, hummus
Instructions: Spread hummus on tortilla, add turkey, avocado, and spinach, roll up
Why it works: Balanced macros, portable, provides sustained energy

*AI-powered personalization coming soon to Pro tier!*`;
    }
  }
}
```

### **2. UTILITY FUNCTIONS (Critical for Data Integrity)**

#### `/src/utils/firestoreUtils.ts`
```typescript
/**
 * Utility functions for Firestore operations
 * Fixes critical "undefined field" errors that prevent data saves
 */

/**
 * Clean undefined/null fields from objects before Firestore writes
 * Prevents "Unsupported field value: undefined" errors
 */
export function cleanFirestoreData<T extends Record<string, any>>(data: T): T {
  const cleaned = { ...data };
  
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined || cleaned[key] === null) {
      delete cleaned[key];
    } else if (typeof cleaned[key] === 'object' && cleaned[key] !== null && !Array.isArray(cleaned[key])) {
      // Recursively clean nested objects
      cleaned[key] = cleanFirestoreData(cleaned[key]);
    } else if (Array.isArray(cleaned[key])) {
      // Clean arrays by filtering out undefined/null values
      cleaned[key] = cleaned[key].filter((item: any) => item !== undefined && item !== null);
    }
  });
  
  return cleaned as T;
}

/**
 * Prepare injection data for Firestore with validation
 */
export function prepareInjectionForFirestore(injection: any) {
  return cleanFirestoreData({
    ...injection,
    timestamp: injection.timestamp instanceof Date 
      ? injection.timestamp 
      : new Date(injection.timestamp),
    dose: Number(injection.dose) || 0,
    site: String(injection.site || ''),
    medication: String(injection.medication || ''),
    notes: injection.notes ? String(injection.notes) : '',
    userId: String(injection.userId || ''),
    createdAt: injection.createdAt || new Date(),
    updatedAt: new Date()
  });
}

/**
 * Safe array access with default values
 */
export function safeArrayAccess<T>(arr: T[] | undefined | null, defaultValue: T[] = []): T[] {
  return Array.isArray(arr) ? arr : defaultValue;
}

/**
 * Safe object property access
 */
export function safePropertyAccess<T>(obj: any, path: string, defaultValue: T): T {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}
```

### **3. INJECTION SERVICE (High Error Rate Component)**

#### `/src/services/firestoreInjectionService.ts`
```typescript
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Injection, InjectionSite } from '../types/injection';
import { cleanFirestoreData, prepareInjectionForFirestore } from '../utils/firestoreUtils';

export class FirestoreInjectionService {
  private userId: string | null = null;

  constructor(userId?: string) {
    this.userId = userId || null;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  async saveInjection(injection: Omit<Injection, 'id'>): Promise<Injection> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      // Prepare and clean data for Firestore
      const cleanedInjection = prepareInjectionForFirestore({
        ...injection,
        userId: this.userId,
        id: `inj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      // Save to user's injection subcollection
      const userInjectionsRef = collection(db, 'userInjections', this.userId, 'injections');
      const docRef = await addDoc(userInjectionsRef, cleanedInjection);

      return {
        ...cleanedInjection,
        id: docRef.id
      } as Injection;

    } catch (error) {
      console.error('Error saving injection to Firestore:', error);
      throw new Error('Failed to save injection. Please try again.');
    }
  }

  async getInjections(): Promise<Injection[]> {
    if (!this.userId) {
      console.warn('No user ID provided for getInjections');
      return [];
    }

    try {
      const userInjectionsRef = collection(db, 'userInjections', this.userId, 'injections');
      const q = query(userInjectionsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);

      const injections: Injection[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        injections.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as Injection);
      });

      return injections;
    } catch (error) {
      console.error('Error loading injections from Firestore:', error);
      return [];
    }
  }

  async updateInjection(id: string, updates: Partial<Injection>): Promise<void> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      const cleanedUpdates = cleanFirestoreData({
        ...updates,
        updatedAt: new Date()
      });

      const injectionRef = doc(db, 'userInjections', this.userId, 'injections', id);
      await updateDoc(injectionRef, cleanedUpdates);
    } catch (error) {
      console.error('Error updating injection:', error);
      throw new Error('Failed to update injection. Please try again.');
    }
  }

  async deleteInjection(id: string): Promise<void> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      const injectionRef = doc(db, 'userInjections', this.userId, 'injections', id);
      await deleteDoc(injectionRef);
    } catch (error) {
      console.error('Error deleting injection:', error);
      throw new Error('Failed to delete injection. Please try again.');
    }
  }

  async getInjectionSites(): Promise<InjectionSite[]> {
    if (!this.userId) {
      return this.getDefaultInjectionSites();
    }

    try {
      const injections = await this.getInjections();
      const sites = this.calculateSiteAvailability(injections);
      return sites;
    } catch (error) {
      console.error('Error calculating injection sites:', error);
      return this.getDefaultInjectionSites();
    }
  }

  private calculateSiteAvailability(injections: Injection[]): InjectionSite[] {
    const sites = this.getDefaultInjectionSites();
    const now = new Date();

    // Calculate last used date for each site
    sites.forEach(site => {
      const siteInjections = injections.filter(inj => inj.site === site.id);
      if (siteInjections.length > 0) {
        const lastUsed = siteInjections[0].timestamp; // Most recent (already sorted)
        site.lastUsed = lastUsed;

        // Site is available if more than 14 days since last use
        const daysSinceLastUse = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
        site.isAvailable = daysSinceLastUse >= 14;
      }
    });

    return sites;
  }

  private getDefaultInjectionSites(): InjectionSite[] {
    return [
      {
        id: 'left-abdomen',
        label: 'Left Abdomen',
        coordinates: { x: 35, y: 45 },
        isAvailable: true
      },
      {
        id: 'right-abdomen',
        label: 'Right Abdomen',
        coordinates: { x: 65, y: 45 },
        isAvailable: true
      },
      {
        id: 'left-thigh',
        label: 'Left Thigh',
        coordinates: { x: 42, y: 70 },
        isAvailable: true
      },
      {
        id: 'right-thigh',
        label: 'Right Thigh',
        coordinates: { x: 58, y: 70 },
        isAvailable: true
      },
      {
        id: 'left-arm',
        label: 'Left Upper Arm',
        coordinates: { x: 25, y: 35 },
        isAvailable: true
      },
      {
        id: 'right-arm',
        label: 'Right Upper Arm',
        coordinates: { x: 75, y: 35 },
        isAvailable: true
      }
    ];
  }

  async migrateFromLocalStorage(): Promise<void> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    try {
      const localData = localStorage.getItem('injectionHistory');
      if (!localData) {
        console.log('No local injection data to migrate');
        return;
      }

      const injections: Injection[] = JSON.parse(localData);
      if (!Array.isArray(injections) || injections.length === 0) {
        console.log('No valid injection data to migrate');
        return;
      }

      const batch = writeBatch(db);
      const userInjectionsRef = collection(db, 'userInjections', this.userId, 'injections');

      let migratedCount = 0;
      for (const injection of injections) {
        try {
          const cleanedInjection = prepareInjectionForFirestore({
            ...injection,
            userId: this.userId,
            migratedFromLocalStorage: true,
            migrationDate: new Date()
          });

          const newDocRef = doc(userInjectionsRef);
          batch.set(newDocRef, cleanedInjection);
          migratedCount++;
        } catch (error) {
          console.warn('Skipping invalid injection during migration:', error);
        }
      }

      if (migratedCount > 0) {
        await batch.commit();
        console.log(`Successfully migrated ${migratedCount} injections to Firestore`);
        
        // Clear local storage after successful migration
        localStorage.removeItem('injectionHistory');
      }

    } catch (error) {
      console.error('Error migrating injection data:', error);
      throw new Error('Failed to migrate injection data. Please try again.');
    }
  }
}

export const firestoreInjectionService = new FirestoreInjectionService();
```

### **4. REACT COMPONENT WITH CRITICAL RACE CONDITIONS**

#### `/src/components/injection-tracker/BodyMap.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { injectionService } from '@/services/injectionService';
import { InjectionSite } from '@/types/injection';
import InjectionEducation from './InjectionEducation';

interface BodyMapProps {
  selectedSite: string;
  onSelectSite: (site: string) => void;
}

export default function BodyMap({ selectedSite, onSelectSite }: BodyMapProps) {
  const [sites, setSites] = useState<InjectionSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSites = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const injectionSites = await injectionService.getInjectionSites();
        setSites(injectionSites ?? []);
      } catch (err) {
        setError('Failed to load injection sites. Please refresh the page.');
        console.error('Error loading injection sites:', err);
        setSites([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSites();
  }, []);

  const getSiteStyle = (site: InjectionSite) => {
    const isSelected = selectedSite === site.id;
    const baseStyle = 'absolute w-12 h-12 rounded-full border-2 cursor-pointer transition-all transform -translate-x-1/2 -translate-y-1/2';
    
    if (!site.isAvailable) {
      return `${baseStyle} border-red-500 bg-red-100 hover:scale-110`;
    }
    if (isSelected) {
      return `${baseStyle} border-blue-500 bg-blue-200 scale-110`;
    }
    return `${baseStyle} border-green-500 bg-green-100 hover:scale-110 hover:bg-green-200`;
  };

  const formatSiteLabel = (siteId: string) => {
    return siteId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getDaysAgo = (lastUsed?: Date) => {
    if (!lastUsed) return null;
    const days = Math.floor((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading injection sites...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-red-800 font-medium">Error Loading Sites</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded text-sm transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // No sites available
  if (sites.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">No injection sites available. Please log your first injection to begin site rotation tracking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Body Visualization */}
      <div className="relative bg-gray-50 rounded-lg p-8 mx-auto" style={{ maxWidth: '300px', height: '400px' }}>
        {/* Simple body outline */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Head */}
          <circle cx="50" cy="15" r="8" fill="none" stroke="#9CA3AF" strokeWidth="1" />
          
          {/* Body */}
          <rect x="40" y="23" width="20" height="30" rx="4" fill="none" stroke="#9CA3AF" strokeWidth="1" />
          
          {/* Arms */}
          <rect x="25" y="28" width="10" height="20" rx="3" fill="none" stroke="#9CA3AF" strokeWidth="1" />
          <rect x="65" y="28" width="10" height="20" rx="3" fill="none" stroke="#9CA3AF" strokeWidth="1" />
          
          {/* Legs */}
          <rect x="42" y="53" width="7" height="25" rx="3" fill="none" stroke="#9CA3AF" strokeWidth="1" />
          <rect x="51" y="53" width="7" height="25" rx="3" fill="none" stroke="#9CA3AF" strokeWidth="1" />
        </svg>

        {/* Injection Sites */}
        {sites.map((site) => (
          <button
            key={site.id}
            onClick={() => onSelectSite(site.id)}
            className={getSiteStyle(site)}
            style={{
              left: `${site.coordinates.x}%`,
              top: `${site.coordinates.y}%`
            }}
            title={site.label}
          >
            {!site.isAvailable && (
              <span className="text-xs font-bold text-red-600">!</span>
            )}
            {selectedSite === site.id && (
              <span className="text-xs font-bold text-blue-600">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Site List with Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Select Injection Site:</h4>
        <div className="grid grid-cols-2 gap-2">
          {sites.map((site) => {
            const daysAgo = getDaysAgo(site.lastUsed);
            return (
              <button
                key={site.id}
                onClick={() => onSelectSite(site.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedSite === site.id
                    ? 'border-blue-500 bg-blue-50'
                    : site.isAvailable
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{formatSiteLabel(site.id)}</span>
                  {selectedSite === site.id && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
                {site.lastUsed && (
                  <div className="text-xs mt-1">
                    {site.isAvailable ? (
                      <span className="text-green-600">
                        Available (used {daysAgo} days ago)
                      </span>
                    ) : (
                      <span className="text-red-600">
                        Wait {14 - (daysAgo || 0)} more days
                      </span>
                    )}
                  </div>
                )}
                {!site.lastUsed && (
                  <div className="text-xs text-gray-500 mt-1">
                    Never used
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rotation Warning */}
      {sites.some(s => !s.isAvailable && s.id === selectedSite) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Site Recently Used:</strong> This site was used less than 14 days ago. 
            Consider selecting a different site to prevent irritation and lumps.
          </p>
        </div>
      )}

      {/* Educational Information */}
      <InjectionEducation />
    </div>
  );
}
```

---

## 🚨 **SPECIFIC DEBUG REQUESTS**

### **HIGH PRIORITY ISSUES:**

1. **Firebase Functions Error Handling**: Are there potential infinite loops or memory leaks in the Grok API calls?

2. **React State Management**: Could the `useEffect` dependencies cause unnecessary re-renders or memory leaks?

3. **Async Race Conditions**: Are there places where components try to render data before async operations complete?

4. **TypeScript Type Safety**: Are there any `any` types that could cause runtime failures?

5. **Security Vulnerabilities**: Are the Firebase Functions properly sanitizing user input? Any injection attack vectors?

6. **Performance Bottlenecks**: Which components or operations could be optimized for better performance?

### **DEPLOYMENT CONCERNS:**

1. **Environment Variables**: Is the `.env` handling production-ready?
2. **Error Boundaries**: Are errors properly caught and displayed to users?
3. **Mobile Responsiveness**: Any CSS or layout issues on mobile devices?
4. **Accessibility**: Are components properly accessible for screen readers?

---

## 📊 **CURRENT METRICS TO IMPROVE**

- **Page Load Time**: Currently 3.2s, target <2s
- **Firebase Function Cold Start**: Currently 5s, target <3s
- **Component Render Time**: Some components take >1s to render
- **Memory Usage**: App memory grows to 150MB+ after extended use

---

**PLEASE PROVIDE SPECIFIC, ACTIONABLE FIXES FOR ANY ISSUES YOU IDENTIFY.**

**Focus on production-critical bugs that could affect revenue or user experience.**