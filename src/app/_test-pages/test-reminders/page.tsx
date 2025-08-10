'use client';

import { useState, useEffect } from 'react';
import mealReminderService from '../../services/mealReminderService';

export default function TestRemindersPage() {
  const [testResults, setTestResults] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the reminder system
  useEffect(() => {
    const init = async () => {
      try {
        await mealReminderService.initialize();
        await mealReminderService.requestPermission();
        setIsInitialized(true);
        addTestResult('✅ Meal reminder system initialized');
      } catch (error) {
        addTestResult(`❌ Failed to initialize: ${error.message}`);
      }
    };
    
    init();
  }, []);

  const addTestResult = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testQuickReminder = async (minutesFromNow = 1) => {
    try {
      addTestResult(`🧪 Testing reminder ${minutesFromNow} minutes from now...`);
      
      // Create a time string for the test
      const testTime = new Date(Date.now() + (minutesFromNow * 60 * 1000));
      const timeString = testTime.toTimeString().substring(0, 5); // "HH:MM"
      
      addTestResult(`⏰ Scheduling test for: ${testTime.toLocaleTimeString()}`);
      
      // Set up test settings
      const testSettings = {
        breakfast: timeString,
        lunch: '',
        dinner: '',
        morningSnack: '',
        afternoonSnack: ''
      };
      
      const testEnabled = {
        breakfast: true,
        lunch: false,
        dinner: false,
        morningSnack: false,
        afternoonSnack: false
      };
      
      // Schedule the reminder
      const success = await mealReminderService.scheduleFromSettings(testSettings, testEnabled);
      
      if (success) {
        addTestResult(`✅ Test reminder scheduled successfully!`);
        addTestResult(`📱 Watch for notification at ${testTime.toLocaleTimeString()}`);
      } else {
        addTestResult(`❌ Failed to schedule test reminder`);
      }
      
    } catch (error) {
      addTestResult(`❌ Error testing reminder: ${error.message}`);
    }
  };

  const testSnackReminder = async (minutesFromNow = 1) => {
    try {
      addTestResult(`🧪 Testing snack reminder ${minutesFromNow} minutes from now...`);
      
      // Create a time string for the test
      const testTime = new Date(Date.now() + (minutesFromNow * 60 * 1000));
      const timeString = testTime.toTimeString().substring(0, 5); // "HH:MM"
      
      addTestResult(`⏰ Scheduling snack test for: ${testTime.toLocaleTimeString()}`);
      
      // Set up test settings for snacks
      const testSettings = {
        breakfast: '',
        lunch: '',
        dinner: '',
        morningSnack: timeString,
        afternoonSnack: ''
      };
      
      const testEnabled = {
        breakfast: false,
        lunch: false,
        dinner: false,
        morningSnack: true,
        afternoonSnack: false
      };
      
      // Schedule the reminder
      const success = await mealReminderService.scheduleFromSettings(testSettings, testEnabled);
      
      if (success) {
        addTestResult(`✅ Test snack reminder scheduled successfully!`);
        addTestResult(`📱 Watch for snack notification at ${testTime.toLocaleTimeString()}`);
      } else {
        addTestResult(`❌ Failed to schedule test snack reminder`);
      }
      
    } catch (error) {
      addTestResult(`❌ Error testing snack reminder: ${error.message}`);
    }
  };

  const clearAllReminders = () => {
    try {
      mealReminderService.clearAllReminders();
      addTestResult('🗑️ Cleared all active reminders');
    } catch (error) {
      addTestResult(`❌ Error clearing reminders: ${error.message}`);
    }
  };

  const checkPermissionStatus = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      addTestResult(`🔔 Notification permission: ${Notification.permission}`);
      
      if (Notification.permission === 'granted') {
        addTestResult('✅ Notifications are enabled');
      } else if (Notification.permission === 'denied') {
        addTestResult('❌ Notifications are blocked');
      } else {
        addTestResult('⏳ Notification permission not requested yet');
      }
    } else {
      addTestResult('❌ Browser does not support notifications');
    }
  };

  const testBrowserNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🧪 Test Notification', {
        body: 'This is a test notification to verify browser notifications are working.',
        icon: '/icon-192.jpg',
        badge: '/badge-72.jpg'
      });
      addTestResult('🧪 Test browser notification sent');
    } else {
      addTestResult('❌ Cannot send test notification - permission not granted');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Test Meal Reminders</h1>
      
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">🧪 Reminder Testing Lab</h2>
        <p className="text-gray-700 mb-4">
          Use this page to test the meal reminder system with quick notifications.
          Make sure your browser notifications are enabled!
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={checkPermissionStatus}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Check Permission
          </button>
          
          <button
            onClick={testBrowserNotification}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={!isInitialized}
          >
            Test Browser Notification
          </button>
          
          <button
            onClick={() => testQuickReminder(1)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            disabled={!isInitialized}
          >
            Test in 1 Minute
          </button>
          
          <button
            onClick={() => testQuickReminder(2)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            disabled={!isInitialized}
          >
            Test in 2 Minutes
          </button>
          
          <button
            onClick={() => testSnackReminder(1)}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            disabled={!isInitialized}
          >
            Test Snack in 1 Min
          </button>
          
          <button
            onClick={clearAllReminders}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={!isInitialized}
          >
            Clear All Reminders
          </button>
        </div>
      </div>

      {/* Status Display */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Test Results</h3>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500 italic">No test results yet...</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Test</h3>
        <ol className="text-gray-700 space-y-1 list-decimal list-inside">
          <li>First, click "Check Permission" to see if notifications are enabled</li>
          <li>Click "Test Browser Notification" to verify basic notifications work</li>
          <li>Click "Test in 1 Minute" to schedule a meal reminder</li>
          <li>Watch the console (F12) for debug messages</li>
          <li>Wait for the notification to appear</li>
          <li>Use "Clear All Reminders" to cancel pending tests</li>
        </ol>
      </div>
    </div>
  );
}