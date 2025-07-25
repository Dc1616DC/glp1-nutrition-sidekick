/**
 * GLP-1 Meal Reminder System
 * Comprehensive meal reminder management for GLP-1 users
 */

import { requestNotificationPermission } from './simpleNotificationService';

export class GLP1MealReminderSystem {
  constructor() {
    this.config = {
      reminderIntervals: {
        breakfast: { prep: 30, action: 0 },
        lunch: { prep: 30, action: 0 },
        dinner: { prep: 45, action: 0 }
      },
      defaultMealTimes: {
        breakfast: '08:00',
        lunch: '12:30',
        dinner: '18:00'
      },
      escalationDelay: 15, // minutes
      maxMissedMeals: 2,
      debugMode: true
    };

    this.reminderHistory = [];
    this.activeReminders = [];
    this.missedMeals = 0;
    this.serviceWorkerRegistration = null;
    this.wakeLock = null;
    this.isInitialized = false;

    // Bind methods to maintain context
    this._handleNotificationAction = this._handleNotificationAction.bind(this);
    this._checkForMissedReminders = this._checkForMissedReminders.bind(this);

    this._debug('GLP1MealReminderSystem initialized');
  }

  /**
   * Initialize the meal reminder system
   */
  async initialize() {
    try {
      this._debug('Initializing GLP1MealReminderSystem...');

      // Check notification permission (don't auto-request)
      // User must explicitly request permission via the UI

      // Register service worker for advanced notification features
      await this._registerServiceWorker();

      // Request wake lock to keep app active in background
      await this._requestWakeLock();

      // Load saved data
      await this._loadFromStorage();

      // Set up periodic checks for missed reminders
      setInterval(this._checkForMissedReminders, 60000); // Check every minute

      this.isInitialized = true;
      this._debug('GLP1MealReminderSystem initialized successfully');

      return true;
    } catch (error) {
      console.error('Failed to initialize GLP1MealReminderSystem:', error);
      return false;
    }
  }

  /**
   * Schedule meal reminders based on user settings
   * @param {Object} settings - Meal reminder settings
   * @param {Object} settings.mealTimes - Meal times { breakfast: '08:00', lunch: '12:30', dinner: '18:00' }
   * @param {Object} settings.reminderIntervals - Reminder intervals { breakfast: {prep: 30, action: 0}, ... }
   * @param {boolean} settings.enableBreakfast - Enable breakfast reminders
   * @param {boolean} settings.enableLunch - Enable lunch reminders
   * @param {boolean} settings.enableDinner - Enable dinner reminders
   */
  async scheduleReminders(settings) {
    try {
      this._debug('=== SCHEDULING MEAL REMINDERS ===');
      this._debug('Input settings:', settings);

      // Clear existing reminders
      this.clearAllReminders();

      // Update configuration
      this.config.reminderIntervals = settings.reminderIntervals || this.config.reminderIntervals;

      const mealTimes = settings.mealTimes || this.config.defaultMealTimes;
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      this._debug('Current time:', today.toLocaleString());
      this._debug('Meal times to schedule:', mealTimes);

      // Schedule reminders for each enabled meal
      const meals = ['breakfast', 'lunch', 'dinner'];
      let scheduledCount = 0;
      
      for (const meal of meals) {
        const enabledKey = `enable${meal.charAt(0).toUpperCase() + meal.slice(1)}`;
        if (!settings[enabledKey]) {
          this._debug(`❌ Skipping ${meal} - not enabled (${enabledKey}: ${settings[enabledKey]})`);
          continue;
        }

        const mealTime = mealTimes[meal];
        if (!mealTime) {
          this._debug(`❌ Skipping ${meal} - no time specified`);
          continue;
        }

        this._debug(`✅ Scheduling ${meal} at ${mealTime}`);

        // Schedule for today and tomorrow
        for (const date of [today, tomorrow]) {
          await this._scheduleMealReminders(meal, mealTime, date);
          scheduledCount++;
        }
      }

      // Save settings
      this._saveToStorage();

      this._debug(`=== SCHEDULING COMPLETE ===`);
      this._debug(`Total scheduled: ${this.activeReminders.length} reminders for ${scheduledCount} meal periods`);
      this._debug('Active reminders:', this.activeReminders.map(r => ({
        id: r.id,
        mealType: r.mealType,
        reminderType: r.reminderType,
        scheduledTime: r.scheduledTime.toLocaleString(),
        minutesFromNow: Math.round((r.scheduledTime.getTime() - Date.now()) / 60000)
      })));

      return this.activeReminders.length > 0;

    } catch (error) {
      console.error('Error scheduling reminders:', error);
      return false;
    }
  }

