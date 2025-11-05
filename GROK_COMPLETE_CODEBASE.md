# GLP-1 Nutrition Sidekick - Complete Codebase for Grok Analysis

## 📁 Project Structure
```
glp1-nutrition-sidekick/
├── src/
│   ├── app/                    # Next.js 15 app router pages
│   ├── components/              # React components
│   │   ├── injection-tracker/  # Injection tracking system
│   │   └── onboarding/         # User onboarding flow
│   ├── context/                # React contexts
│   ├── firebase/               # Firebase configuration
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # Business logic & APIs
│   ├── types/                  # TypeScript definitions
│   └── utils/                  # Utility functions
├── public/                     # Static assets & PWA files
├── firestore.rules            # Security rules
├── package.json               # Dependencies
└── CLAUDE.md                  # Project documentation
```

## 🔴 CRITICAL FILES WITH ACTIVE ISSUES

### 1. **Firestore Injection Service** (Data Persistence Errors)
`src/services/firestoreInjectionService.ts`
```typescript
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Injection, DoseSchedule, InjectionSite } from '@/types/injection';

class FirestoreInjectionService {
  private readonly SITE_ROTATION_DAYS = 14;
  private userId: string | null = null;

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  async saveInjection(injection: Omit<Injection, 'id'>): Promise<Injection> {
    if (!this.userId) throw new Error('User not authenticated');
    
    const newInjection: Injection = {
      ...injection,
      id: `inj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    try {
      const injectionRef = doc(db, 'userInjections', this.userId, 'injections', newInjection.id);
      // RECENT FIX: Clean undefined fields
      const cleanedData = {
        ...newInjection,
        timestamp: Timestamp.fromDate(newInjection.timestamp),
        userId: this.userId
      };
      
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === undefined) {
          delete cleanedData[key];
        }
      });
      
      await setDoc(injectionRef, cleanedData);
      return newInjection;
    } catch (error) {
      console.error('Error saving injection to Firestore:', error);
      throw error;
    }
  }

  // ... other methods
}
```

### 2. **Hybrid Injection Service** (Async Race Conditions)
`src/services/injectionService.ts`
```typescript
import { Injection, DoseSchedule, InjectionSite } from '@/types/injection';
import { firestoreInjectionService } from './firestoreInjectionService';
import { auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

class InjectionService {
  private readonly STORAGE_KEY = 'glp1_injections';
  private readonly DOSE_SCHEDULE_KEY = 'glp1_dose_schedule';
  private useFirestore = false;
  private currentUserId: string | null = null;
  private migrationInProgress = false;

  constructor() {
    if (typeof window !== 'undefined') {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.currentUserId = user.uid;
          this.useFirestore = true;
          firestoreInjectionService.setUserId(user.uid);
          
          if (!this.migrationInProgress) {
            this.migrationInProgress = true;
            try {
              await firestoreInjectionService.migrateFromLocalStorage();
              console.log('Successfully migrated injection data to Firestore');
            } catch (error) {
              console.error('Migration failed, continuing with hybrid mode:', error);
            } finally {
              this.migrationInProgress = false;
            }
          }
        } else {
          this.currentUserId = null;
          this.useFirestore = false;
          firestoreInjectionService.setUserId(null);
        }
      });
    }
  }

  // ISSUE: Many components call this expecting sync, but it's async
  async getInjections(): Promise<Injection[]> {
    if (this.useFirestore && this.currentUserId) {
      return await firestoreInjectionService.getInjections();
    }
    
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    const injections = JSON.parse(stored);
    return injections.map((inj: any) => ({
      ...inj,
      timestamp: new Date(inj.timestamp)
    }));
  }

  // ... other methods
}

