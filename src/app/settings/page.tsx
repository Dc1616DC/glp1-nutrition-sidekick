'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import EveningToolkit from '../../components/EveningToolkit';

export default function SettingsPage() {
  const { user } = useAuth();
  const [eveningToolkitEnabled, setEveningToolkitEnabled] = useState(false);
  const [showTestToolkit, setShowTestToolkit] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  useEffect(() => {
    // Load settings from localStorage
    const toolkitEnabled = localStorage.getItem('eveningToolkitEnabled') === 'true';
    setEveningToolkitEnabled(toolkitEnabled);

    // Check notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const toggleEveningToolkit = () => {
    const newValue = !eveningToolkitEnabled;
    setEveningToolkitEnabled(newValue);
    localStorage.setItem('eveningToolkitEnabled', newValue.toString());
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const getToolkitHistory = () => {
    const history = JSON.parse(localStorage.getItem('eveningToolkitHistory') || '[]');
    return history.slice(-10); // Show last 10 check-ins
  };

  const getFollowUpHistory = () => {
    const followUps = JSON.parse(localStorage.getItem('eveningToolkitFollowUps') || '[]');
    return followUps.slice(-5); // Show last 5 follow-ups
  };

  const clearToolkitHistory = () => {
    localStorage.removeItem('eveningToolkitHistory');
    localStorage.removeItem('eveningToolkitLastShown');
    localStorage.removeItem('eveningToolkitFollowUps');
    localStorage.removeItem('eveningToolkitFollowUpData');
    localStorage.removeItem('eveningToolkitFollowUpScheduled');
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
          <p className="text-gray-600">Please sign in to access your settings.</p>
        </div>
      </div>
    );
  }

  const history = getToolkitHistory();
  const followUpHistory = getFollowUpHistory();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Customize your GLP-1 nutrition experience</p>
      </div>

      {/* Evening Toolkit Settings */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">🌙 Evening Toolkit</h2>
            <p className="text-sm text-gray-600 mb-4">
              A gentle check-in tool to help manage evening eating episodes and build awareness around your eating patterns. 
              Based on intuitive eating principles and evidence-based approaches.
            </p>
          </div>
          <button
            onClick={toggleEveningToolkit}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              eveningToolkitEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                eveningToolkitEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {eveningToolkitEnabled && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Appears during evening hours (6 PM - 11 PM)</li>
                <li>• Guides you through hunger and emotion check-ins</li>
                <li>• Suggests activities based on your current state</li>
                <li>• Includes a 10-minute mindful break timer</li>
                <li>• Tracks patterns to help build awareness</li>
                <li>• Follow-up check-in 30 minutes later for reflection</li>
              </ul>
            </div>

            <button
              onClick={() => setShowTestToolkit(true)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🧪 Test Evening Toolkit Now
            </button>
          </div>
        )}

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
                        Hunger: {entry.physicalHunger}/10
                      </span>
                      {entry.emotions?.length > 0 && (
                        <span className="text-gray-600 ml-2">
                          • {entry.emotions.join(', ')}
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
                </div>
              ))}
            </div>
          </div>
        )}

        {followUpHistory.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Recent Follow-up Reflections</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {followUpHistory.map((followUp: any, index: number) => (
                <div key={index} className="text-sm bg-purple-50 p-3 rounded border border-purple-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-purple-800">
                        Feeling: {followUp.currentFeeling?.replace('-', ' ') || 'Not specified'}
                      </span>
                      {followUp.reflection && (
                        <div className="text-purple-700 mt-1 text-xs">
                          "{followUp.reflection.substring(0, 60)}{followUp.reflection.length > 60 ? '...' : ''}"
                        </div>
                      )}
                    </div>
                    <span className="text-purple-600 text-xs">
                      {new Date(followUp.followUpTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔔 Notifications</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-900">Browser Notifications</h3>
              <p className="text-sm text-gray-600">
                Status: <span className="capitalize">{notificationPermission}</span>
              </p>
            </div>
            {notificationPermission === 'default' && (
              <button
                onClick={requestNotificationPermission}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enable
              </button>
            )}
          </div>

          {notificationPermission === 'granted' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✅ Notifications are enabled. You'll receive reminders for meals and other important updates.
              </p>
            </div>
          )}

          {notificationPermission === 'denied' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                ❌ Notifications are blocked. To enable, go to your browser settings and allow notifications for this site.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔒 Data & Privacy</h2>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Local Storage</h3>
            <p>Your preferences and Evening Toolkit history are stored locally in your browser. This data never leaves your device.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Account Data</h3>
            <p>Your meal preferences and nutrition calculations are securely stored in our database and are only accessible to you.</p>
          </div>
        </div>
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