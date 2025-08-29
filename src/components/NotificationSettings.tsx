'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { serverNotificationService } from '../services/serverNotificationService';

interface NotificationPreferences {
  userId: string;
  mealReminders: boolean;
  hydrationReminders: boolean;
  educationTips: boolean;
  medicationTiming: boolean;
  progressChecks: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  customMealTimes: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string[];
  };
  reminderStyle: 'gentle' | 'motivational' | 'educational';
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newSnackTime, setNewSnackTime] = useState('');

  useEffect(() => {
    if (user) {
      loadPreferences();
      checkPermissionStatus();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    const prefs = await serverNotificationService.getNotificationPreferences(user.uid);
    setPreferences(prefs);
    setIsLoading(false);
  };

  const checkPermissionStatus = () => {
    const status = serverNotificationService.getPermissionStatus();
    setPermissionStatus(status);
  };

  const handlePermissionRequest = async () => {
    try {
      const permission = await serverNotificationService.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        // Initialize the service and set up default reminders
        await serverNotificationService.initialize();
        if (preferences?.mealReminders) {
          await serverNotificationService.setupMealReminders(user!.uid);
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return;
    
    setIsSaving(true);
    
    try {
      await serverNotificationService.updateNotificationPreferences(user.uid, updates);
      const updatedPrefs = { ...preferences, ...updates };
      setPreferences(updatedPrefs);
      
      console.log('✅ Notification preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSnackTime = () => {
    if (!newSnackTime || !preferences) return;
    
    const currentSnacks = preferences.customMealTimes.snacks || [];
    if (currentSnacks.includes(newSnackTime)) return;
    
    const updatedSnacks = [...currentSnacks, newSnackTime].sort();
    updatePreferences({
      customMealTimes: {
        ...preferences.customMealTimes,
        snacks: updatedSnacks
      }
    });
    
    setNewSnackTime('');
  };

  const removeSnackTime = (timeToRemove: string) => {
    if (!preferences) return;
    
    const updatedSnacks = (preferences.customMealTimes.snacks || [])
      .filter(time => time !== timeToRemove);
    
    updatePreferences({
      customMealTimes: {
        ...preferences.customMealTimes,
        snacks: updatedSnacks
      }
    });
  };

  const testNotification = async () => {
    if (permissionStatus !== 'granted') {
      await handlePermissionRequest();
      return;
    }
    
    await serverNotificationService.sendNotification({
      title: '🎉 Test Notification',
      body: 'Great! Your notifications are working perfectly.',
      tag: 'test_notification',
      icon: '/icons/icon-192x192.png'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-600">Please sign in to configure notifications.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔔 Notification Settings</h2>
        
        {/* Permission Status */}
        <div className="mb-6 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Permission Status</h3>
              <p className="text-sm text-gray-600">
                {permissionStatus === 'granted' && '✅ Notifications enabled'}
                {permissionStatus === 'denied' && '❌ Notifications blocked'}
                {permissionStatus === 'default' && '🔕 Not configured yet'}
              </p>
            </div>
            <div className="flex gap-2">
              {permissionStatus !== 'granted' && (
                <button
                  onClick={handlePermissionRequest}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enable Notifications
                </button>
              )}
              <button
                onClick={testNotification}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Test
              </button>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Notification Types</h3>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">🍽️ Meal Reminders</div>
                <div className="text-sm text-gray-600">Get reminded about meal times</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.mealReminders}
                onChange={(e) => updatePreferences({ mealReminders: e.target.checked })}
                className="w-4 h-4 text-blue-600"
                disabled={isSaving}
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">💧 Hydration Reminders</div>
                <div className="text-sm text-gray-600">Stay hydrated throughout the day</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.hydrationReminders}
                onChange={(e) => updatePreferences({ hydrationReminders: e.target.checked })}
                className="w-4 h-4 text-blue-600"
                disabled={isSaving}
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">📚 Education Tips</div>
                <div className="text-sm text-gray-600">Daily nutrition insights and tips</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.educationTips}
                onChange={(e) => updatePreferences({ educationTips: e.target.checked })}
                className="w-4 h-4 text-blue-600"
                disabled={isSaving}
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">📊 Progress Check-ins</div>
                <div className="text-sm text-gray-600">Weekly motivation and progress tracking</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.progressChecks}
                onChange={(e) => updatePreferences({ progressChecks: e.target.checked })}
                className="w-4 h-4 text-blue-600"
                disabled={isSaving}
              />
            </label>
          </div>
        </div>

        {/* Reminder Style */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Reminder Style</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {[
              { value: 'gentle', label: 'Gentle', description: 'Soft, supportive reminders' },
              { value: 'motivational', label: 'Motivational', description: 'Energetic, encouraging messages' },
              { value: 'educational', label: 'Educational', description: 'Science-backed insights' }
            ].map((style) => (
              <label
                key={style.value}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  preferences.reminderStyle === style.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="reminderStyle"
                  value={style.value}
                  checked={preferences.reminderStyle === style.value}
                  onChange={(e) => updatePreferences({ reminderStyle: e.target.value as any })}
                  className="sr-only"
                  disabled={isSaving}
                />
                <div className="font-medium text-gray-900">{style.label}</div>
                <div className="text-xs text-gray-600">{style.description}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Meal Times */}
        {preferences.mealReminders && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Meal Times</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🌅 Breakfast
                </label>
                <input
                  type="time"
                  value={preferences.customMealTimes.breakfast || ''}
                  onChange={(e) => updatePreferences({
                    customMealTimes: {
                      ...preferences.customMealTimes,
                      breakfast: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ☀️ Lunch
                </label>
                <input
                  type="time"
                  value={preferences.customMealTimes.lunch || ''}
                  onChange={(e) => updatePreferences({
                    customMealTimes: {
                      ...preferences.customMealTimes,
                      lunch: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🌙 Dinner
                </label>
                <input
                  type="time"
                  value={preferences.customMealTimes.dinner || ''}
                  onChange={(e) => updatePreferences({
                    customMealTimes: {
                      ...preferences.customMealTimes,
                      dinner: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Snack Times */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🍎 Snack Times
              </label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {(preferences.customMealTimes.snacks || []).map((snackTime) => (
                  <div
                    key={snackTime}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{snackTime}</span>
                    <button
                      onClick={() => removeSnackTime(snackTime)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      disabled={isSaving}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newSnackTime}
                  onChange={(e) => setNewSnackTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSaving}
                />
                <button
                  onClick={addSnackTime}
                  disabled={!newSnackTime || isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiet Hours */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🌙 Quiet Hours</h3>
          
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={preferences.quietHours.enabled}
              onChange={(e) => updatePreferences({
                quietHours: {
                  ...preferences.quietHours,
                  enabled: e.target.checked
                }
              })}
              className="w-4 h-4 text-blue-600 mr-3"
              disabled={isSaving}
            />
            <span className="text-sm text-gray-700">
              Enable quiet hours (no notifications during this time)
            </span>
          </label>

          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => updatePreferences({
                    quietHours: {
                      ...preferences.quietHours,
                      start: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => updatePreferences({
                    quietHours: {
                      ...preferences.quietHours,
                      end: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSaving}
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Status */}
        {isSaving && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-600">Saving preferences...</span>
          </div>
        )}
      </div>
    </div>
  );
}