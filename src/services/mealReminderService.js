/**
 * mealReminderService.js
 * 
 * A singleton service that provides access to the GLP1MealReminderSystem
 * throughout the application. This ensures we only have one instance
 * of the reminder system running at any time.
 */

import GLP1MealReminderSystem from './GLP1MealReminderSystem';

// Create a singleton instance
const reminderSystem = new GLP1MealReminderSystem();

// Initialize on import (but this is non-blocking)
if (typeof window !== 'undefined') {
  // Only initialize in browser environment
  reminderSystem.initialize().catch(error => {
    console.error('Failed to initialize meal reminder system:', error);
  });
}

/**
 * The meal reminder service provides easy access to reminder functionality
 */
const mealReminderService = {
  /**
   * Initialize the reminder system
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  initialize: async () => {
    return await reminderSystem.initialize();
  },

  /**
   * Request notification permission
   * @returns {Promise<boolean>} Whether permission was granted
   */
  requestPermission: async () => {
    return await reminderSystem.requestPermission();
  },

  /**
   * Schedule reminders from notification settings (modern API)
   * @param {Object} notificationSettings - Time settings { breakfast: '08:00', morningSnack: '10:30', lunch: '12:30', afternoonSnack: '15:30', dinner: '18:00' }
   * @param {Object} enabledReminders - Enabled flags { breakfast: true, morningSnack: true, lunch: true, afternoonSnack: true, dinner: true }
   * @returns {Promise<boolean>} Whether scheduling was successful
   */
  scheduleFromSettings: async (notificationSettings, enabledReminders) => {
    try {
      console.log('[MealReminderService] Scheduling reminders with settings:', notificationSettings, enabledReminders);
      
      // Convert to the format expected by GLP1MealReminderSystem
      const settings = {
        mealTimes: {
          breakfast: notificationSettings.breakfast,
          lunch: notificationSettings.lunch,
          dinner: notificationSettings.dinner
        },
        enableBreakfast: enabledReminders.breakfast,
        enableLunch: enabledReminders.lunch,
        enableDinner: enabledReminders.dinner,
        reminderIntervals: {
          breakfast: { prep: 30, action: 0 },
          lunch: { prep: 30, action: 0 },
          dinner: { prep: 45, action: 0 }
        }
      };

      console.log('[MealReminderService] Converted settings for GLP1MealReminderSystem:', settings);
      
      // Schedule main meals first
      const mainMealSuccess = await reminderSystem.scheduleReminders(settings);
      
      // Handle snacks separately using simple browser notifications
      let snackCount = 0;
      if (enabledReminders.morningSnack && notificationSettings.morningSnack) {
        mealReminderService._scheduleSnackReminder('Morning Snack', notificationSettings.morningSnack);
        snackCount++;
      }
      
      if (enabledReminders.afternoonSnack && notificationSettings.afternoonSnack) {
        mealReminderService._scheduleSnackReminder('Afternoon Snack', notificationSettings.afternoonSnack);
        snackCount++;
      }
      
      console.log(`[MealReminderService] Scheduled ${snackCount} snack reminders`);
      
      return mainMealSuccess;
    } catch (error) {
      console.error('Error scheduling reminders from settings:', error);
      return false;
    }
  },

  /**
   * Schedule a simple snack reminder using browser notifications
   * @private
   */
  _scheduleSnackReminder: (snackName, timeString) => {
    try {
      const now = new Date();
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Parse time string (e.g., "10:30")
      const [hours, minutes] = timeString.split(':').map(Number);
      
      // Schedule for today and tomorrow
      for (const date of [today, tomorrow]) {
        const snackTime = new Date(date);
        snackTime.setHours(hours, minutes, 0, 0);
        
        // Skip if time has already passed
        if (snackTime <= now) {
          console.log(`[MealReminderService] ⏰ Skipping ${snackName} for ${date.toDateString()} - time has passed (${snackTime.toLocaleString()})`);
          continue;
        }
        
        const delay = snackTime.getTime() - now.getTime();
        const delayMinutes = Math.round(delay / 1000 / 60);
        
        console.log(`[MealReminderService] ✅ Scheduling ${snackName} for ${snackTime.toLocaleString()} (in ${delayMinutes} minutes, delay: ${delay}ms)`);
        
        setTimeout(() => {
          console.log(`[MealReminderService] 🔔 FIRING SNACK REMINDER: ${snackName} at ${new Date().toLocaleString()}`);
          
          if (Notification.permission === 'granted') {
            const notification = new Notification(`🥜 ${snackName} Time!`, {
              body: `Time for your ${snackName.toLowerCase()}. A small healthy snack can help maintain your energy levels.`,
              icon: '/icon-192.jpg',
              tag: `snack-reminder-${snackName.toLowerCase().replace(' ', '-')}-${snackTime.getTime()}`,
              requireInteraction: false
            });

            // Auto-close after 15 seconds
            setTimeout(() => {
              notification.close();
            }, 15000);

            notification.onclick = () => {
              console.log(`Snack notification clicked: ${snackName}`);
              window.focus();
              notification.close();
            };
          } else {
            console.error('Cannot show snack notification - permission not granted');
          }
        }, delay);
      }
    } catch (error) {
      console.error(`Error scheduling ${snackName} reminder:`, error);
    }
  },

  /**
   * Schedule a breakfast reminder
   * @param {Date} date When to send the reminder
   * @param {boolean} isCritical Whether this is a critical reminder
   * @returns {string} Reminder ID
   */
  scheduleBreakfast: (date, isCritical = true) => {
    const safeDate = typeof date === 'string' ? mealReminderService.timeStringToDate(date) : date;
    return reminderSystem.scheduleBreakfast(safeDate, isCritical);
  },

  /**
   * Schedule a lunch reminder
   * @param {Date} date When to send the reminder
   * @param {boolean} isCritical Whether this is a critical reminder
   * @returns {string} Reminder ID
   */
  scheduleLunch: (date, isCritical = true) => {
    const safeDate = typeof date === 'string' ? mealReminderService.timeStringToDate(date) : date;
    return reminderSystem.scheduleLunch(safeDate, isCritical);
  },

  /**
   * Schedule a dinner reminder
   * @param {Date} date When to send the reminder
   * @param {boolean} isCritical Whether this is a critical reminder
   * @returns {string} Reminder ID
   */
  scheduleDinner: (date, isCritical = true) => {
    const safeDate = typeof date === 'string' ? mealReminderService.timeStringToDate(date) : date;
    return reminderSystem.scheduleDinner(safeDate, isCritical);
  },

  /**
   * Schedule a snack reminder
   * @param {Date} date When to send the reminder
   * @param {string} label Custom label for the snack
   * @param {boolean} isCritical Whether this is a critical reminder
   * @returns {string} Reminder ID
   */
  scheduleSnack: (date, label = 'Snack', isCritical = false) => {
    const safeDate = typeof date === 'string' ? mealReminderService.timeStringToDate(date) : date;
    return reminderSystem.scheduleSnack(safeDate, label, isCritical);
  },

  /**
   * Schedule a generic meal reminder
   * @param {Date} date When to send the reminder
   * @param {string} mealType Type of meal
   * @param {boolean} isCritical Whether this is a critical reminder
   * @returns {string} Reminder ID
   */
  scheduleMealReminder: (date, mealType, isCritical = false) => {
    const safeDate = typeof date === 'string' ? mealReminderService.timeStringToDate(date) : date;
    return reminderSystem.scheduleMealReminder(safeDate, mealType, isCritical);
  },

  /**
   * Clear all active reminders
   */
  clearAllReminders: () => {
    reminderSystem.clearAllReminders();
  },

  /**
   * Show an in-app notification banner
   * @param {string} title Notification title
   * @param {string} message Notification message
   * @param {string} reminderId ID of the associated reminder
   */
  showInAppNotification: (title, message, reminderId) => {
    reminderSystem.showInAppNotification(title, message, reminderId);
  },

  /**
   * Get reminder history
   * @returns {Array} Array of reminder objects
   */
  getReminderHistory: () => {
    return reminderSystem.getReminderHistory();
  },

  /**
   * Get active reminders
   * @returns {Array} Array of active reminder objects
   */
  getActiveReminders: () => {
    return reminderSystem.getActiveReminders();
  },

  /**
   * Get reminder by ID
   * @param {string} reminderId Reminder ID
   * @returns {Object|null} Reminder object or null if not found
   */
  getReminderById: (reminderId) => {
    return reminderSystem.getReminderById(reminderId);
  },

  /**
   * Cancel a specific reminder
   * @param {string} reminderId Reminder ID
   * @returns {boolean} Whether the reminder was cancelled
   */
  cancelReminder: (reminderId) => {
    return reminderSystem.cancelReminder(reminderId);
  },

  /**
   * Schedule reminders for a typical day
   * @param {Object} times Object containing breakfast, lunch, and dinner times as Date objects
   * @returns {Object} Object containing reminder IDs
   */
  scheduleFullDay: (times) => {
    const reminderIds = {};
    
    if (times.breakfast) {
      const b = typeof times.breakfast === 'string'
        ? mealReminderService.timeStringToDate(times.breakfast)
        : times.breakfast;
      reminderIds.breakfast = reminderSystem.scheduleBreakfast(b, true);
    }
    
    if (times.lunch) {
      const l = typeof times.lunch === 'string'
        ? mealReminderService.timeStringToDate(times.lunch)
        : times.lunch;
      reminderIds.lunch = reminderSystem.scheduleLunch(l, true);
    }
    
    if (times.dinner) {
      const d = typeof times.dinner === 'string'
        ? mealReminderService.timeStringToDate(times.dinner)
        : times.dinner;
      reminderIds.dinner = reminderSystem.scheduleDinner(d, true);
    }
    
    return reminderIds;
  },

  /**
   * Quick console test helper – logs current debug info about the reminder system.
   */
  consoleTesting: () => {
    /* eslint-disable no-console */
    console.log('🔔 [MealReminderService] Debug Info', {
      now: new Date().toLocaleString(),
      activeReminders: reminderSystem.getActiveReminders(),
      reminderHistoryCount: reminderSystem.getReminderHistory().length
    });
    /* eslint-enable no-console */
  },

  /**
   * Helper to convert time string to Date object for today
   * @param {string} timeString Time in format "HH:MM"
   * @returns {Date} Date object for today with the specified time
   */
  timeStringToDate: (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  },

  /**
   * Helper to convert time string to Date object for a specific date
   * @param {Date} baseDate Base date to use
   * @param {string} timeString Time in format "HH:MM"
   * @returns {Date} Date object with the specified date and time
   */
  dateWithTimeString: (baseDate, timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
};

export default mealReminderService;
