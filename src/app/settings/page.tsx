'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EveningToolkit from '../../components/EveningToolkit';

export default function SettingsPage() {
  const { user } = useAuth();
  const [showTestToolkit, setShowTestToolkit] = useState(false);

  const getToolkitHistory = () => {
    const history = JSON.parse(localStorage.getItem('eveningToolkitHistory') || '[]');
    return history.slice(-10); // Show last 10 check-ins
  };

  const clearToolkitHistory = () => {
    localStorage.removeItem('eveningToolkitHistory');
    localStorage.removeItem('eveningToolkitLastShown');
    localStorage.removeItem('eveningToolkitFollowUps');
    localStorage.removeItem('eveningToolkitFollowUpData');
    localStorage.removeItem('eveningToolkitFollowUpScheduled');
    localStorage.removeItem('eveningToolkitMaybeLater');
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Evening Toolkit</h1>
          <p className="text-gray-600">Please sign in to access the Evening Toolkit.</p>
        </div>
      </div>
    );
  }

  const history = getToolkitHistory();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">⚙️ Settings</h1>
        <p className="text-gray-600">Manage your app preferences and tools</p>
      </div>

      {/* Quick Settings Links */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <a
          href="/notifications"
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🔔</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">Meal reminders, tips, and progress check-ins</p>
            </div>
          </div>
        </a>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🌙</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Evening Toolkit</h3>
              <p className="text-sm text-gray-600">Gentle check-ins for evening eating patterns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Evening Toolkit Section */}
      <div className="max-w-2xl">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">🌙 Evening Toolkit</h2>
          <p className="text-gray-600">Manage your evening eating patterns with gentle check-ins</p>
        </div>

      {/* Evening Toolkit Settings */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            A gentle check-in tool to help manage evening eating episodes and build awareness around your eating patterns. 
            Based on intuitive eating principles and evidence-based approaches.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Best used during evening hours (6 PM - 11 PM)</li>
              <li>• Guides you through hunger and emotion check-ins</li>
              <li>• Suggests activities based on your current state</li>
              <li>• Includes a 10-minute mindful break timer</li>
              <li>• Tracks patterns to help build awareness</li>
              <li>• Follow-up check-in 30 minutes later for reflection</li>
            </ul>
          </div>

          <button
            onClick={() => setShowTestToolkit(true)}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            🌟 Start Evening Check-In
          </button>
        </div>

        {history.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900">Recent Check-ins</h3>
              <button
                onClick={clearToolkitHistory}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear History
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((entry: any, index: number) => (
                <div key={index} className="text-sm bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">
                        Hunger: {entry.hungerFullnessLevel || 'N/A'}/10
                      </span>
                      {entry.feelings?.length > 0 && (
                        <span className="text-gray-600 ml-2">
                          • {entry.feelings.map((f: string) => f.replace('-', ' ')).join(', ')}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {entry.selectedActivity && (
                    <div className="text-gray-600 mt-1">
                      Activity: {entry.selectedActivity.title}
                    </div>
                  )}
                  {entry.reflectionNotes && (
                    <div className="text-gray-600 mt-1 text-xs italic">
                      "{entry.reflectionNotes.substring(0, 60)}{entry.reflectionNotes.length > 60 ? '...' : ''}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Privacy Note */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>Privacy Note:</strong> Your Evening Toolkit data is stored locally in your browser and never leaves your device.
        </p>
      </div>

      {/* Test Evening Toolkit Modal */}
      {showTestToolkit && (
        <EveningToolkit
          onComplete={() => setShowTestToolkit(false)}
          onSkip={() => setShowTestToolkit(false)}
        />
      )}
    </div>
  );
}