  /**
   * Schedule reminders for a specific meal
   * @private
   */
  async _scheduleMealReminders(mealType, mealTime, date) {
    const intervals = this.config.reminderIntervals[mealType];
    if (!intervals) {
      this._debug(`❌ No intervals configured for ${mealType}`);
      return;
    }

    // Parse meal time
    const [hours, minutes] = mealTime.split(':').map(Number);
    const mealDateTime = new Date(date);
    mealDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const timeUntilMeal = Math.round((mealDateTime.getTime() - now.getTime()) / 60000);

    this._debug(`📅 Checking ${mealType} for ${date.toDateString()} at ${mealTime}`);
    this._debug(`   Meal time: ${mealDateTime.toLocaleString()}`);
    this._debug(`   Current time: ${now.toLocaleString()}`);
    this._debug(`   Minutes until meal: ${timeUntilMeal}`);

    // Skip if meal time has already passed today
    if (mealDateTime <= now) {
      this._debug(`   ⏰ Skipping ${mealType} for ${date.toDateString()} - time has passed`);
      return;
    }

    this._debug(`   ✅ Will schedule ${mealType} reminders`);

    // Schedule prep reminder
    if (intervals.prep > 0) {
      const prepTime = new Date(mealDateTime.getTime() - (intervals.prep * 60 * 1000));
      const prepMinutesFromNow = Math.round((prepTime.getTime() - now.getTime()) / 60000);
      
      this._debug(`   📝 Prep reminder: ${prepTime.toLocaleString()} (in ${prepMinutesFromNow} minutes)`);
      
      await this._scheduleReminder(
        mealType,
        prepTime,
        'prep',
        `Time to prepare for ${mealType}`,
        `Your ${mealType} is in ${intervals.prep} minutes. Time to start preparing!`
      );
    }

    // Schedule action reminder (meal time)
    const actionTime = new Date(mealDateTime.getTime() - (intervals.action * 60 * 1000));
    const actionMinutesFromNow = Math.round((actionTime.getTime() - now.getTime()) / 60000);
    
    this._debug(`   🍽️ Action reminder: ${actionTime.toLocaleString()} (in ${actionMinutesFromNow} minutes)`);
    
    await this._scheduleReminder(
      mealType,
      actionTime,
      'action',
      `Time for ${mealType}!`,
      `It's time for your ${mealType}. Remember to eat slowly and mindfully.`
    );
  }

  /**
   * Schedule an individual reminder
   * @private
   */
  async _scheduleReminder(mealType, reminderTime, reminderType, title, message) {
    const now = new Date();
    const delay = reminderTime.getTime() - now.getTime();

    if (delay <= 0) {
      this._debug(`⏰ Skipping ${mealType} ${reminderType} reminder - time has passed (${reminderTime.toLocaleString()})`);
      return;
    }

    const reminderId = `${mealType}-${reminderType}-${reminderTime.getTime()}`;
    const delayMinutes = Math.round(delay / 1000 / 60);

    this._debug(`⏲️ Scheduling ${mealType} ${reminderType} reminder:`);
    this._debug(`   ID: ${reminderId}`);
    this._debug(`   Time: ${reminderTime.toLocaleString()}`);
    this._debug(`   Delay: ${delayMinutes} minutes`);
    this._debug(`   Title: ${title}`);

    // Create reminder object
    const reminder = {
      id: reminderId,
      mealType,
      reminderType,
      scheduledTime: reminderTime,
      title,
      message,
      status: 'scheduled',
      timeoutId: null
    };

    // Schedule the reminder
    reminder.timeoutId = setTimeout(async () => {
      this._debug(`🔔 FIRING REMINDER: ${reminderId} at ${new Date().toLocaleString()}`);
      
      await this._showNotification(reminderId, mealType, false, false, reminderType);
      
      // Update reminder status
      reminder.status = 'sent';
      this.reminderHistory.push(reminder);
      
      // Remove from active reminders
      this.activeReminders = this.activeReminders.filter(r => r.id !== reminderId);
      
      this._saveToStorage();
    }, delay);

    this.activeReminders.push(reminder);
    this._debug(`✅ Successfully scheduled ${mealType} ${reminderType} reminder (${this.activeReminders.length} total active)`);
  }

