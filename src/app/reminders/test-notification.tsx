'use client';

import { useState } from 'react';
import { 
  isNotificationSupported, 
  getNotificationPermissionState,
  showNotification
} from '../../services/simpleNotificationService';

/**
 * A component that provides a button to test push notifications
 * This helps verify that the notification system is working correctly
 */
export default function TestNotification() {
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Handle the test notification button click
  const handleTestNotification = async () => {
    setTestStatus('sending');
    setErrorMessage(null);
    
    try {
      // First check if notifications are supported
      if (!isNotificationSupported()) {
        throw new Error('Push notifications are not supported in this browser');
      }

      const permissionState = getNotificationPermissionState();
      if (permissionState !== 'granted') {
        throw new Error(`Notification permission is ${permissionState}. Please enable notifications first.`);
      }
      
      // Show a test notification using the simple service
      const notificationShown = await showNotification(
        'Test Notification', 
        {
          body: 'This is a test notification from your GLP-1 sidekick! 🎉',
          icon: '/icon-192.jpg',
          badge: '/badge-72.jpg',
          tag: 'test-notification',
          requireInteraction: false,
        }
      );

      if (notificationShown) {
        setTestStatus('success');
      } else {
        throw new Error('Failed to show notification - possibly blocked by browser');
      }
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setTestStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Error showing test notification:', error);
      setTestStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-800 mb-2">Test Notifications</h3>
      <p className="text-sm text-gray-600 mb-4">
        Send a test notification to verify your push notification setup is working correctly.
      </p>
      
      <button
        onClick={handleTestNotification}
        disabled={testStatus === 'sending'}
        className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
          testStatus === 'sending' 
            ? 'bg-gray-400 cursor-not-allowed' 
            : testStatus === 'success'
            ? 'bg-green-500 hover:bg-green-600'
            : testStatus === 'error'
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-[#4A90E2] hover:bg-blue-600'
        }`}
      >
        {testStatus === 'sending' 
          ? 'Sending...' 
          : testStatus === 'success'
          ? 'Notification Sent!'
          : testStatus === 'error'
          ? 'Error'
          : 'Send Test Notification'}
      </button>
      
      {testStatus === 'error' && errorMessage && (
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}
      
      {testStatus === 'success' && (
        <p className="mt-2 text-sm text-green-600">
          Notification sent successfully! If you don't see it, check your notification settings.
        </p>
      )}

      {/* Alternative: Use meal reminder system for testing */}
      <hr className="my-6" />
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-md font-semibold text-blue-800 mb-2">
          💡 Want to test meal reminders?
        </h4>
        <p className="text-sm text-blue-700 mb-3">
          For testing actual meal notifications, use the "🚀 Quick Test (2 min)" button 
          in the Advanced Settings page.
        </p>
        <a 
          href="/medical-reminders" 
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          Go to Advanced Settings
        </a>
      </div>
    </div>
  );
}