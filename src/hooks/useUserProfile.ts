'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';

export interface UserProfile {
  medication: string;
  experience: 'new' | 'experienced' | 'struggling';
  primaryConcerns: string[];
  calculatorComplete?: boolean;
  educationSeen?: boolean;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        console.log('🔥 No user - clearing profile');
        setProfile(null);
        setLoading(false);
        return;
      }

      console.log('🔥 Loading profile for user:', user.uid);

      try {
        const docRef = doc(db, 'userProfiles', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          console.log('🔥 Profile loaded from Firebase:', profileData);
          setProfile(profileData);
        } else {
          console.log('🔥 No profile document exists - setting null');
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ Error loading user profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    console.log('🔥 updateProfile called with:', newProfile);
    console.log('🔥 Current profile:', profile);

    try {
      // Handle null profile case - use empty object as base
      const currentProfile = profile || {};
      const updatedProfile = { ...currentProfile, ...newProfile };
      console.log('🔥 Updated profile to save:', updatedProfile);
      
      const docRef = doc(db, 'userProfiles', user.uid);
      await setDoc(docRef, updatedProfile, { merge: true });
      console.log('🔥 Profile saved to Firebase successfully');
      
      setProfile(updatedProfile as UserProfile);
      console.log('🔥 Local profile state updated');
    } catch (error) {
      console.error('❌ Error saving user profile:', error);
    }
  };

  const clearProfile = async () => {
    if (!user) return;
    
    try {
      setProfile(null);
      // Note: We don't delete the document, just clear local state
      // The document can remain for data persistence
    } catch (error) {
      console.error('Error clearing user profile:', error);
    }
  };

  // Helper function to update onboarding completion
  const updateOnboardingProgress = async (updates: { 
    calculatorComplete?: boolean; 
    educationSeen?: boolean;
  }) => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'userProfiles', user.uid);
      const currentProfile = profile || {};
      const updatedProfile = { ...currentProfile, ...updates };
      
      await setDoc(docRef, updatedProfile, { merge: true });
      setProfile(updatedProfile as UserProfile);
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
    }
  };

  // Helper functions for common checks
  const hasNauseaConcern = () => profile?.primaryConcerns.includes('nausea') || false;
  const hasConstipationConcern = () => profile?.primaryConcerns.includes('constipation') || false;
  const hasFatigueConcern = () => profile?.primaryConcerns.includes('fatigue') || false;
  const isNewUser = () => profile?.experience === 'new';
  const isStruggling = () => profile?.experience === 'struggling';
  
  // Get medication-specific info
  const getMedicationInfo = () => {
    if (!profile?.medication) return null;
    
    const medicationData: Record<string, any> = {
      ozempic: {
        name: 'Ozempic',
        frequency: 'weekly',
        commonSideEffects: ['nausea', 'vomiting', 'diarrhea'],
        tips: 'Start with a low dose and gradually increase'
      },
      mounjaro: {
        name: 'Mounjaro',
        frequency: 'weekly',
        commonSideEffects: ['nausea', 'decreased appetite', 'constipation'],
        tips: 'Take with or without food, but be consistent'
      },
      wegovy: {
        name: 'Wegovy',
        frequency: 'weekly',
        commonSideEffects: ['nausea', 'diarrhea', 'vomiting'],
        tips: 'Inject on the same day each week'
      },
      rybelsus: {
        name: 'Rybelsus',
        frequency: 'daily',
        commonSideEffects: ['nausea', 'decreased appetite', 'diarrhea'],
        tips: 'Take on empty stomach with plain water'
      },
      zepbound: {
        name: 'Zepbound',
        frequency: 'weekly',
        commonSideEffects: ['nausea', 'diarrhea', 'decreased appetite'],
        tips: 'Rotate injection sites to prevent irritation'
      },
      other: {
        name: 'GLP-1 Medication',
        frequency: 'varies',
        commonSideEffects: ['nausea', 'GI issues'],
        tips: 'Follow your healthcare provider instructions'
      }
    };
    
    return medicationData[profile.medication] || medicationData.other;
  };

  return {
    profile,
    loading,
    updateProfile,
    clearProfile,
    updateOnboardingProgress,
    hasNauseaConcern,
    hasConstipationConcern,
    hasFatigueConcern,
    isNewUser,
    isStruggling,
    getMedicationInfo
  };
}