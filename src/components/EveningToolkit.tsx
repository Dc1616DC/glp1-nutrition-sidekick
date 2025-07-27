'use client';

import { useState, useEffect } from 'react';
import EveningToolkitInsights from './EveningToolkitInsights';

interface EveningToolkitProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

type CheckInStep = 'welcome' | 'timing-check' | 'feelings-check' | 'hunger-fullness' | 'routing' | 'mindful-eating' | 'timer' | 'reflection' | 'insights';

interface ActivitySuggestion {
  category: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
}

interface CheckInData {
  lastMealTiming: string;
  feelings: string[];
  emotionalIntensity: number;
  hungerFullnessLevel: number;
  routeChosen: 'eat' | 'activity' | 'pause';
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
    lastMealTiming: '',
    feelings: [],
    emotionalIntensity: 5,
    hungerFullnessLevel: 5,
    routeChosen: 'pause',
    timestamp: new Date().toISOString()
  });
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Component for context tooltips
  const ContextTooltip = ({ text, id }: { text: string; id: string }) => (
    <div className="relative inline-block">
      <button
        onClick={() => setShowTooltip(showTooltip === id ? null : id)}
        className="ml-2 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center hover:bg-blue-200 transition-colors"
        aria-label="More information"
      >
        ?
      </button>
      {showTooltip === id && (
        <div className="absolute z-10 left-6 top-0 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
          <div className="absolute -left-2 top-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
          {text}
          <button
            onClick={() => setShowTooltip(null)}
            className="ml-2 text-gray-300 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );

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

  const renderTimingCheck = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold text-gray-900">When did you last eat something substantial?</h3>
        <ContextTooltip 
          text="We're starting here to see if it's been a while since your last nourishment—this can help spot if hunger is building or if it's something else."
          id="timing-context"
        />
      </div>
      
      <div className="space-y-3">
        {[
          { value: '<2', label: 'Less than 2 hours ago', description: 'Recent meal or snack' },
          { value: '3-4', label: '3-4 hours ago', description: 'Normal meal spacing' },
          { value: '5+', label: '5+ hours ago', description: 'It\'s been a while' },
          { value: 'unsure', label: 'Can\'t remember', description: 'Lost track of time' }
        ].map(option => (
          <button
            key={option.value}
            onClick={() => {
              setCheckInData(prev => ({ ...prev, lastMealTiming: option.value }));
              setCurrentStep('feelings-check');
            }}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              checkInData.lastMealTiming === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900">{option.label}</div>
            <div className="text-sm text-gray-600 mt-1">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderRouting = () => {
    const isPhysicallyHungry = checkInData.hungerFullnessLevel <= 3 && checkInData.feelings.includes('physically-hungry');
    const isEmotional = checkInData.feelings.some(f => ['stressed', 'bored', 'tired', 'anxious', 'lonely'].includes(f));
    const isHabitual = checkInData.feelings.includes('habitual');

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">What feels right for you right now?</h3>
          <p className="text-sm text-gray-600">Based on your check-in, here's a gentle path—honor what feels right.</p>
        </div>

        <div className="space-y-4">
          {isPhysicallyHungry && (
            <button
              onClick={() => {
                setCheckInData(prev => ({ ...prev, routeChosen: 'eat' }));
                setCurrentStep('mindful-eating');
              }}
              className="w-full p-4 rounded-lg border-2 border-green-500 bg-green-50 hover:bg-green-100 transition-all text-left"
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🍽️</span>
                <div>
                  <h4 className="font-semibold text-green-800">Honor your hunger</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your body is asking for nourishment. Let's explore some mindful eating together.
                  </p>
                </div>
              </div>
            </button>
          )}

          {(isEmotional || isHabitual) && (
            <button
              onClick={() => {
                setCheckInData(prev => ({ ...prev, routeChosen: 'activity' }));
                setCurrentStep('timer');
              }}
              className="w-full p-4 rounded-lg border-2 border-purple-500 bg-purple-50 hover:bg-purple-100 transition-all text-left"
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🌸</span>
                <div>
                  <h4 className="font-semibold text-purple-800">Explore what you need</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Let's take 10 minutes to discover gentle ways to nurture what you're really feeling.
                  </p>
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => {
              setCheckInData(prev => ({ ...prev, routeChosen: 'pause' }));
              setCurrentStep('reflection');
            }}
            className="w-full p-4 rounded-lg border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all text-left"
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🧘‍♀️</span>
              <div>
                <h4 className="font-semibold text-blue-800">Just pause and reflect</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Sometimes awareness is enough. Take a moment to sit with whatever you're experiencing.
                </p>
              </div>
            </div>
          </button>

          {!isPhysicallyHungry && (
            <button
              onClick={() => {
                setCheckInData(prev => ({ ...prev, routeChosen: 'eat' }));
                setCurrentStep('mindful-eating');
              }}
              className="w-full p-4 rounded-lg border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 transition-all text-left"
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🤝</span>
                <div>
                  <h4 className="font-semibold text-gray-700">I want to eat anyway</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    That's okay too. Let's explore mindful eating to make it a nourishing experience.
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderMindfulEating = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Mindful Eating Guidelines</h3>
        <p className="text-sm text-gray-600">Let's make this a nourishing experience for both body and mind.</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">🪑 Create Your Space</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Sit down at a table or comfortable spot</li>
            <li>• Put away distractions (phone, TV, work)</li>
            <li>• Take three deep breaths before starting</li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🍽️ Eating Practice</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Notice colors, textures, and aromas</li>
            <li>• Take smaller bites and chew slowly</li>
            <li>• Check in halfway: How do I feel?</li>
            <li>• Honor when you feel satisfied</li>
          </ul>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">💭 Curious Questions</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• What flavors am I noticing?</li>
            <li>• How does this feel in my body?</li>
            <li>• What do I enjoy about eating this?</li>
            <li>• Am I still enjoying each bite?</li>
          </ul>
        </div>
      </div>

      <div className="text-center space-y-3">
        <button
          onClick={() => setCurrentStep('timer')}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
        >
          Start 10-Minute Mindful Timer ⏰
        </button>
        <button
          onClick={() => setCurrentStep('reflection')}
          className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
        >
          Skip to Reflection
        </button>
      </div>
    </div>
  );

  const getActivitySuggestions = () => {
    const dominantFeeling = checkInData.feelings[0];
    if (checkInData.hungerFullnessLevel <= 3 && checkInData.feelings.includes('habitual')) {
      return ACTIVITY_SUGGESTIONS.habit;
    }
    return ACTIVITY_SUGGESTIONS[dominantFeeling] || ACTIVITY_SUGGESTIONS.bored;
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

  const renderFeelingsCheck = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold text-gray-900">How are you feeling right now?</h3>
        <ContextTooltip 
          text="Evening emotions can sneak up—checking in helps identify triggers like stress or habit, so we can explore what your body really needs."
          id="feelings-context"
        />
      </div>
      <p className="text-sm text-gray-600">Select all that apply:</p>
      
      <div className="grid grid-cols-2 gap-3">
        {[
          'physically-hungry', 'tired', 'stressed', 'bored', 
          'happy', 'lonely', 'habitual', 'satisfied'
        ].map(feeling => (
          <button
            key={feeling}
            onClick={() => {
              setCheckInData(prev => ({
                ...prev,
                feelings: prev.feelings.includes(feeling)
                  ? prev.feelings.filter(f => f !== feeling)
                  : [...prev.feelings, feeling]
              }));
            }}
            className={`p-3 rounded-lg border-2 transition-all capitalize text-left ${
              checkInData.feelings.includes(feeling)
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {feeling.replace('-', ' ')}
          </button>
        ))}
      </div>

      {checkInData.feelings.some(f => f !== 'physically-hungry' && f !== 'satisfied') && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center mb-3">
            <label className="text-sm font-medium text-amber-800">How intense is this feeling?</label>
            <ContextTooltip 
              text="On a scale, how strong is this? Curiosity here can reveal patterns without judgment."
              id="intensity-context"
            />
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="10"
              value={checkInData.emotionalIntensity}
              onChange={(e) => setCheckInData(prev => ({ ...prev, emotionalIntensity: parseInt(e.target.value) }))}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-amber-700">
              <span>1 - Mild</span>
              <span className="font-medium">{checkInData.emotionalIntensity}</span>
              <span>10 - Very intense</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setCurrentStep('hunger-fullness')}
        disabled={checkInData.feelings.length === 0}
        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        Continue
      </button>
    </div>
  );

  const renderHungerFullnessScale = () => {
    const hungerDescriptions = [
      { level: 0, label: 'Painfully hungry', description: 'Weak, dizzy, can\'t think clearly' },
      { level: 1, label: 'Very hungry', description: 'Stomach growling, low energy' },
      { level: 2, label: 'Hungry', description: 'Ready to eat, thinking about food' },
      { level: 3, label: 'Slightly hungry', description: 'Could eat, but not urgent' },
      { level: 4, label: 'Neutral', description: 'Not hungry, not full' },
      { level: 5, label: 'Satisfied', description: 'Comfortable, content' },
      { level: 6, label: 'Slightly full', description: 'A little more than satisfied' },
      { level: 7, label: 'Full', description: 'Definitely had enough' },
      { level: 8, label: 'Very full', description: 'Uncomfortably full, sluggish' },
      { level: 9, label: 'Stuffed', description: 'Very uncomfortable, regretful' },
      { level: 10, label: 'Painfully full', description: 'Sick, can\'t move comfortably' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-900">Hunger & Fullness Check</h3>
          <ContextTooltip 
            text="Use this to tune into body signals—stomach growls for hunger? Or is it more emotional, like cravings from boredom?"
            id="hunger-fullness-context"
          />
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Take a moment to check in with your body.</strong> Where do you fall on this scale right now?
          </p>
          <p className="text-xs text-blue-700">
            0 = Painfully hungry • 5 = Satisfied/neutral • 10 = Painfully full
          </p>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="10"
            value={checkInData.hungerFullnessLevel}
            onChange={(e) => setCheckInData(prev => ({ ...prev, hungerFullnessLevel: parseInt(e.target.value) }))}
            className="w-full h-3 bg-gradient-to-r from-orange-200 via-green-200 to-red-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{checkInData.hungerFullnessLevel}</div>
            <div className="font-medium text-gray-800">
              {hungerDescriptions[checkInData.hungerFullnessLevel].label}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {hungerDescriptions[checkInData.hungerFullnessLevel].description}
            </div>
          </div>
        </div>

        <button
          onClick={() => setCurrentStep('routing')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          What feels right for me now?
        </button>
      </div>
    );
  };

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
          <div className="text-center space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="text-6xl mb-4">🌙</div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Your Evening Toolkit</h2>
            <div className="text-left max-w-lg mx-auto space-y-4 text-gray-700 leading-relaxed">
              <p>
                Hey there! If you've ever found yourself reaching for snacks in the evening—not out of true physical hunger, 
                but maybe to unwind from a long day, soothe some stress, or just out of habit—this gentle feature is here for you.
              </p>
              <p>
                We're all human, and sometimes food becomes a comforting companion during those quieter hours. That's okay—it's 
                often our body's way of signaling unmet needs, like rest, connection, or a moment of calm.
              </p>
              <p className="font-medium text-blue-800">This toolkit is designed to help you tune in with curiosity:</p>
              <ul className="space-y-2 text-sm">
                <li>• Spot the difference between genuine hunger and emotional or habitual cues</li>
                <li>• Explore what might really be going on underneath (like feeling tired, bored, or overwhelmed)</li>
                <li>• Discover simple ways to nurture those needs, whether through a short activity, a mindful pause, or choosing a satisfying bite if it feels right</li>
                <li>• Over time, build awareness to shift patterns gently—learning to identify and tend to your emotional or human needs without rules or judgment</li>
              </ul>
              <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                <strong>Rooted in intuitive eating principles</strong>, it's all about honoring your body and emotions, 
                making peace with food, and finding balance that feels good. Remember, there's no "perfect" here—every 
                check-in is a step toward understanding yourself better.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setCurrentStep('timing-check')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all"
              >
                Let's Explore 🌟
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
      case 'timing-check':
        return renderTimingCheck();
      case 'feelings-check':
        return renderFeelingsCheck();
      case 'hunger-fullness':
        return renderHungerFullnessScale();
      case 'routing':
        return renderRouting();
      case 'mindful-eating':
        return renderMindfulEating();
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
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-b from-white to-blue-50 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-blue-200">
        <div className="p-6">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Evening Toolkit</span>
              <span>
                Step {['welcome', 'timing-check', 'feelings-check', 'hunger-fullness', 'routing', 'mindful-eating', 'timer', 'reflection', 'insights'].indexOf(currentStep) + 1} of 9
              </span>
            </div>
            <div className="w-full bg-indigo-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((['welcome', 'timing-check', 'feelings-check', 'hunger-fullness', 'routing', 'mindful-eating', 'timer', 'reflection', 'insights'].indexOf(currentStep) + 1) / 9) * 100}%` 
                }}
              />
            </div>
          </div>

          {renderStepContent()}
          
          {/* Back button for most steps */}
          {currentStep !== 'welcome' && currentStep !== 'reflection' && currentStep !== 'insights' && (
            <button
              onClick={() => {
                const steps: CheckInStep[] = ['welcome', 'timing-check', 'feelings-check', 'hunger-fullness', 'routing', 'mindful-eating', 'timer', 'reflection', 'insights'];
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