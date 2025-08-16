'use client';

import { useState, useEffect } from 'react';
import { nutritionInsights } from '../data/nutritionInsights';
import NutritionInsights from './NutritionInsights';

interface NutritionOnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
  isNewUser?: boolean;
}

export default function NutritionOnboarding({ 
  onComplete, 
  onSkip,
  isNewUser = true 
}: NutritionOnboardingProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const seen = localStorage.getItem('nutritionOnboardingSeen');
    if (seen) {
      setHasSeenOnboarding(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('nutritionOnboardingSeen', 'true');
    setHasSeenOnboarding(true);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem('nutritionOnboardingSeen', 'skipped');
    setHasSeenOnboarding(true);
    onSkip?.();
  };

  // Don't show if user has already seen it (unless forced for new users)
  if (hasSeenOnboarding && !isNewUser) {
    return null;
  }

  if (showDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your GLP-1 Nutrition Guide</h2>
              <button
                onClick={handleComplete}
                className="text-gray-500 hover:text-gray-700 text-2xl font-light p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <NutritionInsights />
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleComplete}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Got it! Let's start building healthy meals
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-8 text-center">
        <div className="mb-6">
          <div className="text-5xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome to Your GLP-1 Nutrition Journey!
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We've prepared <strong>10 essential nutrition tips</strong> to help you make the most 
            of your GLP-1 medication and adapt to your changing eating habits. These evidence-based 
            insights come from real experience with patients just like you.
          </p>
        </div>

        <div className="mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">You'll discover:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>How to prioritize protein (15-30g per meal) to preserve muscle and metabolism</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Smart strategies for managing side effects and low appetite days</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Practical tips for staying nourished when food feels challenging</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>How to tune into your body's new hunger and fullness signals</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowDetails(true)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Show Me the Nutrition Tips
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm"
          >
            I'll explore these later
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          💡 You can always find these tips in the Education section of the app
        </div>
      </div>
    </div>
  );
}