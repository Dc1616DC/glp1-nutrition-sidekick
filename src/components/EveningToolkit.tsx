'use client';

import { useState, useEffect } from 'react';
import EveningToolkitInsights from './EveningToolkitInsights';

interface EveningToolkitProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

type CheckInStep = 'welcome' | 'physical-hunger' | 'emotional-check' | 'trigger-awareness' | 'activity-selection' | 'timer' | 'reflection' | 'insights';

interface ActivitySuggestion {
  category: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
}

interface CheckInData {
  physicalHunger: number;
  emotions: string[];
  triggers: string[];
  selectedActivity?: ActivitySuggestion;
  reflectionNotes?: string;
  timestamp: string;
}

const ACTIVITY_SUGGESTIONS: Record<string, ActivitySuggestion[]> = {
  stressed: [
    {
      category: 'Mindfulness',
      title: 'Box Breathing',
      description: 'Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 5 times.',
      duration: '3 minutes',
      icon: '🧘‍♀️'
    },
    {
      category: 'Movement',
      title: 'Gentle Stretching',
      description: 'Focus on neck, shoulders, and back. Move slowly and mindfully.',
      duration: '5 minutes',
      icon: '🤸‍♀️'
    },
    {
      category: 'Self-Care',
      title: 'Warm Herbal Tea',
      description: 'Prepare and slowly sip chamomile, passionflower, or another calming tea.',
      duration: '10 minutes',
      icon: '🍵'
    }
  ],
  bored: [
    {
      category: 'Creative',
      title: 'Journal Writing',
      description: 'Write about your day, goals, or anything on your mind.',
      duration: '10 minutes',
      icon: '📝'
    },
    {
      category: 'Engaging',
      title: 'Learn Something New',
      description: 'Watch a short educational video or read an interesting article.',
      duration: '10 minutes',
      icon: '📚'
    },
    {
      category: 'Social',
      title: 'Connect with Someone',
      description: 'Send a text to a friend or family member you haven\'t spoken to recently.',
      duration: '5 minutes',
      icon: '💬'
    }
  ],
  tired: [
    {
      category: 'Rest',
      title: 'Progressive Muscle Relaxation',
      description: 'Tense and release each muscle group from toes to head.',
      duration: '8 minutes',
      icon: '😌'
    },
    {
      category: 'Preparation',
      title: 'Evening Wind-Down',
      description: 'Dim lights, prepare for bed, practice gentle self-care.',
      duration: '15 minutes',
      icon: '🌙'
    },
    {
      category: 'Mindfulness',
      title: 'Gratitude Practice',
      description: 'List 3 things you\'re grateful for from today.',
      duration: '3 minutes',
      icon: '🙏'
    }
  ],
  anxious: [
    {
      category: 'Grounding',
      title: '5-4-3-2-1 Technique',
      description: 'Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.',
      duration: '5 minutes',
      icon: '🎯'
    },
    {
      category: 'Movement',
      title: 'Walking',
      description: 'Take a slow walk around your home or outside if safe.',
      duration: '10 minutes',
      icon: '🚶‍♀️'
    },
    {
      category: 'Comfort',
      title: 'Self-Soothing Activity',
      description: 'Soft music, cozy blanket, gentle hand massage, or other comfort.',
      duration: '10 minutes',
      icon: '🤗'
    }
  ],
  lonely: [
    {
      category: 'Connection',
      title: 'Reach Out',
      description: 'Call, text, or video chat with someone who cares about you.',
      duration: '10 minutes',
      icon: '📞'
    },
    {
      category: 'Self-Compassion',
      title: 'Self-Kindness Practice',
      description: 'Speak to yourself like you would a dear friend. Be gentle and understanding.',
      duration: '5 minutes',
      icon: '💝'
    },
    {
      category: 'Engaging',
      title: 'Favorite Comfort Activity',
      description: 'Engage in a hobby, read, or do something that usually brings you joy.',
      duration: '15 minutes',
      icon: '🎨'
    }
  ],
  habit: [
    {
      category: 'Mindfulness',
      title: 'Pause and Breathe',
      description: 'Take 10 deep breaths and check in with what you really need right now.',
      duration: '3 minutes',
      icon: '⏸️'
    },
    {
      category: 'Replacement',
      title: 'New Evening Ritual',
      description: 'Replace the eating habit with herbal tea, skincare, or light reading.',
      duration: '10 minutes',
      icon: '🔄'
    },
    {
      category: 'Movement',
      title: 'Change Your Environment',
      description: 'Move to a different room or rearrange your current space.',
      duration: '5 minutes',
      icon: '🏠'
    }
  ]
};