  /**
   * Show a meal reminder notification
   * @private
   */
  async _showNotification(reminderId, mealType, isCritical = false, isEscalated = false, reminderType = 'action') {
    try {
      this._debug(`Showing notification for ${mealType} ${reminderType}${isEscalated ? ' (ESCALATED)' : ''}`);

      // Check notification permission first
      if (Notification.permission !== 'granted') {
        this._debug('Notification permission not granted, cannot show notification');
        return;
      }

      // Determine notification content
      let title, body;
      
      if (reminderType === 'prep') {
        const interval = this.config.reminderIntervals[mealType]?.prep || 30;
        title = `⏰ Meal Prep Time`;
        body = `Your ${mealType} is in ${interval} minutes. Time to start preparing!`;
      } else {
        title = isEscalated ? `🚨 Missed Meal Alert` : `🍽️ Time to Eat`;
        body = isEscalated 
          ? `You missed your ${mealType}. Please eat as soon as possible for your health.`
          : `It's time for your ${mealType}. Remember to eat slowly and mindfully.`;
      }

      if (isCritical) {
        title = `Important: ${title}`;
      }
      
      // Always use simple browser notifications for better Firefox compatibility
      this._debug('Creating simple browser notification for maximum compatibility');
      
      // Simple notification options (compatible with all browsers)
      const options = {
        body,
        icon: '/icon-192.jpg',
        tag: `meal-reminder-${reminderId}`,
        requireInteraction: isCritical || isEscalated,
        data: {
          reminderId,
          mealType,
          timestamp: new Date().toISOString(),
          type: reminderType,
          isEscalated
        }
      };

      // Add vibration for mobile devices (if supported)
      if ('vibrate' in navigator) {
        options.vibrate = isEscalated ? [200, 100, 200, 100, 200] : [100, 50, 100];
      }

      // Create and show the notification
      const notification = new Notification(title, options);

      // Set up click handler
      notification.onclick = () => {
        this._debug(`Notification clicked for ${mealType}`);
        window.focus();
        notification.close();
        
        // Mark as completed when clicked
        this._handleNotificationAction(reminderId, 'eaten');
      };

      // Auto-close after 30 seconds unless it requires interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 30000);
      }

      this._debug(`✅ Successfully showed notification: ${title}`);

      // Schedule escalation if this is a critical reminder and not already escalated
      if (isCritical && !isEscalated && reminderType === 'action') {
        this._debug(`Scheduling escalation for ${mealType} in ${this.config.escalationDelay} minutes`);
        
        setTimeout(() => {
          // Check if the reminder has been acknowledged
          const reminder = this.reminderHistory.find(r => r.id === reminderId);
          if (reminder && reminder.status === 'sent') {
            // Escalate the reminder
            this._debug(`Escalating missed ${mealType} reminder`);
            this._showNotification(reminderId, mealType, true, true, reminderType);
            
            // Increment missed meals counter
            this.missedMeals++;
            this._debug(`Missed meals count increased to ${this.missedMeals}`);
            
            // Check if we need to send a critical alert
            if (this.missedMeals >= this.config.maxMissedMeals) {
              this._debug('Multiple missed meals detected, sending critical alert');
              this._sendCriticalAlert();
            }
          }
        }, this.config.escalationDelay * 60 * 1000);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      this._debug(`Failed to show notification: ${error.message}`);
    }
  }

  /**
   * Send a critical alert for multiple missed meals
   * @private
   */
  async _sendCriticalAlert() {
    try {
      this._debug('Sending critical alert for multiple missed meals');
      
      // Check notification permission
      if (Notification.permission !== 'granted') {
        this._debug('Cannot send critical alert - notification permission not granted');
        return;
      }
      
      const title = '🚨 Health Alert: Multiple Missed Meals';
      const body = `You've missed ${this.missedMeals} meals. For your health and medication effectiveness, please eat as soon as possible and consider contacting your healthcare provider.`;
      
      // Simple options for maximum compatibility
      const options = {
        body,
        icon: '/icon-192.jpg',
        tag: 'critical-health-alert',
        requireInteraction: true,
        data: {
          type: 'critical-alert',
          missedMeals: this.missedMeals,
          timestamp: new Date().toISOString()
        }
      };

      // Add vibration for mobile devices (if supported)
      if ('vibrate' in navigator) {
        options.vibrate = [300, 100, 300, 100, 300, 100, 600];
      }

      // Create and show the notification
      const notification = new Notification(title, options);

      notification.onclick = () => {
        this._debug('Critical alert acknowledged via click');
        window.focus();
        notification.close();
        this._handleNotificationAction('critical-alert', 'acknowledge');
      };

      this._debug('✅ Critical alert notification sent');

    } catch (error) {
      console.error('Error sending critical alert:', error);
      this._debug(`Failed to send critical alert: ${error.message}`);
    }
  }

