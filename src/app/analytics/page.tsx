'use client';

import { useState } from 'react';
import ProAnalyticsDashboard from '../../components/ProAnalyticsDashboard';

export default function AnalyticsPage() {
  const [showProFeatures, setShowProFeatures] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Advanced Analytics
        </h1>
        <p className="text-gray-600">
          Comprehensive insights into your GLP-1 journey with predictive analytics and personalized recommendations
        </p>
      </div>

      {/* Pro Features Toggle */}
      {!showProFeatures && (
        <div className="mb-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">🚀 Unlock Pro Analytics</h2>
              <p className="text-purple-100 mb-4">
                Get advanced insights with predictive modeling, meal effectiveness analysis, 
                and personalized recommendations based on your unique patterns.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-green-300">✓</span>
                  <span className="text-sm">Symptom pattern analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-300">✓</span>
                  <span className="text-sm">Meal effectiveness scoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-300">✓</span>
                  <span className="text-sm">Predictive risk modeling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-300">✓</span>
                  <span className="text-sm">Personalized recommendations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-300">✓</span>
                  <span className="text-sm">Progress tracking & trends</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-300">✓</span>
                  <span className="text-sm">Healthcare provider reports</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">$9.99/mo</div>
              <button 
                onClick={() => setShowProFeatures(true)}
                className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors mb-2"
              >
                Try Free for 7 Days
              </button>
              <div className="text-xs text-purple-200">
                Cancel anytime • No commitment
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      {showProFeatures && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-blue-500">ℹ️</span>
            <div>
              <span className="font-medium text-blue-800">Demo Mode: </span>
              <span className="text-blue-700">
                You're viewing pro analytics with sample data. In the full version, 
                this would use your actual symptom and meal tracking data.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Basic Analytics (Always Available) */}
      {!showProFeatures && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Basic Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">14</div>
                <div className="text-sm text-gray-600">Days Tracked</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">3.2</div>
                <div className="text-sm text-gray-600">Avg Symptom Severity</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">68%</div>
                <div className="text-sm text-gray-600">Meal-Related Symptoms</div>
              </div>
            </div>

            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <p className="text-gray-600 mb-4">
                Upgrade to Pro for detailed charts, trends, and personalized insights
              </p>
              <button 
                onClick={() => setShowProFeatures(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                View Pro Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pro Analytics Dashboard */}
      {showProFeatures && (
        <ProAnalyticsDashboard className="space-y-6" />
      )}

      {/* Educational Content */}
      <div className="mt-12 bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Understanding Your Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Health Scores</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Overall Score:</strong> Comprehensive health rating (0-100)</li>
              <li>• <strong>Nutrition Score:</strong> Based on protein, fiber, and meal timing</li>
              <li>• <strong>Symptom Management:</strong> How well you're managing side effects</li>
              <li>• <strong>Consistency:</strong> Regular tracking and meal scheduling</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Predictive Insights</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Pattern Recognition:</strong> Identifies symptom triggers</li>
              <li>• <strong>Risk Assessment:</strong> Predicts potential symptom flares</li>
              <li>• <strong>Meal Effectiveness:</strong> Ranks meals by symptom reduction</li>
              <li>• <strong>Personalized Tips:</strong> Tailored recommendations for you</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Remember:</strong> These insights complement, but don't replace, professional medical advice. 
            Always discuss significant changes or concerns with your healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
}