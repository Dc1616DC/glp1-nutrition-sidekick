'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';

export default function GettingStarted() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile();
  const router = useRouter();
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [medicationForm, setMedicationForm] = useState({
    medication: '',
    experience: 'new' as 'new' | 'experienced' | 'struggling',
    primaryConcerns: [] as string[]
  });

  // Pre-populate form with existing profile data
  useEffect(() => {
    if (profile) {
      setMedicationForm({
        medication: profile.medication || '',
        experience: profile.experience || 'new',
        primaryConcerns: profile.primaryConcerns || []
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) {
      router.push('/signin?redirect=getting-started');
      return;
    }

    // Show medication form only if no profile exists (excluding completion fields)
    // This prevents showing medication form after calculator completion
    if (!loading && (!profile || !profile.medication)) {
      setShowMedicationForm(true);
    }
  }, [user, profile, loading, router]);

  const onboardingSteps = [
    {
      id: 'medication',
      title: 'Tell Us About Your Medication',
      description: 'Help us personalize your experience based on your GLP-1 medication and journey',
      icon: '💊',
      href: '#',
      onClick: () => setShowMedicationForm(true),
      completed: !!profile,
      primary: !profile,
      estimatedTime: '2 minutes'
    },
    {
      id: 'calculator',
      title: 'Set Your Nutrition Goals',
      description: 'Calculate your personalized protein and calorie targets for GLP-1 success',
      icon: '🎯',
      href: '/calculator',
      completed: !!profile?.calculatorComplete,
      primary: !!profile && !profile?.calculatorComplete,
      estimatedTime: '3 minutes'
    },
    {
      id: 'education',
      title: 'Learn GLP-1 Nutrition Basics',
      description: 'Understand the key principles for optimal nutrition while on GLP-1 medications',
      icon: '📚',
      href: '/education',
      completed: !!profile?.educationSeen,
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
  const progressPercentage = (completedSteps / 3) * 100; // Count medication, calculator, and education

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
    <div className="bg-gray-50 py-4 sm:py-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            🎯 Getting Started
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6">
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
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-10">
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
              {step.href !== '#' ? (
                <Link href={step.href}>
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3 sm:mb-4">
                          <div className={`text-3xl sm:text-4xl mr-3 sm:mr-4 ${
                            step.primary && !step.completed ? 'animate-pulse' : ''
                          }`}>
                            {step.icon}
                          </div>
                          <div>
                            <h2 className={`text-xl sm:text-2xl font-bold mb-1 sm:mb-2 ${
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
                        
                        <p className={`mb-3 sm:mb-4 text-base sm:text-lg ${
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
              ) : (
                <div className="p-4 sm:p-6 lg:p-8 cursor-pointer" onClick={step.onClick}>
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
              )}
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

        {/* Medication Form Modal */}
        {showMedicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 my-8 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Tell Us About Your GLP-1 Journey
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                updateProfile(medicationForm);
                setShowMedicationForm(false);
              }} className="space-y-4">
                {/* Medication Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Which GLP-1 medication are you taking?
                  </label>
                  <select
                    value={medicationForm.medication}
                    onChange={(e) => setMedicationForm(prev => ({ ...prev, medication: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select your medication</option>
                    <option value="ozempic">Ozempic</option>
                    <option value="mounjaro">Mounjaro</option>
                    <option value="wegovy">Wegovy</option>
                    <option value="rybelsus">Rybelsus</option>
                    <option value="zepbound">Zepbound</option>
                    <option value="other">Other GLP-1 medication</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you describe your experience with this medication?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'new', label: 'New - Just started or starting soon', icon: '🌱' },
                      { value: 'experienced', label: 'Experienced - Been taking it for a while', icon: '⭐' },
                      { value: 'struggling', label: 'Struggling - Having side effects or challenges', icon: '💪' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="experience"
                          value={option.value}
                          checked={medicationForm.experience === option.value}
                          onChange={(e) => setMedicationForm(prev => ({ ...prev, experience: e.target.value as any }))}
                          className="mr-3"
                        />
                        <span className="mr-2">{option.icon}</span>
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Primary Concerns */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What are your main concerns or goals? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: 'nausea', label: 'Managing nausea', icon: '🤢' },
                      { value: 'constipation', label: 'Managing constipation', icon: '😓' },
                      { value: 'fatigue', label: 'Managing fatigue/low energy', icon: '😴' },
                      { value: 'protein', label: 'Getting enough protein', icon: '🥩' },
                      { value: 'weight-loss', label: 'Optimizing weight loss', icon: '⚖️' },
                      { value: 'meal-planning', label: 'Meal planning and prep', icon: '📝' }
                    ].map((concern) => (
                      <label key={concern.value} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          value={concern.value}
                          checked={medicationForm.primaryConcerns.includes(concern.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMedicationForm(prev => ({
                                ...prev,
                                primaryConcerns: [...prev.primaryConcerns, concern.value]
                              }));
                            } else {
                              setMedicationForm(prev => ({
                                ...prev,
                                primaryConcerns: prev.primaryConcerns.filter(c => c !== concern.value)
                              }));
                            }
                          }}
                          className="mr-3"
                        />
                        <span className="mr-2">{concern.icon}</span>
                        <span>{concern.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMedicationForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!medicationForm.medication}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Save & Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}