export const injectionService = new InjectionService();
```

### 3. **Authentication Context** (Data Migration Trigger)
`src/context/AuthContext.tsx`
```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase/config";
import { dataMigrationService } from "../services/dataMigrationService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // CRITICAL: Automatic data migration on login
      if (user) {
        try {
          const needsMigration = await dataMigrationService.isMigrationNeeded(user.uid);
          if (needsMigration) {
            console.log('Starting data migration for user:', user.uid);
            const result = await dataMigrationService.migrateAllData(user.uid);
            if (result.success) {
              console.log('Data migration completed successfully:', result.migratedItems);
            } else {
              console.error('Data migration had errors:', result.errors);
            }
          }
        } catch (error) {
          console.error('Failed to check/perform data migration:', error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ... rest of component
};
```

### 4. **Body Map Component** (Async Loading Issues)
`src/components/injection-tracker/BodyMap.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { injectionService } from '@/services/injectionService';
import { InjectionSite } from '@/types/injection';

export default function BodyMap({ selectedSite, onSelectSite }: BodyMapProps) {
  const [sites, setSites] = useState<InjectionSite[]>([]);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const injectionSites = await injectionService.getInjectionSites();
        setSites(injectionSites);
      } catch (error) {
        console.error('Error loading injection sites:', error);
        setSites([]);
      }
    };
    
    loadSites();
  }, []);

  // ISSUE: sites.map() was failing when sites was undefined
  return (
    <div className="space-y-4">
      {sites.map((site) => (
        <button key={site.id} onClick={() => onSelectSite(site.id)}>
          {/* ... */}
        </button>
      ))}
    </div>
  );
}
```

### 5. **Adaptive Analytics Service** (Null Reference Errors)
`src/services/adaptiveAnalyticsService.ts`
```typescript
export class AdaptiveAnalyticsService {
  async getRelevantSymptomData(userId: string): Promise<WeightedSymptomLog[]> {
    try {
      // ISSUE: Not checking if injections exist
      const injections = await injectionService.getInjections();
      if (!injections || injections.length === 0) {
        return [];
      }
      const currentDose = injections[0]?.dose || 0;
      const currentMedication = injections[0]?.medication || '';
      
      // ... rest of method
    } catch (error) {
      console.error('Error getting relevant symptom data:', error);
      return [];
    }
  }

  private getAdaptiveAnalysisWindow(injections: Injection[]): number {
    // ISSUE: Not handling null/undefined injections properly
    if (!injections || injections.length === 0) return 60;
    
    const lastInjection = injections[0];
    if (!lastInjection || !lastInjection.medication) return 60;
    
    const isDaily = lastInjection.medication === 'saxenda' || 
                    lastInjection.medication === 'victoza';
    // ... rest of method
  }
}
```

## 🔒 SECURITY RULES
`firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // ISSUE: Very restrictive validation causing permission errors
    function isValidUserProfile(data) {
      return data.keys().hasOnly(['uid', 'email', 'tdee', 'targetCalories', 'proteinGoal', 
                                 'dietaryRestrictions', 'mealPreferences', 'notificationSettings', 'fcmTokens',
                                 'medication', 'experience', 'primaryConcerns', 'calculatorComplete', 'educationSeen', 
                                 'proteinGuideViewed', 'onboardingCompleted', 'onboardingSkipped', 'onboardingCompletedAt',
                                 'nutritionOnboardingSeen', 'migrationCompleted', 'migrationDate', 'userId',
                                 'migratedItems', 'errors', 'updatedAt', 'eveningToolkit']) &&
             // ... validation for each field
    }

    match /userInjections/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && request.resource.data.userId == userId;
      allow update: if isOwner(userId) && request.resource.data.userId == userId;
      allow delete: if isOwner(userId);
      
      match /injections/{injectionId} {
        allow read: if isOwner(userId);
        allow create: if isOwner(userId) && 
                        request.resource.data.userId == request.auth.uid &&
                        request.resource.data.keys().hasAll(['timestamp', 'site', 'dose', 'medication']);
        allow update: if isOwner(userId);
        allow delete: if isOwner(userId);
      }
    }
  }
}
```

## 📦 TYPE DEFINITIONS
`src/types/injection.ts`
```typescript
export interface Injection {
  id: string;
  timestamp: Date;
  site: string;
  dose: number;
  medication: 'ozempic' | 'mounjaro' | 'wegovy' | 'saxenda' | 'victoza' | 'rybelsus' | 'zepbound';
  notes?: string; // Optional - causing Firestore issues when undefined
  userId?: string;
}

