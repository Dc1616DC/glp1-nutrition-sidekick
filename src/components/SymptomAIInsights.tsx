'use client';

import { useState, useEffect } from 'react';
import { symptomInsightsService } from '../services/symptomInsightsService';
import { useAuth } from '../context/AuthContext';

interface SymptomInsight {
  symptom: string;
  frequency: number;
  averageSeverity: number;
  timePattern?: string;
  triggers?: string[];
  strategies: string[];
}

const SYMPTOM_LABELS: { [key: string]: { label: string; emoji: string } } = {
  nausea: { label: 'Nausea', emoji: '🤢' },
  constipation: { label: 'Constipation', emoji: '🚽' },
  fatigue: { label: 'Fatigue', emoji: '😴' },
  fullness: { label: 'Early Fullness', emoji: '🍽️' },
  cravings: { label: 'Cravings', emoji: '🍩' },
  heartburn: { label: 'Heartburn', emoji: '🔥' },
  bloating: { label: 'Bloating', emoji: '🎈' },
  dizziness: { label: 'Dizziness', emoji: '💫' },
};

export default function SymptomAIInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<SymptomInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      // Fetch symptom logs from last 30 days
      const logs = await symptomInsightsService.analyzeSymptomLogs(user.uid, 30);
      
      if (logs.length === 0) {
        setError('No symptom data found. Please log some symptoms first to get personalized insights.');
        setLoading(false);
        return;
      }

      // Generate insights from the logs
      const generatedInsights = symptomInsightsService.generateInsights(logs);
      setInsights(generatedInsights);
      setShowInsights(true);
    } catch (error) {
      console.error('Error generating insights:', error);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">🤖 AI-Powered Symptom Insights</h3>
        <p className="text-sm text-gray-600">
          Get personalized strategies based on your symptom patterns and trends
        </p>
      </div>

      {!showInsights ? (
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">
              Ready to discover your symptom patterns?
            </h4>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Our AI analyzes your logged symptoms to provide personalized management strategies 
              tailored to your specific patterns and triggers.
            </p>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-w-md mx-auto">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : null}

          <button
            onClick={generateInsights}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Analyzing your symptoms...</span>
              </>
            ) : (
              <>
                <span>Generate Insights</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Symptoms Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">📊 Your Top Symptoms (Last 30 Days)</h4>
            <div className="flex flex-wrap gap-2">
              {insights.slice(0, 3).map(insight => (
                <div key={insight.symptom} className="bg-white rounded-lg px-3 py-2 text-sm">
                  <span className="mr-1">{SYMPTOM_LABELS[insight.symptom]?.emoji}</span>
                  <span className="font-medium">{SYMPTOM_LABELS[insight.symptom]?.label}</span>
                  <span className="text-gray-600 ml-1">({insight.frequency}x)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Insights */}
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={insight.symptom} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{SYMPTOM_LABELS[insight.symptom]?.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {SYMPTOM_LABELS[insight.symptom]?.label}
                      </h4>
                      <div className="flex gap-3 text-xs text-gray-600 mt-1">
                        <span>Frequency: {insight.frequency}x</span>
                        <span>Avg Severity: {insight.averageSeverity.toFixed(1)}/10</span>
                        {insight.timePattern && (
                          <span>Most common: {insight.timePattern}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {insight.triggers && insight.triggers.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Potential triggers: </span>
                    <span className="text-sm text-gray-600">
                      {insight.triggers.join(', ')}
                    </span>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    💡 Personalized Strategies:
                  </h5>
                  <ul className="space-y-1">
                    {insight.strategies.map((strategy, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 text-xl flex-shrink-0">⚠️</span>
              <div className="text-sm text-amber-800">
                <strong className="block mb-1">Important Medical Disclaimer:</strong>
                <p className="leading-relaxed">
                  These insights are based on your logged symptoms and are for informational purposes only. 
                  They are not a substitute for professional medical advice, diagnosis, or treatment. 
                  Always consult with your healthcare provider about any symptoms you're experiencing, 
                  especially if they persist, worsen, or concern you. If you experience severe symptoms, 
                  seek immediate medical attention. Your GLP-1 medication provider should be informed of 
                  any persistent side effects.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowInsights(false);
                setInsights([]);
              }}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Close Insights
            </button>
            <button
              onClick={generateInsights}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Refresh Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}