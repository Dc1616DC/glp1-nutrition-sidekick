'use client';

import { useState } from 'react';
import OnboardingWelcome from '../../components/onboarding/OnboardingWelcome';
import OnboardingFeaturePreview from '../../components/onboarding/OnboardingFeaturePreview';
import GLP1EducationOnboarding from '../../components/GLP1EducationOnboarding';

export default function OnboardingDemo() {
  const [currentPhase, setCurrentPhase] = useState<'welcome' | 'preview' | 'education'>('welcome');
  const [selectedMedication, setSelectedMedication] = useState('ozempic');
  const [userProfile, setUserProfile] = useState<any>(null);

  const handleWelcomeComplete = (medication: string, profile: any) => {
    setSelectedMedication(medication);
    setUserProfile(profile);
    setCurrentPhase('preview');
  };

  const handlePreviewComplete = () => {
    setCurrentPhase('education');
  };

  const handleEducationComplete = () => {
    alert('🎉 Onboarding Complete! In the real app, users would now see the main dashboard.');
  };

  const handleSkip = () => {
    alert('⏭️ Skipped! In the real app, users would go directly to the main dashboard.');
  };

  return (
    <div className="min-h-screen">
      {/* Demo Controls */}
      <div className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-2">🎭 Demo Controls</h3>
        <div className="space-y-2">
          <button
            onClick={() => setCurrentPhase('welcome')}
            className={`block w-full text-left px-3 py-1 rounded ${
              currentPhase === 'welcome' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
            }`}
          >
            1. Welcome & Setup
          </button>
          <button
            onClick={() => {
              setSelectedMedication('ozempic');
              setCurrentPhase('preview');
            }}
            className={`block w-full text-left px-3 py-1 rounded ${
              currentPhase === 'preview' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
            }`}
          >
            2. Feature Preview
          </button>
          <button
            onClick={() => setCurrentPhase('education')}
            className={`block w-full text-left px-3 py-1 rounded ${
              currentPhase === 'education' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
            }`}
          >
            3. Education
          </button>
        </div>
        <div className="mt-3 pt-2 border-t text-xs text-gray-600">
          Current: <strong>{currentPhase}</strong>
          <br />
          Med: <strong>{selectedMedication}</strong>
        </div>
      </div>

      {/* Onboarding Content */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
        {currentPhase === 'welcome' && (
          <OnboardingWelcome
            onComplete={handleWelcomeComplete}
            onSkip={handleSkip}
          />
        )}

        {currentPhase === 'preview' && (
          <OnboardingFeaturePreview
            selectedMedication={selectedMedication}
            onComplete={handlePreviewComplete}
            onSkip={handleSkip}
          />
        )}

        {currentPhase === 'education' && (
          <div className="p-6">
            <GLP1EducationOnboarding
              onComplete={handleEducationComplete}
              onSkip={handleSkip}
            />
          </div>
        )}
      </div>
    </div>
  );
}