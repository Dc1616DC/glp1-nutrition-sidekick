'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { injectionSymptomCorrelationService } from '@/services/injectionSymptomCorrelationService';

interface InjectionCorrelationInsights {
  patterns: any[];
  peakSymptomWindow: {
    days: number[];
    description: string;
  } | null;
  siteCorrelations: any[];
  doseCorrelations: any[];
  recommendations: string[];
  confidenceScore: number;
}

export default function InjectionSymptomInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<InjectionCorrelationInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user]);

  const loadInsights = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const correlationInsights = await injectionSymptomCorrelationService.analyzeInjectionSymptomCorrelations(user.uid);
      setInsights(correlationInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const getConfidenceColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 70) return 'High Confidence';
    if (score >= 40) return 'Medium Confidence';
    if (score > 0) return 'Low Confidence';
    return 'Insufficient Data';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h3 className="font-semibold text-gray-900">Injection-Symptom Patterns</h3>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(insights.confidenceScore)}`}>
            {getConfidenceLabel(insights.confidenceScore)} ({insights.confidenceScore}%)
          </div>
        </div>
      </div>

      <div className="p-4">
        {insights.confidenceScore === 0 ? (
          // Insufficient data state
          <div className="text-center py-6">
            <div className="text-4xl mb-2">📈</div>
            <h4 className="font-medium text-gray-900 mb-2">Building Your Pattern Profile</h4>
            <p className="text-sm text-gray-600 mb-4">
              Keep logging injections and symptoms to unlock personalized insights
            </p>
            <div className="bg-blue-50 rounded-lg p-3 text-left">
              <p className="text-sm text-blue-800 font-medium mb-1">What you'll discover:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• When symptoms typically peak after injections</li>
                <li>• Which injection sites work best for you</li>
                <li>• How dose changes affect your symptom patterns</li>
                <li>• Personalized timing recommendations</li>
              </ul>
            </div>
          </div>
        ) : (
          // Show insights
          <div className="space-y-4">
            {/* Peak Symptom Window */}
            {insights.peakSymptomWindow && (
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <h4 className="font-medium text-red-900 mb-1 flex items-center gap-1">
                  ⏰ Peak Symptom Window
                </h4>
                <p className="text-sm text-red-800">{insights.peakSymptomWindow.description}</p>
              </div>
            )}

            {/* Top Patterns */}
            {insights.patterns.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">🔍 Your Patterns</h4>
                {insights.patterns.slice(0, 3).map((pattern, index) => (
                  <div key={pattern.symptom} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 capitalize">{pattern.symptom}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          pattern.confidence === 'high' ? 'bg-green-100 text-green-700' :
                          pattern.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {pattern.confidence} confidence
                        </span>
                        <span className="text-xs text-gray-500">
                          Severity: {pattern.avgSeverity}/10
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{pattern.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-1">
                  💡 Personalized Recommendations
                </h4>
                <ul className="space-y-1">
                  {insights.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Analysis Toggle */}
            {(insights.siteCorrelations.length > 0 || insights.doseCorrelations.length > 0) && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-center py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                {showDetails ? 'Hide' : 'Show'} Detailed Analysis
                <span className="ml-1">{showDetails ? '↑' : '↓'}</span>
              </button>
            )}

            {/* Detailed Analysis */}
            {showDetails && (
              <div className="space-y-4 border-t pt-4">
                {/* Site Correlations */}
                {insights.siteCorrelations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">📍 Injection Site Analysis</h4>
                    <div className="grid gap-2">
                      {insights.siteCorrelations.map((site, index) => (
                        <div key={site.site} className="bg-gray-50 rounded p-2">
                          <div className="font-medium text-sm text-gray-900 capitalize mb-1">
                            {site.site.replace('-', ' ')}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {site.symptoms.slice(0, 3).map((symptom: any) => (
                              <span key={symptom.symptom} className="text-xs bg-white px-2 py-1 rounded">
                                {symptom.symptom} ({symptom.frequency}x)
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dose Correlations */}
                {insights.doseCorrelations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">💉 Dose Response Analysis</h4>
                    <div className="space-y-2">
                      {insights.doseCorrelations.map((dose, index) => (
                        <div key={dose.dose} className="bg-gray-50 rounded p-2 flex items-center justify-between">
                          <span className="font-medium text-sm">{dose.dose}mg</span>
                          <div className="text-right">
                            <div className="text-xs text-gray-600">Avg Severity: {dose.avgSymptomSeverity}/10</div>
                            <div className="text-xs text-gray-500">
                              {dose.commonSymptoms.join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Medical Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-yellow-800">
                <strong>📋 Medical Note:</strong> These patterns are for informational purposes. 
                Share insights with your healthcare provider to optimize your treatment plan.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}