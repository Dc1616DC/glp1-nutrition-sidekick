'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';

export default function GettingStarted() {
  const { user } = useAuth();
  const router = useRouter();
  const [hasCompletedCalculator, setHasCompletedCalculator] = useState(false);
  const [hasSeenEducation, setHasSeenEducation] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/signin?redirect=getting-started');
      return;
    }

    // Check completion status
    const calculatorComplete = localStorage.getItem('calculatorComplete');
    const educationSeen = localStorage.getItem('educationSeen');
    
    setHasCompletedCalculator(!!calculatorComplete);
    setHasSeenEducation(!!educationSeen);
  }, [user, router]);

  const onboardingSteps = [
    {
      id: 'calculator',
      title: 'Set Your Nutrition Goals',
      description: 'Calculate your personalized protein and calorie targets for GLP-1 success',
      icon: '🎯',
      href: '/calculator',
      completed: hasCompletedCalculator,
      primary: true,
      estimatedTime: '3 minutes'
    },
    {
      id: 'education',
      title: 'Learn GLP-1 Nutrition Basics',
      description: 'Understand the key principles for optimal nutrition while on GLP-1 medications',
      icon: '📚',
      href: '/education',
      completed: hasSeenEducation,
      estimatedTime: '5 minutes'
    },
    {
      id: 'protein-guide',
      title: 'Explore Protein & Fiber Foods',
      description: 'Quick reference guide for high-protein and high-fiber food options',
      icon: '🥗',
      href: '/protein-fiber-foods',
      completed: false, // This is a reference, not a completion step
      estimatedTime: '2 minutes'
    }
  ];

  const completedSteps = onboardingSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / 2) * 100; // Only count calculator and education

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Getting Started
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Let's set up your personalized GLP-1 nutrition plan in just a few minutes
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Onboarding Steps */}
        <div className="space-y-6 mb-10">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`relative rounded-xl transition-all duration-200 ${
                step.primary && !step.completed
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
                  : step.completed
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-white border-2 border-gray-200 hover:shadow-md'
              }`}
            >
              <Link href={step.href}>
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className={`text-4xl mr-4 ${
                          step.primary && !step.completed ? 'animate-pulse' : ''
                        }`}>
                          {step.icon}
                        </div>
                        <div>
                          <h2 className={`text-2xl font-bold mb-2 ${
                            step.primary && !step.completed ? 'text-white' : 
                            step.completed ? 'text-green-800' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </h2>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm ${
                              step.primary && !step.completed ? 'text-blue-100' : 
                              step.completed ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {step.estimatedTime}
                            </span>
                            {step.completed && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Complete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className={`mb-4 text-lg ${
                        step.primary && !step.completed ? 'text-blue-100' : 
                        step.completed ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {step.description}
                      </p>
                      
                      <div className={`inline-flex items-center font-semibold ${
                        step.primary && !step.completed ? 'text-white' : 
                        step.completed ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {step.completed ? 'Review' : 'Start Now'}
                        <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        {progressPercentage === 100 ? (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-center text-white">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Great job! You're all set up!</h2>
            <p className="text-green-100 mb-6">
              Your GLP-1 nutrition foundation is complete. Ready to start optimizing your meals?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/meal-generator"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Generate Your First Meal
              </Link>
              <Link
                href="/"
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              💡 Why These Steps Matter
            </h3>
            <p className="text-blue-700">
              These foundational steps ensure you get the most out of your GLP-1 medication by 
              understanding your unique nutritional needs and having the knowledge to make informed food choices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}