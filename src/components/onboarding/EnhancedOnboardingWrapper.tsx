'use client';

import { useState, useEffect } from 'react';
import OnboardingWelcome from './OnboardingWelcome';
import OnboardingFeaturePreview from './OnboardingFeaturePreview';
import GLP1EducationOnboarding from '../GLP1EducationOnboarding';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../context/AuthContext';

interface UserProfile {
  medication: string;
  experience: 'new' | 'experienced' | 'struggling';
  primaryConcerns: string[];
}

interface Props {
  children: React.ReactNode;
}

export default function EnhancedOnboardingWrapper({ children }: Props) {
  const [currentPhase, setCurrentPhase] = useState<'loading' | 'welcome' | 'preview' | 'education' | 'complete'>('loading');
  const [localUserProfile, setLocalUserProfile] = useState<UserProfile | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<string>('');
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();

  useEffect(() => {
    // Check if user has completed onboarding based on Firestore profile
    if (authLoading || profileLoading) {
      setCurrentPhase('loading');
      return;
    }

    if (!user) {
      // For unauthenticated users, check localStorage as fallback
      try {
        const hasCompletedOnboarding = localStorage.getItem('glp1-enhanced-onboarding-completed');
        const hasSkippedOnboarding = localStorage.getItem('glp1-onboarding-skipped');
        
        if (hasCompletedOnboarding || hasSkippedOnboarding) {
          setCurrentPhase('complete');
        } else {
          setCurrentPhase('welcome');
        }
      } catch (error) {
        console.log('localStorage not available, showing onboarding');
        setCurrentPhase('welcome');
      }
    } else {
      // For authenticated users, check Firestore profile
      const isOnboardingComplete = profile?.medication && 
                                   profile?.experience && 
                                   (profile?.onboardingCompleted || profile?.onboardingSkipped);
      
      if (isOnboardingComplete) {
        setCurrentPhase('complete');
      } else {
        setCurrentPhase('welcome');
      }
    }
  }, [user, authLoading, profileLoading, profile]);

  const handleWelcomeComplete = async (medication: string, profileData: UserProfile) => {
    setSelectedMedication(medication);
    setLocalUserProfile(profileData);
    
    // Save to Firestore if user is authenticated
    if (user) {
      await updateProfile({
        medication: profileData.medication,
        experience: profileData.experience,
        primaryConcerns: profileData.primaryConcerns
      });
    }
    
    setCurrentPhase('preview');
  };

  const handlePreviewComplete = () => {
    // For users who are struggling or new, show education
    const experienceToCheck = localUserProfile?.experience || profile?.experience;
    if (experienceToCheck === 'struggling' || experienceToCheck === 'new') {
      setCurrentPhase('education');
    } else {
      // Experienced users can skip straight to the app
      handleFinalComplete();
    }
  };

  const handleEducationComplete = () => {
    handleFinalComplete();
  };

  const handleFinalComplete = async () => {
    try {
      // Save to Firestore if user is authenticated
      if (user) {
        await updateProfile({
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString()
        });
      } else {
        // Fallback to localStorage for unauthenticated users
        localStorage.setItem('glp1-enhanced-onboarding-completed', 'true');
        // Store user profile for personalization
        if (localUserProfile) {
          localStorage.setItem('glp1-user-profile', JSON.stringify(localUserProfile));
        }
      }
      // Remove old onboarding flag if it exists
      localStorage.removeItem('glp1-onboarding-completed');
    } catch (error) {
      console.log('Failed to save onboarding completion status');
    }
    setCurrentPhase('complete');
  };

  const handleSkipAll = async () => {
    try {
      if (user) {
        await updateProfile({
          onboardingSkipped: true,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString()
        });
      } else {
        // Fallback to localStorage for unauthenticated users
        localStorage.setItem('glp1-onboarding-skipped', 'true');
        localStorage.setItem('glp1-enhanced-onboarding-completed', 'true');
      }
    } catch (error) {
      console.log('Failed to save onboarding skip status');
    }
    setCurrentPhase('complete');
  };

  const handleSkipToEducation = () => {
    setCurrentPhase('education');
  };

  // Show loading state briefly
  if (currentPhase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-2xl text-white mb-4 animate-pulse">
            🚀
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your GLP-1 companion...</p>
        </div>
      </div>
    );
  }

  // Welcome Phase
  if (currentPhase === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <OnboardingWelcome 
          onComplete={handleWelcomeComplete}
          onSkip={handleSkipAll}
        />
      </div>
    );
  }

  // Feature Preview Phase
  if (currentPhase === 'preview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <OnboardingFeaturePreview
          selectedMedication={selectedMedication}
          onComplete={handlePreviewComplete}
          onSkip={handleSkipToEducation}
        />
      </div>
    );
  }

  // Education Phase
  if (currentPhase === 'education') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Progress indicator */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {userProfile?.experience === 'struggling' 
                    ? 'Essential nutrition guidance to help you succeed'
                    : 'Learn the fundamentals for long-term success'
                  }
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-500 ml-2">Final step</span>
                </div>
              </div>
            </div>
          </div>

          <GLP1EducationOnboarding 
            onComplete={handleEducationComplete}
            onSkip={handleFinalComplete}
          />
        </div>
      </div>
    );
  }

  // Show main app
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      
      {/* Enhanced Education Access Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setCurrentPhase('education')}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-3 rounded-full shadow-lg hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105"
            title="Review GLP-1 Education & Setup"
          >
            🎓
          </button>
          
          {/* Welcome back message for new users */}
          {(profile || localUserProfile) && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-3 text-xs max-w-xs opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              <div className="font-medium text-gray-800 mb-1">
                Welcome back, {(profile?.medication || localUserProfile?.medication)} user! 👋
              </div>
              <div className="text-gray-600">
                Tap to review education or adjust your preferences
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}