export interface DoseSchedule {
  startDate: Date;
  dose: number;
  medication: string;
  nextEscalationDate?: Date;
}

export interface InjectionSite {
  id: string;
  label: string;
  isAvailable: boolean;
  lastUsed?: Date;
  coordinates: { x: number; y: number };
}

export const MEDICATION_INFO = {
  ozempic: {
    name: 'Ozempic',
    color: '#00897b',
    frequency: 'weekly',
    doses: [0.25, 0.5, 1.0, 2.0],
    unit: 'mg'
  },
  mounjaro: {
    name: 'Mounjaro',
    color: '#8e24aa',
    frequency: 'weekly',
    doses: [2.5, 5, 7.5, 10, 12.5, 15],
    unit: 'mg'
  },
  // ... other medications
};
```

## 🚨 CURRENT ERROR PATTERNS

### Console Errors When Logging Injections:
```
1. FirebaseError: Function setDoc() called with invalid data. 
   Unsupported field value: undefined (found in field notes)

2. TypeError: can't access property "medication", t is undefined
   at adaptiveAnalyticsService.getRelevantSymptomData()

3. TypeError: r.map is not a function
   at BodyMap component (FIXED but may recur)

4. Error saving injection to Firestore: FirebaseError
   Multiple write failures due to undefined fields
```

### Root Causes:
1. **Optional fields** becoming `undefined` instead of being omitted
2. **Async operations** not properly awaited in components
3. **Type safety** issues with optional properties
4. **Race conditions** during data migration
5. **Null checks** missing in critical paths

## 📊 DATA FLOW ARCHITECTURE

```
User Action
    ↓
React Component
    ↓
Service Layer (injectionService)
    ↓
Auth Check → Firestore (if authenticated)
           ↘
            localStorage (fallback)
    ↓
Data Migration Service (on login)
    ↓
Firestore Persistence
```

## 🔧 PACKAGE.JSON DEPENDENCIES
```json
{
  "name": "glp1-nutrition-sidekick",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.3.5",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "firebase": "^10.7.1",
    "typescript": "^5.3.3",
    "@types/react": "^19.0.14",
    "@types/node": "^20.10.5",
    "tailwindcss": "^3.4.1",
    "axios": "^1.6.2",
    "openai": "^4.52.1"
  }
}
```

## 🎯 KEY ISSUES FOR GROK TO ANALYZE

1. **Data Validation Pipeline**: Need consistent undefined/null handling
2. **Async/Await Patterns**: Components expect sync data from async sources
3. **Type Safety**: Optional fields causing runtime errors
4. **Error Boundaries**: No graceful error recovery
5. **State Management**: Complex state across localStorage/Firestore
6. **Performance**: Multiple redundant API calls and re-renders
7. **Security**: Firestore rules too restrictive, causing failures
8. **Testing**: No test coverage for critical paths

## 💡 SPECIFIC QUESTIONS FOR GROK

1. How can we implement a robust data validation layer that handles undefined/null gracefully?
2. What's the best pattern for migrating from sync localStorage to async Firestore without breaking components?
3. Should we use React Query or SWR for better async state management?
4. How can we implement proper error boundaries for healthcare data?
5. What's the optimal Firestore structure for this healthcare data model?
6. How can we add comprehensive TypeScript strict null checks without breaking existing code?
7. What testing strategy would catch these async/type issues before production?

## 🚀 DESIRED OUTCOMES

1. **Zero runtime errors** in production
2. **100% data persistence** reliability
3. **< 2s load time** for all pages
4. **Offline-first** with seamless sync
5. **Type-safe** throughout the codebase
6. **Healthcare compliant** data handling
7. **Scalable** to 100k+ users