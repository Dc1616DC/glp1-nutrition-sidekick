'use client';

import { useState, useEffect } from 'react';

export interface UserProfile {
  medication: string;
  experience: 'new' | 'experienced' | 'struggling';
  primaryConcerns: string[];
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Load profile from localStorage on mount
    try {
      const savedProfile = localStorage.getItem('glp1-user-profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, []);

  const updateProfile = (newProfile: UserProfile) => {
    try {
      localStorage.setItem('glp1-user-profile', JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const clearProfile = () => {
    try {
      localStorage.removeItem('glp1-user-profile');
      setProfile(null);
    } catch (error) {
      console.error('Error clearing user profile:', error);
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
    updateProfile,
    clearProfile,
    hasNauseaConcern,
    hasConstipationConcern,
    hasFatigueConcern,
    isNewUser,
    isStruggling,
    getMedicationInfo
  };
}