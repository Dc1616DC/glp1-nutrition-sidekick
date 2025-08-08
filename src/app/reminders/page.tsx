'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../../firebase/db';
import {
  getNotificationPermissionState,
  requestNotificationPermission,
} from '../../services/simpleNotificationService';
import mealReminderService from '../../services/mealReminderService';
import TestNotification from './test-notification';

export default function RemindersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State for notification time settings
  const [notificationSettings, setNotificationSettings] = useState({
    breakfast: '08:00',
    morningSnack: '10:30',
    lunch: '12:30',
    afternoonSnack: '15:30',
    dinner: '18:00',
  });
  
  // State for enabled/disabled status of each reminder
  const [enabledReminders, setEnabledReminders] = useState({
    breakfast: true,
    morningSnack: true,
    lunch: true,
    afternoonSnack: true,
    dinner: true,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', message: '' });
  const [profileLoading, setProfileLoading] = useState(true);

  // Push-notification permission state
  const [notificationStatus, setNotificationStatus] = useState<
    'unchecked' | 'granted' | 'denied' | 'default' | 'unsupported' | 'error'
  >('unchecked');

  // Fetch user's current notification settings
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile?.notificationSettings) {
          // Update notification times from profile
          setNotificationSettings(prev => ({
            ...prev,
            ...userProfile.notificationSettings
          }));

          // Set enabled status based on whether times are set (not empty)
          const enabled = Object.keys(notificationSettings).reduce((acc: any, key) => {
            acc[key] = !!(userProfile.notificationSettings as any)?.[key];
            return acc;
          }, {});
          setEnabledReminders(enabled as any);
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserSettings();
  }, [user, authLoading]);

  // Determine current browser permission on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const current = getNotificationPermissionState();
    setNotificationStatus(current);
  }, []);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin?redirect=reminders');
    }
  }, [user, authLoading, router]);

  // Handle time change for a specific meal
  const handleTimeChange = (meal: string, time: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [meal]: time
    }));
  };

  // Handle toggling a reminder on/off
  const handleToggleReminder = (meal: string) => {
    setEnabledReminders(prev => ({
      ...prev,
      [meal]: !prev[meal as keyof typeof prev]
    }));
  };

  // Save notification settings to user profile AND schedule actual notifications
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setSaveMessage({ type: 'error', message: 'You must be signed in to save settings.' });
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage({ type: '', message: '' });
      
      // Create settings object, setting disabled reminders to empty string
      const settingsToSave = Object.keys(notificationSettings).reduce((acc, meal) => {
        acc[meal] = enabledReminders[meal as keyof typeof enabledReminders] ? notificationSettings[meal as keyof typeof notificationSettings] : '';
        return acc;
      }, {} as any);

      // Save to Firebase
      await updateUserProfile(user.uid, {
        notificationSettings: settingsToSave
      });
      
      // ✨ NEW: Schedule actual notifications using the meal reminder system
      try {
        // Initialize the meal reminder system if not already done
        await mealReminderService.initialize();
        await mealReminderService.requestPermission();
        
        // Clear any existing reminders first
        mealReminderService.clearAllReminders();
        
        // Use the modern API to schedule all reminders at once
        const success = await mealReminderService.scheduleFromSettings(
          notificationSettings, 
          enabledReminders
        );
        
        if (success) {
          const enabledCount = Object.values(enabledReminders).filter(Boolean).length;
          setSaveMessage({ 
            type: 'success', 
            message: `Settings saved and ${enabledCount} meal reminders scheduled successfully! 🎉` 
          });
        } else {
          setSaveMessage({ 
            type: 'warning', 
            message: 'Settings saved, but failed to schedule notifications. You may need to enable browser notifications.' 
          });
        }
      } catch (notificationError) {
        console.error('Error scheduling notifications:', notificationError);
        setSaveMessage({ 
          type: 'warning', 
          message: 'Settings saved, but failed to schedule notifications. You may need to enable browser notifications.' 
        });
      }
      
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setSaveMessage({ type: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle enabling push notifications
  const handleEnableNotifications = async () => {
    if (!user) return;
    
    try {
      setSaveMessage({ type: 'info', message: 'Requesting notification permission...' });
      
      const result = await requestNotificationPermission(user.uid);
      setNotificationStatus(result.status);
      
      if (result.status === 'granted') {
        setSaveMessage({ 
          type: 'success', 
          message: 'Notification permission granted! You can now receive meal reminders.' 
        });
      } else if (result.status === 'denied') {
        setSaveMessage({ 
          type: 'error', 
          message: 'Notification permission denied. You can still use the app, but won\'t receive reminders.' 
        });
      } else {
        setSaveMessage({ 
          type: 'warning', 
          message: 'Notification permission not available on this device or browser.' 
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setSaveMessage({ 
        type: 'error', 
        message: 'Failed to request notification permission. Please try again.' 
      });
    }
  };

  // If user is not authenticated, don't render the page content
  if (!user) {
    return <div className="text-center py-10">Please sign in to set up reminders.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Meal Reminders</h1>

      
      {/* Explanation Section */}
      <div className="bg-blue-50 p-4 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">How Reminders Work</h2>
        <p className="text-blue-700 mb-2">
          When you enable meal reminders, your browser will send you notifications at the times you set. 
          These work even when you have other tabs open or when the app is minimized.
        </p>
        <p className="text-blue-700">
          First, you'll need to grant notification permission to your browser, then set your preferred meal times below.
        </p>
      </div>

      {/* Integration Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <h3 className="text-lg font-semibold text-green-800 mb-2">🎯 Meal Logging Integration</h3>
        <p className="text-green-700 mb-2">
          Your reminders are automatically synced with your meal logging goals. When you set which meals to track in the 
          <strong> Meal Logger</strong>, those same meals will be enabled for reminders here.
        </p>
        <div className="flex items-center justify-between">
          <p className="text-green-700 text-sm">
            Want to change which meals you track and get reminders for?
          </p>
          <a 
            href="/meal-log" 
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            📝 Go to Meal Logger
          </a>
        </div>
      </div>

      {/* Notification Permission Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Browser Notifications</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 mb-2">Status: 
              <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                notificationStatus === 'granted' ? 'bg-green-100 text-green-800' :
                notificationStatus === 'denied' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {notificationStatus === 'granted' ? 'Enabled ✓' :
                 notificationStatus === 'denied' ? 'Blocked ✗' :
                 notificationStatus === 'default' ? 'Not Set' :
                 notificationStatus === 'unsupported' ? 'Not Supported' :
                 'Unknown'}
              </span>
            </p>
            
            {notificationStatus === 'denied' && (
              <p className="text-sm text-red-600">
                Notifications are blocked. Please enable them in your browser settings and refresh this page.
              </p>
            )}
            
            {notificationStatus === 'unsupported' && (
              <p className="text-sm text-gray-600">
                Your browser doesn't support notifications, but you can still use the in-app reminders.
              </p>
            )}
          </div>

          {(notificationStatus === 'default' || notificationStatus === 'unchecked') && (
            <button
              onClick={handleEnableNotifications}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Enable Notifications
            </button>
          )}
        </div>
      </div>

      {/* Test notification component (shown only if notifications are granted) */}
      {notificationStatus === 'granted' && <TestNotification />}
      
      {profileLoading ? (
        <div className="text-center py-6">Loading your settings...</div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Meal Reminder Settings */}
          <div className="space-y-4">
            {Object.entries({
              breakfast: 'Breakfast',
              morningSnack: 'Morning Snack',
              lunch: 'Lunch',
              afternoonSnack: 'Afternoon Snack',
              dinner: 'Dinner'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={enabledReminders[key as keyof typeof enabledReminders]}
                      onChange={() => handleToggleReminder(key)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-lg font-medium text-gray-800">{label}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="time"
                    value={notificationSettings[key as keyof typeof notificationSettings]}
                    onChange={(e) => handleTimeChange(key, e.target.value)}
                    disabled={!enabledReminders[key as keyof typeof enabledReminders]}
                    className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !enabledReminders[key as keyof typeof enabledReminders] ? 'bg-gray-100 text-gray-400' : 'bg-white'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Reminder Settings'}
            </button>
          </div>

          {/* Status Message */}
          {saveMessage.message && (
            <div className={`p-4 rounded-lg text-center ${
              saveMessage.type === 'success' ? 'bg-green-100 text-green-800' :
              saveMessage.type === 'error' ? 'bg-red-100 text-red-800' :
              saveMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {saveMessage.message}
            </div>
          )}
        </form>
      )}

    </div>
  );
}