export default function EveningToolkit({ onComplete, onSkip }: EveningToolkitProps) {
  const [currentStep, setCurrentStep] = useState<CheckInStep>('welcome');
  const [checkInData, setCheckInData] = useState<CheckInData>({
    physicalHunger: 0,
    emotions: [],
    triggers: [],
    timestamp: new Date().toISOString()
  });
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds

  // Timer effect
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            setCurrentStep('reflection');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getActivitySuggestions = () => {
    const dominantEmotion = checkInData.emotions[0];
    if (checkInData.physicalHunger <= 3 && checkInData.triggers.includes('habit')) {
      return ACTIVITY_SUGGESTIONS.habit;
    }
    return ACTIVITY_SUGGESTIONS[dominantEmotion] || ACTIVITY_SUGGESTIONS.bored;
  };

  const saveCheckInData = () => {
    const existingData = JSON.parse(localStorage.getItem('eveningToolkitHistory') || '[]');
    existingData.push(checkInData);
    localStorage.setItem('eveningToolkitHistory', JSON.stringify(existingData));
  };

  const handleComplete = () => {
    saveCheckInData();
    onComplete?.();
  };

  const renderHungerScale = () => (
    <div className="space-y-4">
      <p className="text-gray-700 mb-6">On a scale of 1-10, how physically hungry are you right now?</p>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
          <button
            key={level}
            onClick={() => {
              setCheckInData(prev => ({ ...prev, physicalHunger: level }));
              setCurrentStep('emotional-check');
            }}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
              checkInData.physicalHunger === level
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{level}</span>
              <span className="text-sm text-gray-600">
                {level <= 3 ? 'Not physically hungry' :
                 level <= 6 ? 'Somewhat hungry' :
                 'Very hungry'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderEmotionalCheck = () => (
    <div className="space-y-4">
      <p className="text-gray-700 mb-6">What are you feeling right now? (Select all that apply)</p>
      <div className="grid grid-cols-2 gap-3">
        {['stressed', 'bored', 'tired', 'anxious', 'lonely', 'happy', 'frustrated', 'overwhelmed'].map(emotion => (
          <button
            key={emotion}
            onClick={() => {
              setCheckInData(prev => ({
                ...prev,
                emotions: prev.emotions.includes(emotion)
                  ? prev.emotions.filter(e => e !== emotion)
                  : [...prev.emotions, emotion]
              }));
            }}
            className={`p-3 rounded-lg border-2 transition-all capitalize ${
              checkInData.emotions.includes(emotion)
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {emotion}
          </button>
        ))}
      </div>
      <button
        onClick={() => setCurrentStep('trigger-awareness')}
        disabled={checkInData.emotions.length === 0}
        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );

  const renderTriggerAwareness = () => (
    <div className="space-y-4">
      <p className="text-gray-700 mb-6">What might be triggering your urge to eat? (Select all that apply)</p>
      <div className="space-y-3">
        {['habit', 'seeing food', 'specific craving', 'social situation', 'celebration', 'reward seeking', 'procrastination', 'other'].map(trigger => (
          <button
            key={trigger}
            onClick={() => {
              setCheckInData(prev => ({
                ...prev,
                triggers: prev.triggers.includes(trigger)
                  ? prev.triggers.filter(t => t !== trigger)
                  : [...prev.triggers, trigger]
              }));
            }}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left capitalize ${
              checkInData.triggers.includes(trigger)
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {trigger.replace('-', ' ')}
          </button>
        ))}
      </div>
      <button
        onClick={() => setCurrentStep('activity-selection')}
        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
      >
        Get Activity Suggestions
      </button>
    </div>
  );

  const renderActivitySelection = () => {
    const suggestions = getActivitySuggestions();
    
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <p className="text-gray-700 mb-2">Based on your check-in, here are some activities that might help:</p>
          <p className="text-sm text-blue-600">Choose one to try for the next 10 minutes</p>
        </div>
        
        <div className="space-y-3">
          {suggestions.map((activity, index) => (
            <button
              key={index}
              onClick={() => {
                setCheckInData(prev => ({ ...prev, selectedActivity: activity }));
                setCurrentStep('timer');
              }}
              className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all text-left"
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {activity.duration} • {activity.category}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setCurrentStep('timer')}
          className="w-full mt-4 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
        >
          Skip - Just Use Timer
        </button>
      </div>
    );
  };

  const renderTimer = () => (
    <div className="text-center space-y-6">
      {checkInData.selectedActivity && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            {checkInData.selectedActivity.icon} {checkInData.selectedActivity.title}
          </h3>
          <p className="text-blue-800 text-sm">{checkInData.selectedActivity.description}</p>
        </div>
      )}
      
      <div className="mb-6">
        <div className="text-6xl font-mono font-bold text-gray-800 mb-4">
          {formatTime(timeRemaining)}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${((timerMinutes * 60 - timeRemaining) / (timerMinutes * 60)) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        {!timerActive ? (
          <button
            onClick={() => {
              setTimerActive(true);
              setTimeRemaining(timerMinutes * 60);
            }}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            🎯 Start 10-Minute Break
          </button>
        ) : (
          <button
            onClick={() => setTimerActive(false)}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium"
          >
            ⏸️ Pause Timer
          </button>
        )}
        
        <button
          onClick={() => {
            setTimerActive(false);
            setCurrentStep('reflection');
          }}
          className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
        >
          Skip to Reflection
        </button>
      </div>
    </div>
  );

  const renderReflection = () => {
    const history = JSON.parse(localStorage.getItem('eveningToolkitHistory') || '[]');
    const shouldShowInsights = history.length >= 2; // Show insights if they have 3+ total (including current)
    
    return (
      <div className="space-y-4">
        <p className="text-gray-700 mb-6">How are you feeling now? Any insights from this check-in?</p>
        
        <textarea
          value={checkInData.reflectionNotes || ''}
          onChange={(e) => setCheckInData(prev => ({ ...prev, reflectionNotes: e.target.value }))}
          placeholder="Optional: Jot down any thoughts, insights, or how you're feeling now..."
          className="w-full p-3 border rounded-lg min-h-[100px] resize-none"
        />
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            🌟 <strong>Remember:</strong> Every time you pause and check in with yourself, you're building awareness and breaking automatic patterns. This is a practice of self-compassion, not perfection.
          </p>
        </div>
        
        <div className="space-y-3">
          {shouldShowInsights ? (
            <button
              onClick={() => {
                saveCheckInData();
                setCurrentStep('insights');
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium"
            >
              📊 View Your Patterns & Insights
            </button>
          ) : null}
          
          <button
            onClick={handleComplete}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            ✅ Complete Check-In
          </button>
        </div>
      </div>
    );
  };

  const renderInsights = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">📊 Your Patterns</h2>
        <p className="text-gray-600 text-sm">
          Based on your recent check-ins, here are some insights about your evening eating patterns.
        </p>
      </div>
      
      <EveningToolkitInsights />
      
      <button
        onClick={handleComplete}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
      >
        ✅ Finish
      </button>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🌙</div>
            <h2 className="text-2xl font-bold text-gray-900">Evening Check-In</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Take a moment to pause and understand what you're really needing right now. 
              This gentle check-in helps you respond to your needs with kindness and awareness.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setCurrentStep('physical-hunger')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                🎯 Start Check-In
              </button>
              <button
                onClick={onSkip}
                className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
              >
                Maybe Later
              </button>
            </div>
          </div>
        );
      case 'physical-hunger':
        return renderHungerScale();
      case 'emotional-check':
        return renderEmotionalCheck();
      case 'trigger-awareness':
        return renderTriggerAwareness();
      case 'activity-selection':
        return renderActivitySelection();
      case 'timer':
        return renderTimer();
      case 'reflection':
        return renderReflection();
      case 'insights':
        return renderInsights();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Evening Toolkit</span>
              <span>
                Step {['welcome', 'physical-hunger', 'emotional-check', 'trigger-awareness', 'activity-selection', 'timer', 'reflection', 'insights'].indexOf(currentStep) + 1} of 8
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((['welcome', 'physical-hunger', 'emotional-check', 'trigger-awareness', 'activity-selection', 'timer', 'reflection', 'insights'].indexOf(currentStep) + 1) / 8) * 100}%` 
                }}
              />
            </div>
          </div>

          {renderStepContent()}
          
          {/* Back button for most steps */}
          {currentStep !== 'welcome' && currentStep !== 'reflection' && currentStep !== 'insights' && (
            <button
              onClick={() => {
                const steps: CheckInStep[] = ['welcome', 'physical-hunger', 'emotional-check', 'trigger-awareness', 'activity-selection', 'timer', 'reflection', 'insights'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1]);
                }
              }}
              className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}