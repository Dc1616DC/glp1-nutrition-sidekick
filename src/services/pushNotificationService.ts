/**
 * Push Notification Service for GLP-1 Nutrition Sidekick
 * Handles meal reminders, education tips, and motivational messages
 */

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: Record<string, unknown>;
}

interface ScheduledNotification {
  id: string;
  userId: string;
  type: 'meal_reminder' | 'hydration' | 'education_tip' | 'medication_timing' | 'progress_check';
  scheduledFor: Date;
  notification: NotificationOptions;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'custom';
  isActive: boolean;
  created: Date;
}

interface NotificationPreferences {
  userId: string;
  mealReminders: boolean;
  hydrationReminders: boolean;
  educationTips: boolean;
  medicationTiming: boolean;
  progressChecks: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "07:00"
  };
  customMealTimes: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string[];
  };
  reminderStyle: 'gentle' | 'motivational' | 'educational';
}

class PushNotificationService {
  private worker: ServiceWorker | null = null;

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker for notifications
      const registration = await navigator.serviceWorker.register('/sw-notifications.js');
      console.log('Notification service worker registered:', registration);
      
      this.worker = registration.active;
      return true;
    } catch (error) {
      console.error('Failed to register notification service worker:', error);
      return false;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications are not supported');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    
    // Track permission grant for analytics
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      this.trackEvent('notification_permission_granted');
    } else {
      console.log('❌ Notification permission denied');
      this.trackEvent('notification_permission_denied');
    }

    return permission;
  }

  /**
   * Check current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Send immediate notification
   */
  async sendNotification(options: NotificationOptions): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Cannot send notification: permission not granted');
      return;
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/badge-72x72.png',
      image: options.image,
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
      data: options.data
    });

    // Auto-close after 10 seconds unless requireInteraction is true
    if (!options.requireInteraction) {
      setTimeout(() => notification.close(), 10000);
    }

    // Handle notification clicks
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      if (options.data?.url) {
        window.open(options.data.url, '_blank');
      }
      
      notification.close();
      this.trackEvent('notification_clicked', { tag: options.tag });
    };
  }

  /**
   * Schedule a notification for later
   */
  async scheduleNotification(
    userId: string,
    type: ScheduledNotification['type'],
    scheduledFor: Date,
    notification: NotificationOptions,
    isRecurring: boolean = false,
    recurringPattern?: 'daily' | 'weekly' | 'custom'
  ): Promise<string> {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scheduledNotification: ScheduledNotification = {
      id,
      userId,
      type,
      scheduledFor,
      notification,
      isRecurring,
      recurringPattern,
      isActive: true,
      created: new Date()
    };

    // Store in localStorage for now (in production, use backend storage)
    const existingNotifications = this.getStoredNotifications();
    existingNotifications.push(scheduledNotification);
    localStorage.setItem('scheduledNotifications', JSON.stringify(existingNotifications));

    // Set up timer for notification
    this.setNotificationTimer(scheduledNotification);

    console.log(`📅 Scheduled ${type} notification for ${scheduledFor.toLocaleString()}`);
    return id;
  }

  /**
   * Cancel a scheduled notification
   */
  cancelNotification(notificationId: string): void {
    const notifications = this.getStoredNotifications();
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isActive: false }
        : notification
    );
    
    localStorage.setItem('scheduledNotifications', JSON.stringify(updatedNotifications));
    console.log(`🚫 Cancelled notification ${notificationId}`);
  }

  /**
   * Get user's notification preferences
   */
  getNotificationPreferences(userId: string): NotificationPreferences {
    const stored = localStorage.getItem(`notificationPrefs_${userId}`);
    
    if (stored) {
      return JSON.parse(stored);
    }

    // Default preferences
    return {
      userId,
      mealReminders: true,
      hydrationReminders: true,
      educationTips: true,
      medicationTiming: false,
      progressChecks: true,
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "07:00"
      },
      customMealTimes: {
        breakfast: "08:00",
        lunch: "12:30",
        dinner: "18:00",
        snacks: ["10:00", "15:30"]
      },
      reminderStyle: 'gentle'
    };
  }

  /**
   * Update user's notification preferences
   */
  updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    const current = this.getNotificationPreferences(userId);
    const updated = { ...current, ...preferences };
    
    localStorage.setItem(`notificationPrefs_${userId}`, JSON.stringify(updated));
    console.log('📱 Updated notification preferences');
  }

  /**
   * Set up daily meal reminders
   */
  async setupMealReminders(userId: string): Promise<void> {
    const preferences = this.getNotificationPreferences(userId);
    
    if (!preferences.mealReminders) {
      console.log('Meal reminders disabled for user');
      return;
    }

    const { customMealTimes } = preferences;
    const today = new Date();

    // Schedule breakfast reminder
    if (customMealTimes.breakfast) {
      const breakfastTime = this.parseTimeString(customMealTimes.breakfast);
      if (breakfastTime > new Date()) { // Only if still in the future today
        await this.scheduleNotification(
          userId,
          'meal_reminder',
          breakfastTime,
          this.createMealReminderNotification('breakfast', preferences.reminderStyle),
          true,
          'daily'
        );
      }
    }

    // Schedule lunch reminder
    if (customMealTimes.lunch) {
      const lunchTime = this.parseTimeString(customMealTimes.lunch);
      if (lunchTime > new Date()) {
        await this.scheduleNotification(
          userId,
          'meal_reminder',
          lunchTime,
          this.createMealReminderNotification('lunch', preferences.reminderStyle),
          true,
          'daily'
        );
      }
    }

    // Schedule dinner reminder
    if (customMealTimes.dinner) {
      const dinnerTime = this.parseTimeString(customMealTimes.dinner);
      if (dinnerTime > new Date()) {
        await this.scheduleNotification(
          userId,
          'meal_reminder',
          dinnerTime,
          this.createMealReminderNotification('dinner', preferences.reminderStyle),
          true,
          'daily'
        );
      }
    }

    // Schedule snack reminders
    if (customMealTimes.snacks) {
      customMealTimes.snacks.forEach(async (snackTime, _index) => {
        const snackDateTime = this.parseTimeString(snackTime);
        if (snackDateTime > new Date()) {
          await this.scheduleNotification(
            userId,
            'meal_reminder',
            snackDateTime,
            this.createMealReminderNotification('snack', preferences.reminderStyle),
            true,
            'daily'
          );
        }
      });
    }
  }

  /**
   * Send educational tip notification
   */
  async sendEducationTip(userId: string): Promise<void> {
    const preferences = this.getNotificationPreferences(userId);
    
    if (!preferences.educationTips) {
      return;
    }

    const tips = [
      {
        title: "💪 Protein Power",
        body: "Aim for 20-30g protein per meal to preserve muscle mass during your GLP-1 journey.",
        data: { url: "/meal-generator", category: "protein" }
      },
      {
        title: "🌱 Fiber Friend",
        body: "Increase fiber gradually (3-5g per week) to support digestion without discomfort.",
        data: { url: "/meal-generator", category: "fiber" }
      },
      {
        title: "🎯 Listen to Your Body",
        body: "Trust your new fullness signals - it's okay to stop eating when satisfied.",
        data: { url: "/meal-generator", category: "satiety" }
      },
      {
        title: "💧 Hydration Station",
        body: "Sip water throughout the day to support your medication and prevent nausea.",
        data: { url: "/meal-generator" }
      },
      {
        title: "🏋️ Strength Matters",
        body: "Include resistance exercise 2-3x per week to maintain your metabolic muscle.",
        data: { url: "/meal-generator", category: "muscle" }
      }
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    await this.sendNotification({
      ...randomTip,
      tag: 'education_tip',
      icon: '/icons/education-icon.png'
    });
  }

  /**
   * Private helper methods
   */
  private parseTimeString(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (date <= new Date()) {
      date.setDate(date.getDate() + 1);
    }
    
    return date;
  }

  private createMealReminderNotification(
    mealType: string, 
    style: 'gentle' | 'motivational' | 'educational'
  ): NotificationOptions {
    const mealEmojis = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };

    const messages = {
      gentle: {
        breakfast: "Good morning! Consider having some protein-rich breakfast to start your day.",
        lunch: "Lunch time reminder - listen to your body and eat when you're ready.",
        dinner: "Evening meal time - a gentle reminder to nourish yourself.",
        snack: "Snack time if you're feeling hungry. No pressure, just a gentle reminder."
      },
      motivational: {
        breakfast: "Rise and fuel! Your body is ready for a protein-packed breakfast!",
        lunch: "Lunch power hour! You're doing great on your health journey!",
        dinner: "Dinner time champion! End your day with nourishing choices!",
        snack: "Snack smart! You're building healthy habits one bite at a time!"
      },
      educational: {
        breakfast: "Breakfast = Breaking the fast. Protein now helps maintain muscle mass all day.",
        lunch: "Midday nutrition: This is when your body needs sustained energy from balanced meals.",
        dinner: "Evening nourishment: Lighter meals support better sleep and digestion.",
        snack: "Smart snacking: Choose protein or fiber to support stable blood sugar."
      }
    };

    const emoji = mealEmojis[mealType as keyof typeof mealEmojis] || '🍽️';
    const message = messages[style][mealType as keyof typeof messages[typeof style]] || 
                   `Time for ${mealType}! Listen to your body and eat mindfully.`;

    return {
      title: `${emoji} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Time`,
      body: message,
      icon: '/icons/meal-reminder.png',
      tag: `meal_${mealType}`,
      data: { url: '/meal-generator', mealType }
    };
  }

  private setNotificationTimer(notification: ScheduledNotification): void {
    const now = new Date().getTime();
    const scheduledTime = notification.scheduledFor.getTime();
    const delay = scheduledTime - now;

    if (delay <= 0) {
      // Time has already passed
      return;
    }

    setTimeout(async () => {
      if (this.isInQuietHours(notification.userId)) {
        console.log('Skipping notification during quiet hours');
        return;
      }

      await this.sendNotification(notification.notification);

      // Handle recurring notifications
      if (notification.isRecurring && notification.recurringPattern === 'daily') {
        const nextDay = new Date(notification.scheduledFor);
        nextDay.setDate(nextDay.getDate() + 1);
        
        await this.scheduleNotification(
          notification.userId,
          notification.type,
          nextDay,
          notification.notification,
          true,
          'daily'
        );
      }
    }, delay);
  }

  private isInQuietHours(userId: string): boolean {
    const preferences = this.getNotificationPreferences(userId);
    
    if (!preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { start, end } = preferences.quietHours;
    
    // Handle quiet hours that span midnight
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    } else {
      return currentTime >= start && currentTime <= end;
    }
  }

  private getStoredNotifications(): ScheduledNotification[] {
    const stored = localStorage.getItem('scheduledNotifications');
    return stored ? JSON.parse(stored) : [];
  }

  private trackEvent(event: string, data?: Record<string, unknown>): void {
    // In production, send to analytics service
    console.log(`📊 Event: ${event}`, data);
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
export default PushNotificationService;