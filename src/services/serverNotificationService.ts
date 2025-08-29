/**
 * Server-side Notification Service for GLP-1 Nutrition Sidekick
 * Works with Firebase Cloud Functions for reliable push notifications
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, auth } from '../firebase/config';
import { saveFCMToken, getFCMToken } from './notificationService';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
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
  sent: boolean;
  created: Date;
  lastSent?: Date;
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
  fcmTokens: string[];
}

class ServerNotificationService {
  private scheduleNotificationFunction = httpsCallable(functions, 'scheduleNotification');
  private setupMealRemindersFunction = httpsCallable(functions, 'setupMealReminders');
  private sendImmediateNotificationFunction = httpsCallable(functions, 'sendImmediateNotification');

  /**
   * Initialize the notification service and get FCM token
   */
  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Get FCM token and save it
      const token = await getFCMToken();
      if (token && this.getCurrentUserId()) {
        await saveFCMToken(this.getCurrentUserId()!, token);
        console.log('✅ FCM token saved for server notifications');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize server notification service:', error);
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
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Initialize the service and get FCM token
      await this.initialize();
    } else {
      console.log('❌ Notification permission denied');
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
   * Send immediate notification via server function
   */
  async sendNotification(options: NotificationOptions): Promise<void> {
    const permission = this.getPermissionStatus();
    
    if (permission !== 'granted') {
      console.warn('Cannot send notification: permission not granted');
      return;
    }

    try {
      await this.sendImmediateNotificationFunction({
        title: options.title,
        body: options.body,
        tag: options.tag,
        icon: options.icon
      });
      console.log('📨 Immediate notification sent via server');
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      throw error;
    }
  }

  /**
   * Schedule a notification via server function
   */
  async scheduleNotification(
    type: ScheduledNotification['type'],
    scheduledFor: Date,
    notification: NotificationOptions,
    isRecurring: boolean = false,
    recurringPattern?: 'daily' | 'weekly' | 'custom'
  ): Promise<string> {
    try {
      const result = await this.scheduleNotificationFunction({
        type,
        scheduledFor: scheduledFor.toISOString(),
        notification,
        isRecurring,
        recurringPattern
      });
      
      console.log(`📅 Scheduled ${type} notification for ${scheduledFor.toLocaleString()}`);
      return (result.data as any).notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const notificationRef = doc(db, 'scheduledNotifications', notificationId);
      await updateDoc(notificationRef, { isActive: false });
      
      console.log(`🚫 Cancelled notification ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
      throw error;
    }
  }

  /**
   * Get user's notification preferences from Firestore
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const prefsDoc = await getDoc(doc(db, 'notificationPreferences', userId));
      
      if (prefsDoc.exists()) {
        const data = prefsDoc.data();
        return {
          userId,
          mealReminders: data.mealReminders ?? true,
          hydrationReminders: data.hydrationReminders ?? true,
          educationTips: data.educationTips ?? true,
          medicationTiming: data.medicationTiming ?? false,
          progressChecks: data.progressChecks ?? true,
          quietHours: data.quietHours ?? {
            enabled: true,
            start: "22:00",
            end: "07:00"
          },
          customMealTimes: data.customMealTimes ?? {
            breakfast: "08:00",
            lunch: "12:30",
            dinner: "18:00",
            snacks: ["10:00", "15:30"]
          },
          reminderStyle: data.reminderStyle ?? 'gentle',
          fcmTokens: data.fcmTokens ?? []
        };
      }

      // Return default preferences
      return this.getDefaultPreferences(userId);
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Update user's notification preferences in Firestore
   */
  async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const prefsRef = doc(db, 'notificationPreferences', userId);
      const current = await this.getNotificationPreferences(userId);
      const updated = { ...current, ...preferences };
      
      await setDoc(prefsRef, updated, { merge: true });
      console.log('📱 Updated notification preferences in Firestore');
      
      // If meal reminders were updated, re-setup meal reminders
      if (preferences.mealReminders !== undefined || preferences.customMealTimes) {
        if (updated.mealReminders) {
          await this.setupMealReminders(userId);
        } else {
          await this.cancelMealReminders(userId);
        }
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Set up daily meal reminders via server function
   */
  async setupMealReminders(userId: string): Promise<void> {
    try {
      await this.setupMealRemindersFunction();
      console.log('🍽️ Meal reminders set up via server');
    } catch (error) {
      console.error('Error setting up meal reminders:', error);
      throw error;
    }
  }

  /**
   * Cancel all meal reminders for a user
   */
  async cancelMealReminders(userId: string): Promise<void> {
    try {
      // Query for active meal reminders
      const q = query(
        collection(db, 'scheduledNotifications'),
        where('userId', '==', userId),
        where('type', '==', 'meal_reminder'),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Cancel each one
      const promises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isActive: false })
      );
      
      await Promise.all(promises);
      console.log(`🚫 Cancelled ${querySnapshot.docs.length} meal reminders`);
    } catch (error) {
      console.error('Error cancelling meal reminders:', error);
      throw error;
    }
  }

  /**
   * Get scheduled notifications for a user
   */
  async getScheduledNotifications(userId: string): Promise<ScheduledNotification[]> {
    try {
      const q = query(
        collection(db, 'scheduledNotifications'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          type: data.type,
          scheduledFor: data.scheduledFor.toDate(),
          notification: data.notification,
          isRecurring: data.isRecurring,
          recurringPattern: data.recurringPattern,
          isActive: data.isActive,
          sent: data.sent,
          created: data.created.toDate(),
          lastSent: data.lastSent?.toDate()
        };
      });
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Send educational tip notification via server
   */
  async sendEducationTip(userId: string): Promise<void> {
    const tips = [
      {
        title: "💪 Protein Power",
        body: "Aim for 20-30g protein per meal to preserve muscle mass during your GLP-1 journey.",
        tag: "education_tip"
      },
      {
        title: "🌱 Fiber Friend",
        body: "Increase fiber gradually (3-5g per week) to support digestion without discomfort.",
        tag: "education_tip"
      },
      {
        title: "🎯 Listen to Your Body",
        body: "Trust your new fullness signals - it's okay to stop eating when satisfied.",
        tag: "education_tip"
      },
      {
        title: "💧 Hydration Station",
        body: "Sip water throughout the day to support your medication and prevent nausea.",
        tag: "education_tip"
      },
      {
        title: "🏋️ Strength Matters",
        body: "Include resistance exercise 2-3x per week to maintain your metabolic muscle.",
        tag: "education_tip"
      }
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    await this.sendNotification(randomTip);
  }

  /**
   * Get current user ID from Firebase Auth
   */
  private getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  /**
   * Get default notification preferences
   */
  private getDefaultPreferences(userId: string): NotificationPreferences {
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
      reminderStyle: 'gentle',
      fcmTokens: []
    };
  }
}

// Export singleton instance
export const serverNotificationService = new ServerNotificationService();
export default ServerNotificationService;