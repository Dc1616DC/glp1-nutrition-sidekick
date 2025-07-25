'use client';

import { useState, useEffect } from 'react';
import GLP1EducationOnboarding from './GLP1EducationOnboarding';

interface Props {
  children: React.ReactNode;
}

export default function OnboardingWrapper({ children }: Props) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding (client-side only)
    try {
      const hasCompletedOnboarding = localStorage.getItem('glp1-onboarding-completed');
      
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.log('localStorage not available, showing onboarding');
      setShowOnboarding(true);
    }
    
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem('glp1-onboarding-completed', 'true');
    } catch (error) {
      console.log('Failed to save onboarding completion status');
    }
    setShowOnboarding(false);
  };

  const handleSkipOnboarding = () => {
    try {
      localStorage.setItem('glp1-onboarding-completed', 'true');
    } catch (error) {
      console.log('Failed to save onboarding skip status');
    }
    setShowOnboarding(false);
  };

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your GLP-1 nutrition companion...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if not completed
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <GLP1EducationOnboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      </div>
    );
  }

  // Show main app
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      
      {/* Education Access Button */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setShowOnboarding(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Review GLP-1 Nutrition Education"
        >
          🎓
        </button>
      </div>
    </div>
  );
}