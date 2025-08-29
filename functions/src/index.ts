/**
 * Firebase Cloud Functions for GLP-1 Nutrition Sidekick
 * Handles server-side notification scheduling and sending
 */

import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, CallableRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const messaging = admin.messaging();

// Types for our notification system
interface ScheduledNotification {
  id: string;
  userId: string;
  type: 'meal_reminder' | 'hydration' | 'education_tip' | 'medication_timing' | 'progress_check';
  scheduledFor: admin.firestore.Timestamp;
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    tag?: string;
    data?: Record<string, any>;
  };
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'custom';
  isActive: boolean;
  sent: boolean;
  created: admin.firestore.Timestamp;
  lastSent?: admin.firestore.Timestamp;
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

/**
 * Scheduled function that runs every minute to check for notifications to send
 */
export const processScheduledNotifications = onSchedule('every 1 minutes', async (event) => {
    logger.info('🔍 Processing scheduled notifications...');
    
    const now = admin.firestore.Timestamp.now();
    const oneMinuteAgo = admin.firestore.Timestamp.fromMillis(now.toMillis() - 60000);
    
    try {
      // Query for notifications that should be sent now
      const notificationsQuery = await db
        .collection('scheduledNotifications')
        .where('isActive', '==', true)
        .where('sent', '==', false)
        .where('scheduledFor', '<=', now)
        .where('scheduledFor', '>', oneMinuteAgo)
        .get();

      logger.info(`📨 Found ${notificationsQuery.docs.length} notifications to process`);

      const batch = db.batch();
      const promises: Promise<any>[] = [];

      for (const doc of notificationsQuery.docs) {
        const notification = doc.data() as ScheduledNotification;
        
        // Check if user is in quiet hours
        if (await isInQuietHours(notification.userId)) {
          logger.info(`🔇 Skipping notification for user ${notification.userId} - quiet hours`);
          continue;
        }

        // Get user's FCM tokens
        const userTokens = await getUserFCMTokens(notification.userId);
        if (userTokens.length === 0) {
          logger.warn(`⚠️ No FCM tokens found for user ${notification.userId}`);
          continue;
        }

        // Send notification to all user's devices
        promises.push(sendNotificationToTokens(userTokens, notification));
        
        // Mark as sent
        batch.update(doc.ref, { 
          sent: true, 
          lastSent: now 
        });

        // Handle recurring notifications
        if (notification.isRecurring) {
          promises.push(scheduleRecurringNotification(notification));
        }
      }

      // Execute all database updates
      await batch.commit();
      
      // Execute all notification sends
      await Promise.allSettled(promises);
      
      logger.info('✅ Scheduled notifications processing complete');
      
    } catch (error) {
      logger.error('❌ Error processing scheduled notifications:', error);
      throw error;
    }
  });

/**
 * HTTP function to schedule a new notification
 */
export const scheduleNotification = onCall(async (request: CallableRequest<{
  type: string;
  scheduledFor: string;
  notification: any;
  isRecurring?: boolean;
  recurringPattern?: string;
}>) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const userId = request.auth.uid;
  const { type, scheduledFor, notification, isRecurring, recurringPattern } = request.data;

  try {
    const scheduledNotification: Partial<ScheduledNotification> = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: type as ScheduledNotification['type'],
      scheduledFor: admin.firestore.Timestamp.fromDate(new Date(scheduledFor)),
      notification,
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern as ScheduledNotification['recurringPattern'],
      isActive: true,
      sent: false,
      created: admin.firestore.Timestamp.now()
    };

    const docRef = await db.collection('scheduledNotifications').add(scheduledNotification);
    
    logger.info(`📅 Scheduled ${type} notification for ${userId} at ${scheduledFor}`);
    
    return { 
      success: true, 
      notificationId: docRef.id,
      scheduledFor: scheduledFor 
    };
    
  } catch (error) {
    logger.error('Error scheduling notification:', error);
    throw new Error('Failed to schedule notification');
  }
});

/**
 * HTTP function to set up daily meal reminders for a user
 */
export const setupMealReminders = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const userId = request.auth.uid;
  
  try {
    // Get user's notification preferences
    const prefsDoc = await db.collection('notificationPreferences').doc(userId).get();
    if (!prefsDoc.exists) {
      throw new Error('User preferences not found');
    }
    
    const preferences = prefsDoc.data() as NotificationPreferences;
    
    if (!preferences.mealReminders) {
      return { success: true, message: 'Meal reminders disabled for user' };
    }

    // Clear existing meal reminders
    const existingQuery = await db
      .collection('scheduledNotifications')
      .where('userId', '==', userId)
      .where('type', '==', 'meal_reminder')
      .where('isActive', '==', true)
      .get();

    const batch = db.batch();
    existingQuery.docs.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });

    // Schedule new meal reminders
    const { customMealTimes } = preferences;
    const promises: Promise<any>[] = [];

    // Breakfast
    if (customMealTimes.breakfast) {
      const breakfastTime = parseTimeToNextOccurrence(customMealTimes.breakfast);
      promises.push(createMealReminderNotification(
        userId, 'breakfast', breakfastTime, preferences.reminderStyle, batch
      ));
    }

    // Lunch
    if (customMealTimes.lunch) {
      const lunchTime = parseTimeToNextOccurrence(customMealTimes.lunch);
      promises.push(createMealReminderNotification(
        userId, 'lunch', lunchTime, preferences.reminderStyle, batch
      ));
    }

    // Dinner
    if (customMealTimes.dinner) {
      const dinnerTime = parseTimeToNextOccurrence(customMealTimes.dinner);
      promises.push(createMealReminderNotification(
        userId, 'dinner', dinnerTime, preferences.reminderStyle, batch
      ));
    }

    // Snacks
    if (customMealTimes.snacks && customMealTimes.snacks.length > 0) {
      customMealTimes.snacks.forEach(snackTime => {
        const snackDateTime = parseTimeToNextOccurrence(snackTime);
        promises.push(createMealReminderNotification(
          userId, 'snack', snackDateTime, preferences.reminderStyle, batch
        ));
      });
    }

    await batch.commit();
    await Promise.all(promises);

    logger.info(`✅ Set up meal reminders for user ${userId}`);
    
    return { 
      success: true, 
      message: 'Meal reminders scheduled successfully'
    };
    
  } catch (error) {
    logger.error('Error setting up meal reminders:', error);
    throw new Error('Failed to set up meal reminders');
  }
});

