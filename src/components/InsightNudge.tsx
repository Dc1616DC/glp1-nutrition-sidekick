'use client';

import { useEffect, useState } from 'react';
import { getInsightById } from '../data/nutritionInsights';

interface InsightNudgeProps {
  triggerType: 'lowProtein' | 'lowFiber' | 'hydration' | 'general';
  mealData?: {
    protein?: number;
    fiber?: number;
    calories?: number;
  };
  onDismiss: () => void;
  onViewInsight: (insightId: string) => void;
}

export default function InsightNudge({ 
  triggerType, 
  mealData, 
  onDismiss, 
  onViewInsight 
}: InsightNudgeProps) {
  const [show, setShow] = useState(false);
  const [lastNudgeTime, setLastNudgeTime] = useState<number>(0);

  // Map trigger types to insight IDs
  const getRelevantInsightId = () => {
    switch (triggerType) {
      case 'lowProtein':
        return 'protein-essentials';
      case 'lowFiber':
        return 'fiber-fullness';
      case 'hydration':
        return 'hydration-timing';
      default:
        return 'nutritional-intake';
    }
  };

  useEffect(() => {
    // Check if we should show nudge (limit to once per 24 hours per type)
    const now = Date.now();
    const nudgeKey = `lastNudge_${triggerType}`;
    const lastShown = localStorage.getItem(nudgeKey);
    
    if (lastShown) {
      const timeSinceLastNudge = now - parseInt(lastShown);
      if (timeSinceLastNudge < 24 * 60 * 60 * 1000) { // 24 hours
        return;
      }
    }

    // Check meal data thresholds
    if (triggerType === 'lowProtein' && mealData?.protein && mealData.protein < 20) {
      setShow(true);
      localStorage.setItem(nudgeKey, now.toString());
    } else if (triggerType === 'lowFiber' && mealData?.fiber && mealData.fiber < 4) {
      setShow(true);
      localStorage.setItem(nudgeKey, now.toString());
    } else if (triggerType === 'general') {
      setShow(true);
      localStorage.setItem(nudgeKey, now.toString());
    }
  }, [triggerType, mealData]);

  if (!show) return null;

  const insightId = getRelevantInsightId();
  const insight = getInsightById(insightId);

  if (!insight) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-slideUp z-40">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{insight.icon}</div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">
            {triggerType === 'lowProtein' && 'Looking for more protein?'}
            {triggerType === 'lowFiber' && 'Boost your fiber intake?'}
            {triggerType === 'hydration' && 'Stay hydrated!'}
            {triggerType === 'general' && 'Nutrition tip for you'}
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {triggerType === 'lowProtein' && `Your meal had ${mealData?.protein || 0}g protein. Check out tips for reaching 20-30g per meal.`}
            {triggerType === 'lowFiber' && `Your meal had ${mealData?.fiber || 0}g fiber. Discover easy ways to add more.`}
            {triggerType === 'hydration' && 'Remember to drink water before and between meals.'}
            {triggerType === 'general' && 'Explore tips to support your GLP-1 journey.'}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                onViewInsight(insightId);
                setShow(false);
              }}
              className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
            >
              View Tip
            </button>
            <button
              onClick={() => {
                onDismiss();
                setShow(false);
              }}
              className="px-3 py-1 text-gray-600 text-sm font-medium hover:text-gray-800"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this CSS for the slide-up animation
const styles = `
  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  .animate-slideUp {
    animation: slideUp 0.4s ease-out;
  }
`;