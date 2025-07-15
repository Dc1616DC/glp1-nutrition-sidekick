/**
 * SimpleNotificationService.ts
 * 
 * A simplified notification service that uses basic browser notifications
 * without Firebase dependencies. This is a temporary solution until
 * Firebase Cloud Messaging permission issues are resolved.
 */

// Type definitions
export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

export interface MealReminder {
  id: string;
  mealType: 'breakfast' | 'morningSnack' | 'lunch' | 'afternoonSnack' | 'dinner';
  time: string; // Format: "HH:MM"
  title: string;
  body: string;
  enabled: boolean;
}

/**
 * Checks if notifications are supported in this browser
 * @returns {boolean} Whether notifications are supported
 */
export const isNotificationSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'Notification' in window;
};

/**
 * Gets the current notification permission state
 * @returns Permission state as string
 */
export const getNotificationPermissionState = (): 'granted' | 'denied' | 'default' | 'unsupported' | 'unchecked' => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  
  if (typeof Notification === 'undefined') {
    return 'unchecked';
  }
  
  return Notification.permission as 'granted' | 'denied' | 'default';
};

/**
 * Requests notification permission from the user
 * 
 * In production with Firebase:
 * - Would also register the device with FCM
 * - Would store the FCM token in Firestore under the user's document
 * 
 * @param {string} userId - The user's ID (used for storing preferences)
 * @returns {Promise<{status: string, error?: Error}>} Result of the permission request
 */
export const requestNotificationPermission = async (userId: string): Promise<{ 
  status: 'granted' | 'denied' | 'default' | 'unsupported' | 'error',
  error?: Error 
}> => {
  if (!isNotificationSupported()) {
    return { status: 'unsupported' };
  }
  
  try {
    // Request permission from the browser
    console.log('[SimpleNotificationService] Requesting Notification permission');
    const permission = await Notification.requestPermission();
    console.log(`[SimpleNotificationService] Browser permission result: ${permission}`);
    
    if (permission === 'granted') {
      // In production: This is where we would get and store the FCM token
      // const token = await getFCMToken();
      // await saveFCMToken(userId, token);
      
      // For now, just store a flag in localStorage to remember the user enabled notifications
      localStorage.setItem('notifications_enabled', 'true');
      localStorage.setItem('notifications_user_id', userId);
    }
    
    return { status: permission as 'granted' | 'denied' | 'default' };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { status: 'error', error: error as Error };
  }
};

/**
 * Displays a notification using the browser Notification API
 * 
 * In production with Firebase:
 * - For foreground notifications, this would be similar
 * - For background notifications, Firebase would handle via the service worker
 * 
 * @param {string} title - The notification title
 * @param {NotificationOptions} options - Notification options
 * @returns {Promise<boolean>} Whether the notification was shown
 */
export const showNotification = async (
  title: string, 
  options: NotificationOptions = {}
): Promise<boolean> => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }
  
  try {
    // Create and show the notification
    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      ...options
    });
    
    // Add click handler
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
};

/**
 * Schedules a local notification to be shown at a specific time
 * 
 * In production with Firebase:
 * - This would be handled by Firebase Cloud Functions or another server-side solution
 * - The server would send push notifications at the scheduled times
 * 
 * @param {MealReminder} reminder - The meal reminder to schedule
 * @returns {number} The ID of the scheduled timeout (for cancellation)
 */
export const scheduleLocalNotification = (reminder: MealReminder): number => {
  if (!reminder.enabled) return 0;
  
  // Parse the time string (HH:MM)
  const [hours, minutes] = reminder.time.split(':').map(Number);
  
  // Calculate when to show the notification
  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );
  
  // If the time has already passed today, schedule for tomorrow
  if (scheduledTime < now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  // Calculate delay in milliseconds
  const delay = scheduledTime.getTime() - now.getTime();
  
  // Schedule the notification
  return window.setTimeout(() => {
    showNotification(
      reminder.title || `Time for ${reminder.mealType}!`,
      {
        body: reminder.body || "It's time for your scheduled meal!",
        tag: `meal-reminder-${reminder.id}`,
        data: { mealType: reminder.mealType }
      }
    );
    
    // Reschedule for tomorrow
    scheduleLocalNotification(reminder);
  }, delay);
};

/**
 * Cancels a previously scheduled notification
 * 
 * @param {number} timeoutId - The ID returned from scheduleLocalNotification
 */
export const cancelScheduledNotification = (timeoutId: number): void => {
  if (timeoutId) {
    window.clearTimeout(timeoutId);
  }
};

/**
 * Saves the user's meal reminder settings to localStorage
 * 
 * In production with Firebase:
 * - This would save to the user's document in Firestore
 * - Would also potentially update server-side scheduled notifications
 * 
 * @param {string} userId - The user's ID
 * @param {Record<string, MealReminder>} reminders - The meal reminders
 * @returns {Promise<boolean>} Whether the save was successful
 */
export const saveReminderSettings = async (
  userId: string,
  reminders: Record<string, MealReminder>
): Promise<boolean> => {
  try {
    localStorage.setItem(
      `user_${userId}_reminders`,
      JSON.stringify(reminders)
    );
    return true;
  } catch (error) {
    console.error('Error saving reminder settings:', error);
    return false;
  }
};

/**
 * Retrieves the user's meal reminder settings from localStorage
 * 
 * In production with Firebase:
 * - This would retrieve from the user's document in Firestore
 * 
 * @param {string} userId - The user's ID
 * @returns {Promise<Record<string, MealReminder> | null>} The meal reminders or null if not found
 */
export const getReminderSettings = async (
  userId: string
): Promise<Record<string, MealReminder> | null> => {
  try {
    const remindersJson = localStorage.getItem(`user_${userId}_reminders`);
    if (!remindersJson) return null;
    
    return JSON.parse(remindersJson) as Record<string, MealReminder>;
  } catch (error) {
    console.error('Error retrieving reminder settings:', error);
    return null;
  }
};

/**
 * Sets up all scheduled notifications based on user settings
 * 
 * In production with Firebase:
 * - The server would handle scheduling
 * - This would just ensure the user has granted notification permission
 * 
 * @param {string} userId - The user's ID
 * @returns {Promise<Record<string, number>>} Map of reminder IDs to timeout IDs
 */
export const setupAllReminders = async (
  userId: string
): Promise<Record<string, number>> => {
  const reminders = await getReminderSettings(userId);
  if (!reminders) return {};
  
  const timeoutIds: Record<string, number> = {};
  
  // Schedule each enabled reminder
  Object.entries(reminders).forEach(([id, reminder]) => {
    if (reminder.enabled) {
      timeoutIds[id] = scheduleLocalNotification(reminder);
    }
  });
  
  return timeoutIds;
};

/**
 * Clears all scheduled notifications
 * 
 * @param {Record<string, number>} timeoutIds - Map of reminder IDs to timeout IDs
 */
export const clearAllReminders = (timeoutIds: Record<string, number>): void => {
  Object.values(timeoutIds).forEach(id => {
    cancelScheduledNotification(id);
  });
};

/**
 * Sends a test notification to verify permissions and functionality
 * 
 * @returns {Promise<boolean>} Whether the notification was shown
 */
export const sendTestNotification = async (): Promise<boolean> => {
  return showNotification(
    'Test Notification',
    {
      body: 'This is a test notification from GLP-1 Nutrition Companion',
      icon: '/icons/icon-192x192.png',
      requireInteraction: true
    }
  );
};
