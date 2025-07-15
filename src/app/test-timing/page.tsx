'use client';

import { useState, useEffect } from 'react';
import mealReminderService from '../../services/mealReminderService';

export default function TestTiming() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const testScheduling = async () => {
    setIsLoading(true);
    setTestResult('Testing...');

    try {
      // Initialize system
      await mealReminderService.initialize();
      await mealReminderService.requestPermission();

      // Get current time and add 2 minutes for quick test
      const now = new Date();
      const testTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now
      const testTimeString = testTime.toTimeString().substring(0, 5);

      const testSettings = {
        breakfast: testTimeString,
        lunch: '12:30',
        dinner: '18:00',
        morningSnack: testTimeString,
        afternoonSnack: '15:30'
      };

      const testEnabled = {
        breakfast: true,
        lunch: false,
        dinner: false,
        morningSnack: true,
        afternoonSnack: false
      };

      console.log('Test settings:', testSettings);
      console.log('Test enabled:', testEnabled);

      // Clear existing reminders
      mealReminderService.clearAllReminders();

      // Schedule test reminders
      const success = await mealReminderService.scheduleFromSettings(testSettings, testEnabled);

      if (success) {
        setTestResult(`✅ Successfully scheduled test reminders for ${testTimeString} (in 2 minutes)`);
      } else {
        setTestResult('❌ Failed to schedule test reminders');
      }

    } catch (error) {
      console.error('Test error:', error);
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testImmediateNotification = async () => {
    setIsLoading(true);
    setTestResult('Testing immediate notification...');

    try {
      await mealReminderService.initialize();
      
      // First check notification permission
      const permission = Notification.permission;
      console.log('Current notification permission:', permission);
      
      if (permission !== 'granted') {
        if (permission === 'default') {
          console.log('Requesting notification permission...');
          const newPermission = await Notification.requestPermission();
          console.log('New permission status:', newPermission);
          
          if (newPermission !== 'granted') {
            setTestResult('❌ Notification permission denied. Please allow notifications in your browser.');
            return;
          }
        } else {
          setTestResult('❌ Notification permission blocked. Please enable notifications in browser settings.');
          return;
        }
      }

      // Test immediate notification with detailed logging
      console.log('Creating test notification...');
      
      const notification = new Notification('🧪 Test Notification', {
        body: 'If you see this popup, browser notifications are working! This will auto-close in 5 seconds.',
        icon: '/icon-192.jpg',
        tag: 'test-notification',
        requireInteraction: false
      });

      console.log('Notification created:', notification);

      notification.onclick = () => {
        console.log('Notification clicked!');
        notification.close();
      };

      notification.onshow = () => {
        console.log('Notification shown!');
      };

      notification.onerror = (error) => {
        console.error('Notification error:', error);
      };

      setTimeout(() => {
        notification.close();
        console.log('Notification closed automatically');
      }, 5000);

      setTestResult('✅ Immediate notification sent! Check if you see a popup (not just hear a sound). Check browser console for details.');

    } catch (error) {
      console.error('Immediate test error:', error);
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">⏰ Timing Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Time</h2>
          <div className="text-2xl font-mono text-blue-600">
            {currentTime.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Time string format: {currentTime.toTimeString().substring(0, 5)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Tests</h2>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={testImmediateNotification}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Test Immediate Notification
              </button>
              <p className="text-sm text-gray-600 mt-1">
                Tests if browser notifications are working at all
              </p>
            </div>

            <div>
              <button
                onClick={testScheduling}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Test 2-Minute Reminder Schedule
              </button>
              <p className="text-sm text-gray-600 mt-1">
                Schedules breakfast and morning snack reminders for 2 minutes from now
              </p>
            </div>
          </div>

          {testResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
              {testResult}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="text-sm space-y-2">
            <div><strong>Notification Permission:</strong> {typeof window !== 'undefined' ? Notification.permission : 'unknown'}</div>
            <div><strong>Service Worker Support:</strong> {typeof window !== 'undefined' && 'serviceWorker' in navigator ? 'Yes' : 'No'}</div>
            <div><strong>Browser:</strong> {typeof window !== 'undefined' ? (navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other') : 'unknown'}</div>
            <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 80) + '...' : 'unknown'}</div>
            
            {typeof window !== 'undefined' && (
              <>
                <div><strong>Vibration Support:</strong> {'vibrate' in navigator ? 'Yes' : 'No'}</div>
                <div><strong>Focus State:</strong> {document.hasFocus() ? 'Focused' : 'Not Focused'}</div>
                <div><strong>Visibility State:</strong> {document.visibilityState}</div>
              </>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded text-sm">
            <strong>Firefox Users:</strong> If you hear a sound but don't see notifications:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Check if Firefox is blocking notifications (look for a shield icon in the address bar)</li>
              <li>Go to Settings → Privacy & Security → Permissions → Notifications</li>
              <li>Make sure this site is set to "Allow"</li>
              <li>Check if "Focus Assist" or "Do Not Disturb" is enabled on your system</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/reminders" className="text-blue-500 hover:text-blue-600 underline">
            ← Back to Reminders
          </a>
        </div>
      </div>
    </div>
  );
}
