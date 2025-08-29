"use strict";
/**
 * Firebase Cloud Functions for GLP-1 Nutrition Sidekick
 * Handles server-side notification scheduling and sending
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendImmediateNotification = exports.setupMealReminders = exports.scheduleNotification = exports.processScheduledNotifications = void 0;
const admin = __importStar(require("firebase-admin"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
const messaging = admin.messaging();
/**
 * Scheduled function that runs every minute to check for notifications to send
 */
exports.processScheduledNotifications = (0, scheduler_1.onSchedule)('every 1 minutes', async (event) => {
    firebase_functions_1.logger.info('🔍 Processing scheduled notifications...');
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
        firebase_functions_1.logger.info(`📨 Found ${notificationsQuery.docs.length} notifications to process`);
        const batch = db.batch();
        const promises = [];
        for (const doc of notificationsQuery.docs) {
            const notification = doc.data();
            // Check if user is in quiet hours
            if (await isInQuietHours(notification.userId)) {
                firebase_functions_1.logger.info(`🔇 Skipping notification for user ${notification.userId} - quiet hours`);
                continue;
            }
            // Get user's FCM tokens
            const userTokens = await getUserFCMTokens(notification.userId);
            if (userTokens.length === 0) {
                firebase_functions_1.logger.warn(`⚠️ No FCM tokens found for user ${notification.userId}`);
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
        firebase_functions_1.logger.info('✅ Scheduled notifications processing complete');
    }
    catch (error) {
        firebase_functions_1.logger.error('❌ Error processing scheduled notifications:', error);
        throw error;
    }
});
/**
 * HTTP function to schedule a new notification
 */
exports.scheduleNotification = (0, https_1.onCall)(async (request) => {
    // Verify user is authenticated
    if (!request.auth) {
        throw new Error('User must be authenticated');
    }
    const userId = request.auth.uid;
    const { type, scheduledFor, notification, isRecurring, recurringPattern } = request.data;
    try {
        const scheduledNotification = {
            id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            type: type,
            scheduledFor: admin.firestore.Timestamp.fromDate(new Date(scheduledFor)),
            notification,
            isRecurring: isRecurring || false,
            recurringPattern: recurringPattern,
            isActive: true,
            sent: false,
            created: admin.firestore.Timestamp.now()
        };
        const docRef = await db.collection('scheduledNotifications').add(scheduledNotification);
        firebase_functions_1.logger.info(`📅 Scheduled ${type} notification for ${userId} at ${scheduledFor}`);
        return {
            success: true,
            notificationId: docRef.id,
            scheduledFor: scheduledFor
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error scheduling notification:', error);
        throw new Error('Failed to schedule notification');
    }
});
/**
 * HTTP function to set up daily meal reminders for a user
 */
exports.setupMealReminders = (0, https_1.onCall)(async (request) => {
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
        const preferences = prefsDoc.data();
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
        const promises = [];
        // Breakfast
        if (customMealTimes.breakfast) {
            const breakfastTime = parseTimeToNextOccurrence(customMealTimes.breakfast);
            promises.push(createMealReminderNotification(userId, 'breakfast', breakfastTime, preferences.reminderStyle, batch));
        }
        // Lunch
        if (customMealTimes.lunch) {
            const lunchTime = parseTimeToNextOccurrence(customMealTimes.lunch);
            promises.push(createMealReminderNotification(userId, 'lunch', lunchTime, preferences.reminderStyle, batch));
        }
        // Dinner
        if (customMealTimes.dinner) {
            const dinnerTime = parseTimeToNextOccurrence(customMealTimes.dinner);
            promises.push(createMealReminderNotification(userId, 'dinner', dinnerTime, preferences.reminderStyle, batch));
        }
        // Snacks
        if (customMealTimes.snacks && customMealTimes.snacks.length > 0) {
            customMealTimes.snacks.forEach(snackTime => {
                const snackDateTime = parseTimeToNextOccurrence(snackTime);
                promises.push(createMealReminderNotification(userId, 'snack', snackDateTime, preferences.reminderStyle, batch));
            });
        }
        await batch.commit();
        await Promise.all(promises);
        firebase_functions_1.logger.info(`✅ Set up meal reminders for user ${userId}`);
        return {
            success: true,
            message: 'Meal reminders scheduled successfully'
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error setting up meal reminders:', error);
        throw new Error('Failed to set up meal reminders');
    }
});
/**
 * HTTP function to send an immediate notification (for testing)
 */
exports.sendImmediateNotification = (0, https_1.onCall)(async (request) => {
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
            type: 'education_tip',
            id: 'test',
            scheduledFor: admin.firestore.Timestamp.now(),
            isRecurring: false,
            isActive: true,
            sent: false,
            created: admin.firestore.Timestamp.now()
        });
        return { success: true, message: 'Notification sent successfully' };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error sending immediate notification:', error);
        throw new Error('Failed to send notification');
    }
});
// Helper Functions
async function getUserFCMTokens(userId) {
    try {
        const prefsDoc = await db.collection('notificationPreferences').doc(userId).get();
        if (!prefsDoc.exists) {
            return [];
        }
        const preferences = prefsDoc.data();
        return preferences.fcmTokens || [];
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting user FCM tokens:', error);
        return [];
    }
}
async function sendNotificationToTokens(tokens, notification) {
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
        firebase_functions_1.logger.warn('No valid tokens to send to');
        return;
    }
    try {
        const response = await messaging.sendEachForMulticast(message);
        firebase_functions_1.logger.info(`📱 Sent notification to ${response.successCount} devices`);
        if (response.failureCount > 0) {
            firebase_functions_1.logger.warn(`⚠️ Failed to send to ${response.failureCount} devices`);
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    firebase_functions_1.logger.error(`Token ${tokens[idx]} failed:`, resp.error);
                }
            });
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('Error sending FCM message:', error);
        throw error;
    }
}
async function isInQuietHours(userId) {
    var _a;
    try {
        const prefsDoc = await db.collection('notificationPreferences').doc(userId).get();
        if (!prefsDoc.exists) {
            return false;
        }
        const preferences = prefsDoc.data();
        if (!((_a = preferences.quietHours) === null || _a === void 0 ? void 0 : _a.enabled)) {
            return false;
        }
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const { start, end } = preferences.quietHours;
        // Handle quiet hours that span midnight
        if (start > end) {
            return currentTime >= start || currentTime <= end;
        }
        else {
            return currentTime >= start && currentTime <= end;
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('Error checking quiet hours:', error);
        return false;
    }
}
function parseTimeToNextOccurrence(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    // If time has passed today, schedule for tomorrow
    if (date <= new Date()) {
        date.setDate(date.getDate() + 1);
    }
    return date;
}
async function scheduleRecurringNotification(originalNotification) {
    if (originalNotification.recurringPattern === 'daily') {
        const nextDay = new Date(originalNotification.scheduledFor.toDate());
        nextDay.setDate(nextDay.getDate() + 1);
        const newNotification = {
            ...originalNotification,
            id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            scheduledFor: admin.firestore.Timestamp.fromDate(nextDay),
            sent: false,
            created: admin.firestore.Timestamp.now()
        };
        await db.collection('scheduledNotifications').add(newNotification);
        firebase_functions_1.logger.info(`🔄 Scheduled recurring notification for ${nextDay.toISOString()}`);
    }
}
async function createMealReminderNotification(userId, mealType, scheduledFor, reminderStyle, batch) {
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
    const emoji = mealEmojis[mealType] || '🍽️';
    const message = messages[reminderStyle][mealType] ||
        `Time for ${mealType}! Listen to your body and eat mindfully.`;
    const notification = {
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
//# sourceMappingURL=index.js.map