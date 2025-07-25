'use client';

import { useState } from 'react';

interface EducationStep {
  id: string;
  title: string;
  icon: string;
  quickPoints: string[];
  detailedContent: {
    problem: string;
    solution: string;
    tips: string[];
    examples?: string[];
  };
}

const educationSteps: EducationStep[] = [
  {
    id: 'protein-fiber-satiety',
    title: 'Protein & Fiber: Your Satiety Powerhouse',
    icon: '💪',
    quickPoints: [
      'Protein keeps you full longer and preserves muscle mass',
      'Fiber slows digestion and stabilizes blood sugar',
      'Together they work with GLP-1 to control appetite naturally'
    ],
    detailedContent: {
      problem: 'Many people struggle with hunger and cravings even on GLP-1 medications, often because they\'re not optimizing the foods that naturally enhance satiety.',
      solution: 'Protein and fiber work synergistically with GLP-1 to promote lasting fullness. Protein triggers satiety hormones and maintains muscle mass during weight loss, while fiber slows gastric emptying and provides steady energy.',
      tips: [
        'Aim for 20-30g protein per meal to maximize satiety signals',
        'Include 8-12g fiber per meal from vegetables, legumes, and whole grains',
        'Start meals with protein and fiber to slow eating and enhance fullness',
        'Choose lean proteins: chicken, fish, eggs, Greek yogurt, legumes'
      ],
      examples: [
        'Greek yogurt with berries and almonds (25g protein, 8g fiber)',
        'Salmon with roasted vegetables and quinoa (35g protein, 10g fiber)',
        'Lentil soup with side salad (18g protein, 15g fiber)'
      ]
    }
  },
  {
    id: 'meal-timing',
    title: 'Consistent Meal Timing: Taming Primal Hunger',
    icon: '⏰',
    quickPoints: [
      'Regular meal timing prevents intense "primal hunger" episodes',
      'Consistent eating supports your body\'s natural rhythms',
      'Skipping meals can lead to overeating and poor food choices'
    ],
    detailedContent: {
      problem: 'When hunger is well-controlled on GLP-1 medications, many people skip meals thinking it\'s beneficial. This can lead to intense "primal hunger" episodes where you feel desperate for food and make poor choices.',
      solution: 'Eating at consistent times keeps your metabolism steady and prevents the hormonal cascade that leads to primal hunger. Even if you\'re not hungry, eating regularly maintains stable energy and prevents rebound cravings.',
      tips: [
        'Eat every 4-6 hours, even if hunger is minimal',
        'Set meal reminders if appetite suppression is strong',
        'Plan your eating around your GLP-1 injection schedule',
        'Focus on nutrient-dense foods when appetite is low'
      ],
      examples: [
        'Morning: 7-8 AM breakfast, even if small',
        'Midday: 12-1 PM lunch with protein and vegetables',
        'Evening: 6-7 PM dinner, planned around medication timing'
      ]
    }
  },
  {
    id: 'gi-distress-foods',
    title: 'Avoiding GI Distress: Foods to Minimize',
    icon: '🚫',
    quickPoints: [
      'High-fat and greasy foods can worsen nausea and discomfort',
      'Very spicy or acidic foods may irritate your digestive system',
      'Large portions can overwhelm your slowed digestion'
    ],
    detailedContent: {
      problem: 'GLP-1 medications slow gastric emptying, which can make certain foods cause nausea, bloating, or discomfort. This can interfere with maintaining proper nutrition.',
      solution: 'Choose easily digestible, nutrient-dense foods while your body adjusts to the medication. Focus on lean proteins, vegetables, and moderate portions.',
      tips: [
        'Limit high-fat foods like fried items, heavy cream sauces',
        'Reduce very spicy foods if they cause discomfort',
        'Avoid carbonated drinks which can increase bloating',
        'Choose smaller, more frequent meals over large portions',
        'Cook vegetables until tender to aid digestion'
      ],
      examples: [
        'Instead of: Fried chicken → Choose: Grilled chicken breast',
        'Instead of: Creamy pasta → Choose: Pasta with marinara and lean protein',
        'Instead of: Large steak dinner → Choose: Smaller portion with vegetables'
      ]
    }
  },
  {
    id: 'constipation-prevention',
    title: 'Preventing Constipation: Fiber & Hydration',
    icon: '💧',
    quickPoints: [
      'GLP-1 medications can slow digestion and cause constipation',
      'Fiber and water work together to maintain healthy digestion',
      'Gradual increases prevent additional GI discomfort'
    ],
    detailedContent: {
      problem: 'Constipation is a common side effect of GLP-1 medications due to slowed gut motility. This can be uncomfortable and interfere with overall well-being.',
      solution: 'A combination of adequate fiber, hydration, and gentle movement helps maintain healthy digestion while on GLP-1 medications.',
      tips: [
        'Gradually increase fiber to 25-35g daily to avoid gas/bloating',
        'Drink 8-10 glasses of water throughout the day',
        'Include both soluble fiber (oats, beans) and insoluble fiber (vegetables)',
        'Add movement like walking after meals to stimulate digestion',
        'Consider prunes, flax seeds, or chia seeds as natural aids'
      ],
      examples: [
        'Morning: Oatmeal with berries and ground flaxseed',
        'Lunch: Large salad with beans and vegetables',
        'Snack: Apple with almond butter',
        'Dinner: Roasted vegetables with lean protein'
      ]
    }
  },
  {
    id: 'adequate-nutrition',
    title: 'Eating Enough: Calories & Protein Matter',
    icon: '🍽️',
    quickPoints: [
      'Reduced appetite doesn\'t mean you should drastically under-eat',
      'Adequate protein prevents muscle loss during weight loss',
      'Consistent eating maintains energy and metabolic health'
    ],
    detailedContent: {
      problem: 'Strong appetite suppression can lead to eating too few calories or protein, which can slow metabolism, cause fatigue, and lead to muscle loss.',
      solution: 'Even with reduced hunger, prioritize adequate nutrition to support your health goals. Focus on nutrient-dense foods and consistent eating patterns.',
      tips: [
        'Aim for at least 1200-1500 calories daily (consult your healthcare provider)',
        'Prioritize protein at every meal and snack',
        'Choose calorie-dense, nutritious foods when appetite is low',
        'Don\'t skip meals even if you\'re not hungry',
        'Consider protein shakes if solid food is difficult'
      ],
      examples: [
        'Protein smoothie with Greek yogurt, berries, and protein powder',
        'Avocado toast with eggs for healthy fats and protein',
        'Trail mix with nuts and dried fruit for concentrated nutrition',
        'Bone broth with added protein powder when solid food is challenging'
      ]
    }
  }
];

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export default function GLP1EducationOnboarding({ onComplete, onSkip }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDetailed, setShowDetailed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = educationSteps[currentStep];
  const isLastStep = currentStep === educationSteps.length - 1;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setShowDetailed(false);
    
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setShowDetailed(false);
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setShowDetailed(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">GLP-1 Nutrition Mastery</h1>
            <button
              onClick={onSkip}
              className="text-blue-100 hover:text-white text-sm underline"
            >
              Skip Education
            </button>
          </div>
          <p className="text-blue-100">
            Learn the essential nutrition principles that maximize your GLP-1 medication success
          </p>
          
          {/* Progress Steps */}
          <div className="flex justify-between mt-6">
            {educationSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                  index === currentStep
                    ? 'bg-white text-blue-600 border-white'
                    : completedSteps.has(index)
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-transparent text-white border-blue-300 hover:border-white'
                }`}
              >
                {completedSteps.has(index) ? '✓' : index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{step.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h2>
          </div>

          {!showDetailed ? (
            /* Quick Points View */
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Key Points:</h3>
                <ul className="space-y-2">
                  {step.quickPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-1">•</span>
                      <span className="text-blue-800">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowDetailed(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Learn More Details
                </button>
              </div>
            </div>
          ) : (
            /* Detailed Content View */
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">The Challenge:</h3>
                <p className="text-red-800 text-sm leading-relaxed">{step.detailedContent.problem}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">The Solution:</h3>
                <p className="text-green-800 text-sm leading-relaxed">{step.detailedContent.solution}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-3">Practical Tips:</h3>
                <ul className="space-y-2">
                  {step.detailedContent.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-600 mr-2 mt-1">💡</span>
                      <span className="text-yellow-800 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {step.detailedContent.examples && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-3">Examples:</h3>
                  <ul className="space-y-2">
                    {step.detailedContent.examples.map((example, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-600 mr-2 mt-1">📝</span>
                        <span className="text-purple-800 text-sm">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => setShowDetailed(false)}
                  className="text-gray-600 hover:text-gray-800 text-sm underline"
                >
                  Back to Key Points
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <span className="text-sm text-gray-500">
            {currentStep + 1} of {educationSteps.length}
          </span>

          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {isLastStep ? 'Get Started!' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}