'use client';

import { useState } from 'react';
import GLP1EducationOnboarding from '../GLP1EducationOnboarding';

interface Props {
  children: React.ReactNode;
}

export default function EnhancedOnboardingWrapper({ children }: Props) {
  const [showEducation, setShowEducation] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {showEducation ? (
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <GLP1EducationOnboarding
              onComplete={() => setShowEducation(false)}
              onSkip={() => setShowEducation(false)}
            />
          </div>
        </div>
      ) : (
        <>
          {children}
          <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={() => setShowEducation(true)}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-3 rounded-full shadow-lg hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105"
              title="Review GLP-1 Education"
            >
              🎓
            </button>
          </div>
        </>
      )}
    </div>
  );
}
