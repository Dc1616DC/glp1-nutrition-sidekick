'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { injectionMealContextService, MealContextWarning, InjectionMealContext } from '@/services/injectionMealContextService';

interface MealContextWarningsProps {
  mealType?: string;
}

export default function MealContextWarnings({ mealType }: MealContextWarningsProps) {
  const { user } = useAuth();
  const [context, setContext] = useState<InjectionMealContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadContext();
  }, [user, mealType]);

  const loadContext = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const mealContext = await injectionMealContextService.getMealContext(user.uid, mealType);
      setContext(mealContext);
      
      // Auto-expand if there are important warnings
      if (mealContext.warnings.some(w => w.severity === 'high' || w.severity === 'medium')) {
        setIsExpanded(true);
      }
    } catch (error) {
      console.error('Error loading meal context:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show if no data or insufficient confidence
  if (loading || !context || context.daysSinceInjection === -1 || 
      (context.warnings.length === 0 && context.tips.length === 0)) {
    return null;
  }

  const getWarningColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-amber-300 bg-amber-50';
      default: return 'border-blue-300 bg-blue-50';
    }
  };

  const getWarningTextColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-800';
      case 'medium': return 'text-amber-800';
      default: return 'text-blue-800';
    }
  };

  const getDayDescription = () => {
    if (context.isInjectionDay) return 'Injection Day';
    return `Day ${context.daysSinceInjection} Post-Injection`;
  };

  return (
    <div className={`rounded-lg border-2 mb-4 ${
      context.isPeakSymptomWindow ? 'border-amber-300 bg-amber-50' : 'border-blue-300 bg-blue-50'
    }`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-80 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {context.isPeakSymptomWindow ? '⚠️' : context.isInjectionDay ? '💉' : '📊'}
          </span>
          <div className="text-left">
            <div className="font-medium text-gray-900">
              {getDayDescription()}
              {context.isPeakSymptomWindow && ' - Peak Symptom Window'}
            </div>
            <div className="text-sm text-gray-600">
              {context.warnings.length > 0 ? 
                `${context.warnings.length} consideration${context.warnings.length > 1 ? 's' : ''} for your meal` :
                'Pattern-based meal guidance'
              }
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {context.confidence > 0 && (
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
              {context.confidence}% confidence
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Warnings */}
          {context.warnings.map((warning, index) => (
            <div
              key={index}
              className={`rounded-lg border p-3 ${getWarningColor(warning.severity)}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{warning.icon}</span>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${getWarningTextColor(warning.severity)} mb-1`}>
                    {warning.type === 'caution' ? 'Caution' : 
                     warning.type === 'tip' ? 'Tip' : 'Timing Note'}
                  </div>
                  <p className={`text-sm ${getWarningTextColor(warning.severity)}`}>
                    {warning.message}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Tips */}
          {context.tips.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">💡 Helpful Tips</h4>
              <ul className="space-y-1">
                {context.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confidence Note */}
          {context.confidence < 40 && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600">
                <strong>📈 Building Your Profile:</strong> These insights will become more accurate as you continue logging injections and symptoms. 
                {context.confidence > 0 && ` Current confidence: ${context.confidence}%`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}