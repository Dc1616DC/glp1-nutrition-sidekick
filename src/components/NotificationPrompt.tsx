'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pushNotificationService } from '../services/pushNotificationService';

interface Props {
  onComplete?: (granted: boolean) => void;
  showAsModal?: boolean;
}

export default function NotificationPrompt({ onComplete, showAsModal = true }: Props) {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    checkPermissionAndShow();
  }, [user]);

  const checkPermissionAndShow = () => {
    if (!user) return;
    
    const status = pushNotificationService.getPermissionStatus();
    setPermissionStatus(status);
    
    // Only show prompt if permission is default and user hasn't dismissed it recently
    const dismissed = localStorage.getItem('notificationPromptDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    if (status === 'default' && dismissedTime < oneWeekAgo) {
      setShowPrompt(true);
    }
  };

  const handleAllow = async () => {
    setIsLoading(true);
    
    try {
      const permission = await pushNotificationService.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        // Initialize the service and set up default reminders
        await pushNotificationService.initialize();
        if (user) {
          await pushNotificationService.setupMealReminders(user.uid);
          
          // Send a welcome notification
          setTimeout(() => {
            pushNotificationService.sendNotification({
              title: '🎉 Notifications Enabled!',
              body: 'You\'ll now receive gentle meal reminders and helpful nutrition tips.',
              tag: 'welcome_notification',
              icon: '/icons/icon-192x192.png'
            });
          }, 2000);
        }
      }
      
      setShowPrompt(false);
      onComplete?.(permission === 'granted');
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notificationPromptDismissed', Date.now().toString());
    setShowPrompt(false);
    onComplete?.(false);
  };

  const handleRemindLater = () => {
    // Set dismissed time to show again in 3 days
    const threeDaysFromNow = Date.now() - (4 * 24 * 60 * 60 * 1000);
    localStorage.setItem('notificationPromptDismissed', threeDaysFromNow.toString());
    setShowPrompt(false);
    onComplete?.(false);
  };

  if (!showPrompt || permissionStatus !== 'default') {
    return null;
  }

  const content = (
    <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🔔</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Stay on Track with Gentle Reminders
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Get personalized meal reminders, hydration nudges, and nutrition tips 
          designed specifically for your GLP-1 journey.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-700">
          <span className="text-green-500 mr-3">✓</span>
          Gentle meal time reminders that respect your appetite
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <span className="text-green-500 mr-3">✓</span>
          Daily nutrition tips from registered dietitians
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <span className="text-green-500 mr-3">✓</span>
          Hydration reminders to support your medication
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <span className="text-green-500 mr-3">✓</span>
          Weekly progress check-ins and motivation
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleAllow}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enabling...
            </div>
          ) : (
            'Enable Helpful Reminders'
          )}
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={handleRemindLater}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Remind Me Later
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 text-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            No Thanks
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        You can change notification settings anytime in your profile.
      </p>
    </div>
  );

  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-6">
      {content}
    </div>
  );
}