/**
 * HTTP function to send an immediate notification (for testing)
 */
export const sendImmediateNotification = onCall(async (request: CallableRequest<{
  title?: string;
  body?: string;
  tag?: string;
  icon?: string;
}>) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const userId = request.auth.uid;
  const { title, body, icon } = request.data;

  try {
    const userTokens = await getUserFCMTokens(userId);
    if (userTokens.length === 0) {
      throw new Error('No FCM tokens found for user');
    }

    const notification = {
      title: title || '🎉 Test Notification',
      body: body || 'Your notifications are working perfectly!',
      icon: icon || '/icons/icon-192x192.png'
    };

    await sendNotificationToTokens(userTokens, { 
      notification,
      userId,
      type: 'education_tip' as const,
      id: 'test',
      scheduledFor: admin.firestore.Timestamp.now(),
      isRecurring: false,
      isActive: true,
      sent: false,
      created: admin.firestore.Timestamp.now()
    });

    return { success: true, message: 'Notification sent successfully' };
    
  } catch (error) {
    logger.error('Error sending immediate notification:', error);
    throw new Error('Failed to send notification');
  }
});

// Helper Functions

async function getUserFCMTokens(userId: string): Promise<string[]> {
  try {
    const prefsDoc = await db.collection('notificationPreferences').doc(userId).get();
    if (!prefsDoc.exists) {
      return [];
    }
    
    const preferences = prefsDoc.data() as NotificationPreferences;
    return preferences.fcmTokens || [];
  } catch (error) {
    logger.error('Error getting user FCM tokens:', error);
    return [];
  }
}

async function sendNotificationToTokens(
  tokens: string[], 
  notification: ScheduledNotification
): Promise<void> {
  const message = {
    notification: {
      title: notification.notification.title,
      body: notification.notification.body,
      icon: notification.notification.icon,
    },
    data: {
      tag: notification.notification.tag || notification.type,
      userId: notification.userId,
      type: notification.type,
      ...(notification.notification.data || {})
    },
    tokens: tokens.filter(token => token && token.length > 0)
  };

  if (message.tokens.length === 0) {
    logger.warn('No valid tokens to send to');
    return;
  }

  try {
    const response = await messaging.sendEachForMulticast(message);
    logger.info(`📱 Sent notification to ${response.successCount} devices`);
    
    if (response.failureCount > 0) {
      logger.warn(`⚠️ Failed to send to ${response.failureCount} devices`);
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          logger.error(`Token ${tokens[idx]} failed:`, resp.error);
        }
      });
    }
  } catch (error) {
    logger.error('Error sending FCM message:', error);
    throw error;
  }
}

async function isInQuietHours(userId: string): Promise<boolean> {
  try {
    const prefsDoc = await db.collection('notificationPreferences').doc(userId).get();
    if (!prefsDoc.exists) {
      return false;
    }
    
    const preferences = prefsDoc.data() as NotificationPreferences;
    
    if (!preferences.quietHours?.enabled) {
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
  } catch (error) {
    logger.error('Error checking quiet hours:', error);
    return false;
  }
}

function parseTimeToNextOccurrence(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (date <= new Date()) {
    date.setDate(date.getDate() + 1);
  }
  
  return date;
}

async function scheduleRecurringNotification(originalNotification: ScheduledNotification): Promise<void> {
  if (originalNotification.recurringPattern === 'daily') {
    const nextDay = new Date(originalNotification.scheduledFor.toDate());
    nextDay.setDate(nextDay.getDate() + 1);
    
    const newNotification: Partial<ScheduledNotification> = {
      ...originalNotification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      scheduledFor: admin.firestore.Timestamp.fromDate(nextDay),
      sent: false,
      created: admin.firestore.Timestamp.now()
    };
    
    await db.collection('scheduledNotifications').add(newNotification);
    logger.info(`🔄 Scheduled recurring notification for ${nextDay.toISOString()}`);
  }
}

async function createMealReminderNotification(
  userId: string,
  mealType: string,
  scheduledFor: Date,
  reminderStyle: 'gentle' | 'motivational' | 'educational',
  batch: FirebaseFirestore.WriteBatch
): Promise<void> {
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
  const message = messages[reminderStyle][mealType as keyof typeof messages[typeof reminderStyle]] || 
                 `Time for ${mealType}! Listen to your body and eat mindfully.`;

  const notification: Partial<ScheduledNotification> = {
    id: `meal_${mealType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type: 'meal_reminder',
    scheduledFor: admin.firestore.Timestamp.fromDate(scheduledFor),
    notification: {
      title: `${emoji} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Time`,
      body: message,
      icon: '/icons/meal-reminder.png',
      tag: `meal_${mealType}`,
      data: { url: '/meal-generator', mealType }
    },
    isRecurring: true,
    recurringPattern: 'daily',
    isActive: true,
    sent: false,
    created: admin.firestore.Timestamp.now()
  };

  const docRef = db.collection('scheduledNotifications').doc();
  batch.set(docRef, notification);
}