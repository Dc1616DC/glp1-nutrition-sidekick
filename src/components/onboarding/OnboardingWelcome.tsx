'use client';

import { useState } from 'react';
import { MEDICATION_INFO } from '@/types/injection';

interface OnboardingWelcomeProps {
  onComplete: (selectedMedication: string, userProfile: UserProfile) => void;
  onSkip: () => void;
}

interface UserProfile {
  medication: string;
  experience: 'new' | 'experienced' | 'struggling';
  primaryConcerns: string[];
}

const MEDICATIONS = [
  { value: 'ozempic', label: 'Ozempic', subtitle: '(semaglutide)', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'mounjaro', label: 'Mounjaro', subtitle: '(tirzepatide)', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'wegovy', label: 'Wegovy', subtitle: '(semaglutide)', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'rybelsus', label: 'Rybelsus', subtitle: '(oral semaglutide)', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'zepbound', label: 'Zepbound', subtitle: '(tirzepatide)', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { value: 'other', label: 'Other GLP-1', subtitle: 'or planning to start', color: 'bg-gray-100 text-gray-800 border-gray-300' }
];

const EXPERIENCE_LEVELS = [
  {
    value: 'new',
    title: 'Just Starting',
    description: 'New to GLP-1 medications or starting soon',
    icon: '🌱',
    concerns: ['side effects', 'what to expect', 'meal planning']
  },
  {
    value: 'experienced', 
    title: 'Going Well',
    description: 'Using GLP-1 meds successfully, want to optimize',
    icon: '🎯',
    concerns: ['meal optimization', 'pattern tracking', 'long-term success']
  },
  {
    value: 'struggling',
    title: 'Need Support',
    description: 'Experiencing challenges or considering stopping',
    icon: '🤝',
    concerns: ['symptom management', 'nausea reduction', 'staying consistent']
  }
];

const ALL_CONCERNS = [
  { value: 'nausea', label: 'Nausea & Vomiting', emoji: '🤢' },
  { value: 'constipation', label: 'Constipation', emoji: '🚽' },
  { value: 'fatigue', label: 'Fatigue & Low Energy', emoji: '😴' },
  { value: 'meal-planning', label: 'Meal Planning', emoji: '🍽️' },
  { value: 'side-effects', label: 'Managing Side Effects', emoji: '⚕️' },
  { value: 'consistency', label: 'Staying Consistent', emoji: '📅' },
  { value: 'weight-plateau', label: 'Weight Plateaus', emoji: '📊' },
  { value: 'social-eating', label: 'Social Eating', emoji: '👥' },
  { value: 'nutrition', label: 'Getting Enough Nutrition', emoji: '🥗' },
  { value: 'injection-anxiety', label: 'Injection Anxiety', emoji: '💉' }
];

export default function OnboardingWelcome({ onComplete, onSkip }: OnboardingWelcomeProps) {
  const [step, setStep] = useState<'welcome' | 'medication' | 'experience' | 'concerns'>('welcome');
  const [selectedMedication, setSelectedMedication] = useState('');
  const [selectedExperience, setSelectedExperience] = useState<'new' | 'experienced' | 'struggling' | ''>('');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);

  const handleConcernToggle = (concern: string) => {
    setSelectedConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  const handleComplete = () => {
    const userProfile: UserProfile = {
      medication: selectedMedication,
      experience: selectedExperience as any,
      primaryConcerns: selectedConcerns
    };
    onComplete(selectedMedication, userProfile);
  };

  const canProceed = () => {
    switch (step) {
      case 'medication': return selectedMedication !== '';
      case 'experience': return selectedExperience !== '';
      case 'concerns': return selectedConcerns.length > 0;
      default: return true;
    }
  };

  const getPersonalizedMessage = () => {
    if (!selectedMedication || !selectedExperience) return '';
    
    const medicationInfo = MEDICATION_INFO[selectedMedication as keyof typeof MEDICATION_INFO];
    const experienceData = EXPERIENCE_LEVELS.find(e => e.value === selectedExperience);
    
    if (selectedExperience === 'struggling') {
      return `We understand ${medicationInfo?.name || 'GLP-1 medications'} can be challenging. You're not alone - our AI helps 87% of users reduce difficult symptoms.`;
    } else if (selectedExperience === 'new') {
      return `Starting ${medicationInfo?.name || 'GLP-1'} is a big step! We'll help you navigate the first few weeks with confidence and avoid common pitfalls.`;
    } else {
      return `Great to hear ${medicationInfo?.name || 'your medication'} is working well! Let's help you optimize your results and discover new insights.`;
    }
  };

  if (step === 'welcome') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-3xl text-white mx-auto mb-6">
            🚀
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your GLP-1 Journey Just Got Smarter
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            AI-powered insights designed to help you succeed with your GLP-1 medication
          </p>
        </div>

        {/* The Challenge */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-6">The Challenge with GLP-1 Medications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl text-amber-600 mb-2">⚠️</div>
                <div className="text-2xl font-bold text-amber-600 mb-1">60%</div>
                <div className="text-sm text-gray-700">of people stop due to side effects*</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl text-blue-600 mb-2">🤢</div>
                <div className="text-lg font-semibold text-blue-600 mb-1">Nausea</div>
                <div className="text-sm text-gray-700">is the #1 reported side effect*</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl text-purple-600 mb-2">❓</div>
                <div className="text-lg font-semibold text-purple-600 mb-1">Symptoms</div>
                <div className="text-sm text-gray-700">catch people off guard*</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl text-green-600 mb-2">🥗</div>
                <div className="text-lg font-semibold text-green-600 mb-1">Nutrition</div>
                <div className="text-sm text-gray-700">gaps lead to muscle loss & fatigue*</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4 italic">*Based on published research studies</p>
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            What if you could predict and minimize symptoms AND get personalized nutrition guidance?
          </h3>
          <p className="text-gray-600">
            That's exactly what our AI-powered system helps you do - predict and minimize side effects, maintain muscle, and know what to eat.
          </p>
        </div>

        {/* What Makes Us Different */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">What Makes Us Different</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🔮</span>
              <div>
                <strong>Predictive Insights</strong>
                <p className="text-gray-600">Know when symptoms will hit before they happen</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">💪</span>
              <div>
                <strong>Muscle-Preserving Nutrition</strong>
                <p className="text-gray-600">High-protein meal guidance to maintain muscle during weight loss</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">🥗</span>
              <div>
                <strong>Smart Meal Planning</strong>
                <p className="text-gray-600">Know exactly what to eat when appetite is suppressed</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <strong>Pattern Recognition</strong>
                <p className="text-gray-600">Discover your personal triggers and solutions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onSkip}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip Setup
          </button>
          <button
            onClick={() => setStep('medication')}
            className="flex-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all font-semibold"
          >
            Let's Get Started! →
          </button>
        </div>
      </div>
    );
  }

  if (step === 'medication') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Which medication are you using?</h2>
          <p className="text-gray-600">This helps us personalize your experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {MEDICATIONS.map((med) => (
            <button
              key={med.value}
              onClick={() => setSelectedMedication(med.value)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedMedication === med.value
                  ? med.color + ' border-current'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">{med.label}</div>
              <div className="text-sm opacity-75">{med.subtitle}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStep('welcome')}
            className="px-6 py-3 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <button
            onClick={() => setStep('experience')}
            disabled={!canProceed()}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  if (step === 'experience') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How's your experience so far?</h2>
          <p className="text-gray-600">Help us understand where you are in your journey</p>
        </div>

        <div className="space-y-4 mb-8">
          {EXPERIENCE_LEVELS.map((exp) => (
            <button
              key={exp.value}
              onClick={() => setSelectedExperience(exp.value as any)}
              className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                selectedExperience === exp.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <span className="text-3xl mr-4">{exp.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{exp.title}</h3>
                  <p className="text-gray-600 mb-3">{exp.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {exp.concerns.map((concern, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStep('medication')}
            className="px-6 py-3 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <button
            onClick={() => setStep('concerns')}
            disabled={!canProceed()}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  if (step === 'concerns') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What would you like help with?</h2>
          <p className="text-gray-600">Select your top concerns (choose 2-4)</p>
          
          {/* Personalized message */}
          {getPersonalizedMessage() && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">{getPersonalizedMessage()}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {ALL_CONCERNS.map((concern) => (
            <button
              key={concern.value}
              onClick={() => handleConcernToggle(concern.value)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedConcerns.includes(concern.value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{concern.emoji}</span>
                <span className="font-medium">{concern.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStep('experience')}
            className="px-6 py-3 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <button
            onClick={handleComplete}
            disabled={!canProceed()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            See Your Personalized Experience →
          </button>
        </div>
      </div>
    );
  }

  return null;
}