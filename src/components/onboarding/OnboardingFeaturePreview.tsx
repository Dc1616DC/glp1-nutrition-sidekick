'use client';

import { useState, useEffect } from 'react';
import { MEDICATION_INFO } from '@/types/injection';

interface OnboardingFeaturePreviewProps {
  selectedMedication: string;
  onComplete: () => void;
  onSkip: () => void;
}

const DEMO_DATA = {
  ozempic: {
    userName: "Sarah",
    peakWindow: "1-3 days",
    commonSymptoms: ["nausea", "fatigue", "constipation"],
    mealSuggestion: "High-protein, low-fat Greek yogurt parfait",
    injectionSites: ["abdomen", "thigh"]
  },
  mounjaro: {
    userName: "Jessica",
    peakWindow: "1-2 days", 
    commonSymptoms: ["nausea", "bloating", "heartburn"],
    mealSuggestion: "Gentle chicken and rice bowl",
    injectionSites: ["abdomen", "arm"]
  },
  wegovy: {
    userName: "Mike",
    peakWindow: "2-3 days",
    commonSymptoms: ["nausea", "fatigue", "dizziness"],
    mealSuggestion: "Protein smoothie with banana",
    injectionSites: ["thigh", "abdomen"]
  }
};

export default function OnboardingFeaturePreview({ selectedMedication, onComplete, onSkip }: OnboardingFeaturePreviewProps) {
  const [currentPreview, setCurrentPreview] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);
  
  const demoData = DEMO_DATA[selectedMedication as keyof typeof DEMO_DATA] || DEMO_DATA.ozempic;
  const medicationInfo = MEDICATION_INFO[selectedMedication as keyof typeof MEDICATION_INFO];

  const previews = [
    {
      id: 'prediction',
      title: 'Predictive Symptom Insights',
      icon: '🔮',
      description: `See how we predicted ${demoData.userName}'s symptoms`
    },
    {
      id: 'injection-tracking', 
      title: 'Smart Injection Tracking',
      icon: '💉',
      description: 'Visual site rotation with personalized recommendations'
    },
    {
      id: 'meal-intelligence',
      title: 'AI Meal Intelligence', 
      icon: '🧠',
      description: 'Meals optimized for your symptoms and medication timing'
    }
  ];

  const currentPreviewData = previews[currentPreview];

  useEffect(() => {
    if (currentPreviewData.id === 'prediction') {
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % 4);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [currentPreview, currentPreviewData.id]);

  const handleNext = () => {
    if (currentPreview < previews.length - 1) {
      setCurrentPreview(prev => prev + 1);
      setAnimationPhase(0);
    } else {
      onComplete();
    }
  };

  const renderPreviewContent = () => {
    switch (currentPreviewData.id) {
      case 'prediction':
        return (
          <div className="space-y-6">
            {/* Timeline Animation */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h4 className="font-semibold mb-4 text-center">
                {demoData.userName}'s {medicationInfo?.name} Journey
              </h4>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200"></div>
                
                {/* Timeline events */}
                <div className="space-y-6">
                  {/* Injection */}
                  <div className="flex items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${
                      animationPhase >= 0 ? 'bg-blue-100 scale-110' : 'bg-gray-100'
                    }`}>
                      💉
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">Monday 8:00 AM</div>
                      <div className="text-sm text-gray-600">Injection logged</div>
                    </div>
                  </div>

                  {/* Prediction */}
                  <div className="flex items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${
                      animationPhase >= 1 ? 'bg-yellow-100 scale-110' : 'bg-gray-100'
                    }`}>
                      🔮
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">AI Prediction</div>
                      <div className="text-sm text-gray-600">Peak symptoms: {demoData.peakWindow}</div>
                      {animationPhase >= 1 && (
                        <div className="text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded mt-1 animate-fade-in">
                          ⚠️ Plan light activities Wed-Thu
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meal Suggestion */}
                  <div className="flex items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${
                      animationPhase >= 2 ? 'bg-green-100 scale-110' : 'bg-gray-100'
                    }`}>
                      🍽️
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">Smart Meal Suggestion</div>
                      <div className="text-sm text-gray-600">{demoData.mealSuggestion}</div>
                      {animationPhase >= 2 && (
                        <div className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded mt-1 animate-fade-in">
                          💡 Gentle on stomach during peak window
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actual Experience */}
                  <div className="flex items-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${
                      animationPhase >= 3 ? 'bg-purple-100 scale-110' : 'bg-gray-100'
                    }`}>
                      ✅
                    </div>
                    <div className="ml-4">
                      <div className="font-medium">Wednesday Result</div>
                      <div className="text-sm text-gray-600">Mild nausea as predicted</div>
                      {animationPhase >= 3 && (
                        <div className="text-xs bg-purple-50 text-purple-800 px-2 py-1 rounded mt-1 animate-fade-in">
                          🎉 Stayed on track with medication!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'injection-tracking':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h4 className="font-semibold mb-4 text-center">Smart Injection Tracking & Insights</h4>
              
              {/* Visual Body Map - Clean & Simple */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-32 h-40 bg-blue-50 rounded-full relative border-2 border-blue-200">
                    {/* Current injection site (most recent) */}
                    <div className="absolute top-8 left-4 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    {/* Previous injection sites */}
                    <div className="absolute top-8 right-4 w-4 h-4 bg-blue-400 rounded-full"></div>
                    <div className="absolute bottom-12 left-6 w-4 h-4 bg-blue-300 rounded-full"></div>
                    <div className="absolute bottom-12 right-6 w-4 h-4 bg-gray-300 rounded-full"></div>
                    <div className="absolute top-1/2 left-2 w-4 h-4 bg-gray-200 rounded-full"></div>
                    <div className="absolute top-1/2 right-2 w-4 h-4 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Simple Legend */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span>Most recent</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
                    <span>Recent</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
                    <span>Available</span>
                  </div>
                </div>
              </div>
              
              {/* Key Features */}
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <div>
                      <div className="font-medium text-sm">Visual site tracking</div>
                      <div className="text-xs text-gray-600">See where you've injected at a glance</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">📊</span>
                    <div>
                      <div className="font-medium text-sm">Healthy rotation</div>
                      <div className="text-xs text-gray-600">Gentle reminders to rotate sites properly</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-purple-600 mr-2">🔔</span>
                    <div>
                      <div className="font-medium text-sm">Smart reminders</div>
                      <div className="text-xs text-gray-600">Never miss your weekly dose with intelligent alerts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'meal-intelligence':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h4 className="font-semibold mb-4 text-center">AI Symptom-Aware Meal Generation</h4>
              
              <div className="space-y-4">
                {/* Symptom Analysis */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium text-blue-800 mb-2">📊 Your 30-Day Analysis:</div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-medium">Top symptoms:</span>
                        <div className="text-blue-700">Nausea (8x), Fatigue (5x)</div>
                      </div>
                      <div>
                        <span className="font-medium">Meal-related:</span>
                        <div className="text-blue-700">73% of symptoms</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Enhancement */}
                <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                  <h5 className="font-medium mb-2 text-green-800">🧠 AI Enhancement Applied</h5>
                  <div className="text-xs space-y-2">
                    <div className="bg-white p-2 rounded">
                      <span className="font-medium text-red-600">AVOID:</span> High-fat foods, spicy foods, strong smells
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="font-medium text-green-600">PRIORITIZE:</span> Ginger, lean proteins, room temperature foods
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="font-medium text-blue-600">METHOD:</span> Steaming, light grilling, gentle preparation
                    </div>
                  </div>
                </div>

                {/* Generated Meal */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-medium">{demoData.mealSuggestion}</h5>
                      <div className="text-sm text-gray-600">Generated with your symptom profile</div>
                    </div>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Symptom-Optimized
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">22g</div>
                      <div className="text-gray-500">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">8g</div>
                      <div className="text-gray-500">Fiber</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-600">Low Fat</div>
                      <div className="text-gray-500">Gentle</div>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div className="font-medium text-yellow-800 mb-1">🎯 Personalized Because:</div>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• Low-fat protein reduces nausea risk (your #1 symptom)</li>
                      <li>• Greek yogurt provides probiotics for digestion</li>
                      <li>• Room temperature to avoid triggering nausea</li>
                      <li>• Easy to digest during fatigue episodes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Experience Your New Superpower</h2>
              <p className="text-blue-100">
                See how our AI transforms your {medicationInfo?.name || 'GLP-1'} journey
              </p>
            </div>
            <button
              onClick={onSkip}
              className="text-blue-100 hover:text-white text-sm underline"
            >
              Skip Preview
            </button>
          </div>
          
          {/* Progress Dots */}
          <div className="flex justify-center space-x-2">
            {previews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPreview(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentPreview
                    ? 'bg-white'
                    : index < currentPreview
                    ? 'bg-green-300'
                    : 'bg-blue-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{currentPreviewData.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {currentPreviewData.title}
            </h3>
            <p className="text-gray-600">
              {currentPreviewData.description}
            </p>
          </div>

          {renderPreviewContent()}
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => setCurrentPreview(Math.max(0, currentPreview - 1))}
            disabled={currentPreview === 0}
            className="text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <span className="text-sm text-gray-500">
            {currentPreview + 1} of {previews.length}
          </span>

          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all"
          >
            {currentPreview === previews.length - 1 ? 'Get Started! →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}