  /**
   * Handle notification action clicks
   * @private
   */
  _handleNotificationAction(reminderId, action, snoozeMinutes = 15) {
    this._debug(`Handling notification action: ${action} for reminder ${reminderId}`);

    const reminder = this.reminderHistory.find(r => r.id === reminderId);
    if (!reminder) {
      this._debug(`Reminder ${reminderId} not found in history`);
      return;
    }

    switch (action) {
      case 'eaten':
        // Mark as completed
        reminder.status = 'completed';
        reminder.completedAt = new Date().toISOString();
        this._debug(`Marked ${reminder.mealType} as eaten`);
        
        // Reset missed meals counter if this was a recent meal
        const timeSinceScheduled = Date.now() - new Date(reminder.scheduledTime).getTime();
        if (timeSinceScheduled < 2 * 60 * 60 * 1000) { // Within 2 hours
          this.missedMeals = Math.max(0, this.missedMeals - 1);
          this._debug(`Reduced missed meals count to ${this.missedMeals}`);
        }
        break;

      case 'snooze':
        // Schedule a new reminder
        const snoozeTime = new Date(Date.now() + (snoozeMinutes * 60 * 1000));
        this._debug(`Snoozing ${reminder.mealType} for ${snoozeMinutes} minutes until ${snoozeTime.toLocaleString()}`);
        
        // Create snooze reminder
        setTimeout(() => {
          this._showNotification(
            `${reminderId}-snooze`,
            reminder.mealType,
            true, // Mark as critical since it's snoozed
            false,
            'action'
          );
        }, snoozeMinutes * 60 * 1000);

        reminder.status = 'snoozed';
        reminder.snoozeCount = (reminder.snoozeCount || 0) + 1;
        break;

      case 'skip':
        // Mark as skipped
        reminder.status = 'skipped';
        reminder.skippedAt = new Date().toISOString();
        this._debug(`Skipped ${reminder.mealType}`);
        
        // Increment missed meals counter
        this.missedMeals++;
        this._debug(`Missed meals count increased to ${this.missedMeals}`);
        break;

      case 'acknowledge':
        // For critical alerts
        this._debug('Critical alert acknowledged');
        break;

      case 'help':
        // Open help or contact information
        this._debug('Help requested for critical alert');
        // Could open a help page or contact form
        break;

      default:
        this._debug(`Unknown action: ${action}`);
    }

    // Save updated state
    this._saveToStorage();

    // Sync with cloud storage if available
    this._syncComplianceData();
  }

  /**
   * Check for missed reminders and take appropriate action
   * @private
   */
  _checkForMissedReminders() {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - (30 * 60 * 1000));

    // Check recent reminders that weren't acknowledged
    const recentReminders = this.reminderHistory.filter(reminder => {
      const scheduledTime = new Date(reminder.scheduledTime);
      return scheduledTime <= now && 
             scheduledTime >= thirtyMinutesAgo && 
             reminder.status === 'sent' &&
             reminder.reminderType === 'action';
    });

    recentReminders.forEach(reminder => {
      this._debug(`Found unacknowledged reminder: ${reminder.mealType}`);
      
      // Mark as missed and increment counter
      reminder.status = 'missed';
      this.missedMeals++;
      
      // Schedule escalation
      setTimeout(() => {
        this._showNotification(
          `${reminder.id}-escalated`,
          reminder.mealType,
          true,
          true,
          'action'
        );
      }, 1000); // Show escalation immediately
    });

