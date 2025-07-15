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
      router.push('/signin?redirect=test-reminders');
    }
  }, [user, loading, router]);
  
  // Clean up reminders on unmount
  useEffect(() => {
    return () => {
      activeReminders.forEach(reminder => {
        cancelScheduledNotification(reminder.timeoutId);
      });
    };
  }, [activeReminders]);
  
  // Handle enabling notifications
  const handleEnableNotifications = async () => {
    if (!user) return;
    
    try {
      setFeedback({ type: 'info', message: 'Requesting notification permission...' });
      
      const result = await requestNotificationPermission(user.uid);
      setNotificationStatus(result.status);
      
      if (result.status === 'granted') {
        setFeedback({ 
          type: 'success', 
          message: 'Notification permission granted! You can now receive notifications.' 
        });
      } else if (result.status === 'denied') {
        setFeedback({ 
          type: 'error', 
          message: 'Notification permission denied. Please enable notifications in your browser settings.' 
        });
      } else if (result.status === 'error') {
        setFeedback({ 
          type: 'error', 
          message: `Error requesting permission: ${result.error?.message || 'Unknown error'}` 
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setFeedback({ 
        type: 'error', 
        message: 'Failed to enable notifications. Please try again.' 
      });
    }
  };
  
  // Handle sending a test notification
  const handleSendTestNotification = async () => {
    try {
      setFeedback({ type: 'info', message: 'Sending test notification...' });
      
      const success = await showNotification(
        'Test Notification',
        {
          body: 'This is a test notification from the GLP-1 Nutrition Companion app.',
          icon: '/icons/icon-192x192.png',
          requireInteraction: true
        }
      );
      
      if (success) {
        setFeedback({ 
          type: 'success', 
          message: 'Test notification sent! Check your notifications.' 
        });
      } else {
        setFeedback({ 
          type: 'error', 
          message: 'Failed to send notification. Make sure notifications are enabled.' 
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setFeedback({ 
        type: 'error', 
        message: 'Error sending notification. Please try again.' 
      });
    }
  };
  
  // Handle scheduling a reminder for 1 minute in the future
  const handleScheduleReminder = () => {
    try {
      // Create a reminder for 1 minute from now
      const now = new Date();
      const oneMinuteFromNow = new Date(now.getTime() + 60000);
      
      const hours = oneMinuteFromNow.getHours().toString().padStart(2, '0');
      const minutes = oneMinuteFromNow.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      const reminder: MealReminder = {
        id: `test-${Date.now()}`,
        mealType: 'snack',
        time: timeString,
        title: '1-Minute Test Reminder',
        body: 'This reminder was scheduled 1 minute ago.',
        enabled: true
      };
      
      // Schedule the notification
      const timeoutId = scheduleLocalNotification(reminder);
      
      // Add to active reminders
      setActiveReminders(prev => [
        ...prev,
        {
          id: reminder.id,
          timeoutId,
          scheduledTime: oneMinuteFromNow,
          mealType: 'Test Snack'
        }
      ]);
      
      setFeedback({ 
        type: 'success', 
        message: `Reminder scheduled for ${timeString}` 
      });
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      setFeedback({ 
        type: 'error', 
        message: 'Failed to schedule reminder. Please try again.' 
      });
    }
  };
  
  // Handle canceling a reminder
  const handleCancelReminder = (id: string, timeoutId: number) => {
    cancelScheduledNotification(timeoutId);
    setActiveReminders(prev => prev.filter(r => r.id !== id));
    setFeedback({ 
      type: 'info', 
      message: 'Reminder canceled' 
    });
  };
  
  // If still checking authentication, show loading
  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }
  
  // If user is not authenticated, don't render the page content
  if (!user) {
    return <div className="text-center py-10">Please sign in to access this page.</div>;
  }
  
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Test Notification Reminders</h1>
      
      {/* Explanation */}
      <div className="bg-blue-50 p-4 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">About This Test Page</h2>
        <p className="text-gray-700 mb-2">
          This page demonstrates simple browser notifications without using Firebase Cloud Messaging.
          You can test basic notification functionality here.
        </p>
        <p className="text-gray-700">
          <Link href="/reminders" className="text-blue-600 hover:underline">
            Return to the main Reminders page
          </Link> when you're done testing.
        </p>
      </div>
      
      {/* Notification Status */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Notification Status</h2>
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-gray-700">Current permission:</span>
          <span className={`font-medium ${
            notificationStatus === 'granted' ? 'text-green-600' :
            notificationStatus === 'denied' ? 'text-red-600' :
            notificationStatus === 'unsupported' ? 'text-gray-500' :
            'text-yellow-600'
          }`}>
            {notificationStatus}
          </span>
        </div>
        
        {/* Enable Notifications Button */}
        <button
          onClick={handleEnableNotifications}
          disabled={notificationStatus === 'granted' || notificationStatus === 'unsupported'}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            notificationStatus === 'granted'
              ? 'bg-green-500 cursor-default'
              : notificationStatus === 'unsupported'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {notificationStatus === 'granted'
            ? 'Notifications Enabled'
            : notificationStatus === 'unsupported'
            ? 'Notifications Not Supported'
            : 'Enable Notifications'}
        </button>
      </div>
      
      {/* Test Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Test Actions</h2>
        
        <div className="space-y-4">
          {/* Send Test Notification */}
          <div>
            <button
              onClick={handleSendTestNotification}
              disabled={notificationStatus !== 'granted'}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                notificationStatus === 'granted'
                  ? 'bg-purple-500 hover:bg-purple-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Send Test Notification
            </button>
            <p className="text-sm text-gray-500 mt-1">
              Sends an immediate notification to test if notifications are working.
            </p>
          </div>
          
          {/* Schedule 1-Minute Reminder */}
          <div>
            <button
              onClick={handleScheduleReminder}
              disabled={notificationStatus !== 'granted'}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                notificationStatus === 'granted'
                  ? 'bg-indigo-500 hover:bg-indigo-600'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Schedule 1-Minute Reminder
            </button>
            <p className="text-sm text-gray-500 mt-1">
              Schedules a notification to appear 1 minute from now.
            </p>
          </div>
        </div>
      </div>
      
      {/* Feedback Messages */}
      {feedback.message && (
        <div className={`p-3 rounded-md mb-6 ${
          feedback.type === 'success' ? 'bg-green-100 text-green-800' : 
          feedback.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {feedback.message}
        </div>
      )}
      
      {/* Active Reminders */}
      {activeReminders.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Reminders</h2>
          
          <div className="space-y-2">
            {activeReminders.map(reminder => (
              <div 
                key={reminder.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <div className="font-medium">{reminder.mealType}</div>
                  <div className="text-sm text-gray-500">
                    Scheduled for: {reminder.scheduledTime.toLocaleTimeString()}
                  </div>
                </div>
                
                <button
                  onClick={() => handleCancelReminder(reminder.id, reminder.timeoutId)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
