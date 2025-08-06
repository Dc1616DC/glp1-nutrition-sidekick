'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { proAnalyticsService, ComprehensiveAnalytics } from '../services/proAnalyticsService';

interface ProAnalyticsDashboardProps {
  className?: string;
}

export default function ProAnalyticsDashboard({ className = '' }: ProAnalyticsDashboardProps) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<30 | 60 | 90>(30);

  useEffect(() => {
    if (!user) return;
    loadAnalytics();
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await proAnalyticsService.generateComprehensiveAnalytics(user.uid, timeRange);
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (trend: 'improving' | 'worsening' | 'stable') => {
    switch (trend) {
      case 'improving': return '📈';
      case 'worsening': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: 'improving' | 'worsening' | 'stable') => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'worsening': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!user) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600">Please sign in to view pro analytics</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Analyzing your health data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadAnalytics}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📊 Pro Analytics Dashboard</h2>
          <p className="text-gray-600">Advanced insights into your GLP-1 journey</p>
        </div>
        
        <div className="flex space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value) as 30 | 60 | 90)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Personalized Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${getScoreBg(analytics.personalizedScore.overall)}`}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(analytics.personalizedScore.overall)}`}>
              {analytics.personalizedScore.overall}
            </div>
            <div className="text-sm font-medium text-gray-700">Overall Score</div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${getScoreBg(analytics.personalizedScore.nutrition)}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(analytics.personalizedScore.nutrition)}`}>
              {analytics.personalizedScore.nutrition}
            </div>
            <div className="text-sm font-medium text-gray-700">Nutrition</div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${getScoreBg(analytics.personalizedScore.symptomManagement)}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(analytics.personalizedScore.symptomManagement)}`}>
              {analytics.personalizedScore.symptomManagement}
            </div>
            <div className="text-sm font-medium text-gray-700">Symptom Management</div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${getScoreBg(analytics.personalizedScore.consistency)}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(analytics.personalizedScore.consistency)}`}>
              {analytics.personalizedScore.consistency}
            </div>
            <div className="text-sm font-medium text-gray-700">Consistency</div>
          </div>
        </div>
      </div>

      {/* Progress Insights */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Progress Insights</h3>
        
        {analytics.progressInsights.length === 0 ? (
          <p className="text-gray-600 italic">Keep tracking for more detailed insights</p>
        ) : (
          <div className="space-y-4">
            {analytics.progressInsights.map((insight, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{insight.metric}</span>
                    <span className={getTrendColor(insight.trend)}>
                      {getTrendIcon(insight.trend)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{insight.recommendation}</p>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold ${getTrendColor(insight.trend)}`}>
                    {insight.changePercent > 0 ? '+' : ''}{insight.changePercent.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {insight.confidence * 100}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Symptom Patterns */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🕒 Symptom Patterns</h3>
        
        {analytics.symptomPatterns.length === 0 ? (
          <p className="text-gray-600 italic">No patterns detected yet. Keep tracking!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.symptomPatterns.slice(0, 6).map((pattern, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize text-gray-800">
                    {pattern.symptom}
                  </span>
                  <span className={`text-sm ${getTrendColor(pattern.trend)}`}>
                    {getTrendIcon(pattern.trend)}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="capitalize">{pattern.timeOfDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span>{pattern.frequency}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Severity:</span>
                    <span>{pattern.avgSeverity.toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meal Related:</span>
                    <span>{pattern.mealCorrelation > 0 ? 'Often' : 'Rarely'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meal Effectiveness Analysis */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🍽️ Meal Effectiveness</h3>
        
        <div className="space-y-4">
          {analytics.mealEffectiveness.map((meal, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-800">{meal.mealType}</h4>
                  <p className="text-sm text-gray-600">Best time: {meal.optimalTiming}</p>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold">
                    {meal.symptomReduction}% symptom reduction
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Protein:</span>
                  <span className="font-medium ml-1">{meal.protein}g</span>
                </div>
                <div>
                  <span className="text-gray-600">Fiber:</span>
                  <span className="font-medium ml-1">{meal.fiber}g</span>
                </div>
                <div>
                  <span className="text-gray-600">Satisfaction:</span>
                  <span className="font-medium ml-1">{meal.satisfactionScore}/100</span>
                </div>
                <div>
                  <span className="text-gray-600">Tolerance:</span>
                  <span className="font-medium ml-1">{meal.toleranceScore}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Model */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔮 Predictive Insights</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Factors */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">⚠️ Risk Factors</h4>
            <div className="space-y-2">
              {analytics.predictiveModel.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${risk.impact * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-800">{risk.factor}</div>
                    <div className="text-xs text-gray-600">{risk.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recommendations */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">💡 Recommendations</h4>
            <div className="space-y-3">
              {analytics.predictiveModel.recommendations.map((rec, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  rec.priority === 'high' ? 'bg-red-50 border-l-4 border-red-400' :
                  rec.priority === 'medium' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                  'bg-gray-50 border-l-4 border-gray-400'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rec.priority}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{rec.category}</span>
                  </div>
                  <div className="font-medium text-sm text-gray-800">{rec.action}</div>
                  <div className="text-xs text-gray-600 mt-1">{rec.expectedBenefit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Symptom Risk */}
        {analytics.predictiveModel.nextSymptomRisk.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">🔍 Upcoming Risk Assessment</h4>
            <div className="space-y-2">
              {analytics.predictiveModel.nextSymptomRisk.map((risk, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium capitalize text-gray-800">{risk.symptom}</span>
                    <span className="text-sm text-gray-600 ml-2">in {risk.timeframe}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium text-blue-600">
                      {(risk.probability * 100).toFixed(0)}% chance
                    </div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${risk.probability * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Medical Disclaimer:</strong> These analytics are for informational purposes only 
              and should not replace professional medical advice. Always consult with your healthcare 
              provider about your GLP-1 medication and any concerning symptoms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}