    if (recentReminders.length > 0) {
      this._saveToStorage();
    }
  }

  /**
   * Register service worker for enhanced notification features
   * @private
   */
  async _registerServiceWorker() {
    try {
      if ('serviceWorker' in navigator) {
        this._debug('Registering service worker...');
        
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        this._debug('Service worker registered successfully');
        
        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        this._debug('Service worker is ready');
        
        this.serviceWorkerRegistration = registration;

        // Set up message handling for notification actions
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data && event.data.type === 'NOTIFICATION_ACTION') {
            this._handleNotificationAction(
              event.data.reminderId,
              event.data.action,
              event.data.snoozeMinutes
            );
          }
        });

        return registration;
      } else {
        this._debug('Service worker not supported');
        return null;
      }
    } catch (error) {
      console.error('Service worker registration failed:', error);
      this._debug('Service worker registration failed, will use regular notifications');
      return null;
    }
  }

  /**
   * Request wake lock to keep app active in background
   * @private
   */
  async _requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this._debug('Wake lock acquired');

        // Re-acquire wake lock when it's released
        this.wakeLock.addEventListener('release', () => {
          this._debug('Wake lock released');
          setTimeout(() => this._requestWakeLock(), 1000);
        });
      } else {
        this._debug('Wake lock not supported');
      }
    } catch (error) {
      console.error('Wake lock request failed:', error);
    }
  }

  /**
   * Load reminder data from storage
   * @private
   */
  async _loadFromStorage() {
    try {
      const data = localStorage.getItem('glp1-meal-reminders');
      if (data) {
        const parsed = JSON.parse(data);
        this.reminderHistory = parsed.reminderHistory || [];
        this.missedMeals = parsed.missedMeals || 0;
        this.config = { ...this.config, ...parsed.config };
        
        this._debug(`Loaded ${this.reminderHistory.length} reminders from storage`);
        
        // Clean up old reminders (older than 7 days)
        const weekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
        this.reminderHistory = this.reminderHistory.filter(reminder => 
          new Date(reminder.scheduledTime) > weekAgo
        );
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  /**
   * Save reminder data to storage
   * @private
   */
  _saveToStorage() {
    try {
      const data = {
        reminderHistory: this.reminderHistory,
        missedMeals: this.missedMeals,
        config: this.config,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('glp1-meal-reminders', JSON.stringify(data));
      this._debug('Saved reminder data to storage');
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  /**
   * Sync compliance data with cloud storage
   * @private
   */
  async _syncComplianceData() {
    try {
      // This would integrate with a backend service for healthcare providers
      // to track meal compliance and provide insights
      this._debug('Syncing compliance data...');
      
      const complianceData = {
        missedMeals: this.missedMeals,
        totalReminders: this.reminderHistory.length,
        completedMeals: this.reminderHistory.filter(r => r.status === 'completed').length,
        skippedMeals: this.reminderHistory.filter(r => r.status === 'skipped').length,
        lastSync: new Date().toISOString()
      };

      // In a real implementation, this would send data to a secure healthcare API
      this._debug('Compliance data ready for sync:', complianceData);
      
    } catch (error) {
      console.error('Error syncing compliance data:', error);
    }
  }

  /**
   * Clear all active reminders
   */
  clearAllReminders() {
    this._debug('Clearing all active reminders');
    
    // Clear all timeouts
    this.activeReminders.forEach(reminder => {
      if (reminder.timeoutId) {
        clearTimeout(reminder.timeoutId);
      }
    });
    
    this.activeReminders = [];
    this._saveToStorage();
  }

  /**
   * Get reminder history for analysis
   */
  getReminderHistory() {
    return this.reminderHistory.slice(); // Return copy
  }

  /**
   * Get active reminders
   */
  getActiveReminders() {
    return this.activeReminders.map(reminder => ({
      id: reminder.id,
      mealType: reminder.mealType,
      reminderType: reminder.reminderType,
      scheduledTime: reminder.scheduledTime,
      status: reminder.status
    }));
  }

  /**
   * Get a specific reminder by ID
   */
  getReminderById(reminderId) {
    return this.reminderHistory.find(r => r.id === reminderId) || 
           this.activeReminders.find(r => r.id === reminderId);
  }

  /**
   * Cancel a specific reminder
   */
  cancelReminder(reminderId) {
    this._debug(`Cancelling reminder: ${reminderId}`);
    
    // Find and cancel active reminder
    const activeIndex = this.activeReminders.findIndex(r => r.id === reminderId);
    if (activeIndex !== -1) {
      const reminder = this.activeReminders[activeIndex];
      if (reminder.timeoutId) {
        clearTimeout(reminder.timeoutId);
      }
      this.activeReminders.splice(activeIndex, 1);
      this._saveToStorage();
      return true;
    }
    
    return false;
  }

  /**
   * Request notification permission
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async requestPermission() {
    try {
      return await requestNotificationPermission();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Debug logging
   * @private
   */
  _debug(message, ...args) {
    if (this.config.debugMode) {
      console.log(`[GLP1MealReminder] ${message}`, ...args);
    }
  }
}

// Export as default to match the import in mealReminderService.js
export default GLP1MealReminderSystem;

// Also export a singleton instance
export const glp1MealReminderSystem = new GLP1MealReminderSystem();

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      glp1MealReminderSystem.initialize();
    });
  } else {
    glp1MealReminderSystem.initialize();
  }
}
