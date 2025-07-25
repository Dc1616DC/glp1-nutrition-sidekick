"use strict";
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
exports.sendTestNotification = exports.triggerMealReminders = exports.checkAndSendMealReminders = void 0;
// Use the v1 Cloud Functions API to retain `pubsub.schedule`
const functions = __importStar(require("firebase-functions/v1"));
// v2 API for HTTPS (2nd Gen) endpoints
const functionsV2 = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin with default credentials
admin.initializeApp();
// Reference to Firestore database
const db = admin.firestore();
/**
 * Converts time string (HH:MM) to minutes since midnight
 * @param timeString - Time in HH:MM format
 * @returns Minutes since midnight
 */
function timeStringToMinutes(timeString) {
    if (!timeString || timeString === '')
        return -1;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}
/**
 * Gets current time in minutes since midnight in user's timezone
 * For simplicity, we're using server time. In production, you'd want to
 * handle timezones properly based on user preferences.
 *
 * @returns Current time in minutes since midnight
 */
function getCurrentTimeInMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}
/**
 * Determines if a reminder should be sent
 * Checks if the reminder time is within the next 5 minutes
 *
 * @param reminderTimeInMinutes - Reminder time in minutes since midnight
 * @param currentTimeInMinutes - Current time in minutes since midnight
 * @returns Boolean indicating if reminder should be sent
 */
function shouldSendReminder(reminderTimeInMinutes, currentTimeInMinutes) {
    if (reminderTimeInMinutes < 0)
        return false;
    // Calculate difference, handling day wraparound
    let diff = reminderTimeInMinutes - currentTimeInMinutes;
    if (diff < -1435) { // -23h55m in minutes, handling day wraparound
        diff += 1440; // Add 24 hours in minutes
    }
    // Send reminder if it's due in the next 5 minutes
    return diff >= 0 && diff <= 5;
}
/**
 * Sends a push notification to a user
 *
 * @param userId - User ID
 * @param fcmTokens - Array of FCM tokens for the user's devices
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data to send with the notification
 * @returns Promise that resolves when notification is sent
 */
async function sendPushNotification(userId, fcmTokens, title, body, data = {}) {
    if (!fcmTokens || fcmTokens.length === 0) {
        console.log(`No FCM tokens found for user ${userId}`);
        return;
    }
    const baseMessage = {
        notification: {
            title,
            body,
        },
        data: {
            ...data,
            userId,
            timestamp: Date.now().toString(),
        },
        // Configure Android notification channel for meal reminders
        android: {
            notification: {
                channelId: 'meal-reminders',
                priority: 'high',
                defaultSound: true,
            },
        },
        // Configure APNS for iOS
        apns: {
            payload: {
                aps: {
                    sound: 'default',
                    badge: 1,
                    contentAvailable: true,
                },
            },
        },
    };
    try {
        let successCount = 0;
        const invalidTokens = [];
        // Send to each token individually to avoid type-based API issues
        await Promise.all(fcmTokens.map(async (token) => {
            var _a, _b;
            try {
                await admin.messaging().send({
                    ...baseMessage,
                    token
                });
                successCount += 1;
            }
            catch (err) {
                const code = (_b = (_a = err === null || err === void 0 ? void 0 : err.errorInfo) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : '';
                // These error codes mean the registration token is bad and should be removed
                if (code === 'messaging/registration-token-not-registered' ||
                    code === 'messaging/invalid-registration-token') {
                    invalidTokens.push(token);
                }
                console.error(`Failed sending to token for user ${userId}: ${token}`, (err === null || err === void 0 ? void 0 : err.message) || err);
            }
        }));
        console.log(`Successfully sent ${successCount}/${fcmTokens.length} notifications for user ${userId}`);
        if (invalidTokens.length) {
            console.warn(`Cleaning up ${invalidTokens.length} invalid tokens for user ${userId}`);
            await removeInvalidTokens(userId, invalidTokens);
        }
    }
    catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
    }
}
/**
 * Removes invalid FCM tokens from a user's profile
 *
 * @param userId - User ID
 * @param invalidTokens - Array of invalid FCM tokens to remove
 * @returns Promise that resolves when tokens are removed
 */
async function removeInvalidTokens(userId, invalidTokens) {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            console.log(`User ${userId} not found`);
            return;
        }
        const userData = userDoc.data();
        const currentTokens = userData.fcmTokens || [];
        const validTokens = currentTokens.filter(token => !invalidTokens.includes(token));
        if (validTokens.length !== currentTokens.length) {
            await userRef.update({
                fcmTokens: validTokens,
            });
            console.log(`Removed ${currentTokens.length - validTokens.length} invalid tokens for user ${userId}`);
        }
    }
    catch (error) {
        console.error(`Error removing invalid tokens for user ${userId}:`, error);
    }
}
/**
 * Gets meal type name based on meal key
 *
 * @param mealKey - Meal key (breakfast, lunch, etc.)
 * @returns User-friendly meal name
 */
function getMealName(mealKey) {
    const mealNames = {
        breakfast: 'Breakfast',
        morningSnack: 'Morning Snack',
        lunch: 'Lunch',
        afternoonSnack: 'Afternoon Snack',
        dinner: 'Dinner',
    };
    return mealNames[mealKey] || mealKey;
}
/**
 * Scheduled Cloud Function that runs every 5 minutes to check and send meal reminders
 * Using v1 API explicitly for pubsub.schedule
 */
exports.checkAndSendMealReminders = functions
    .region('us-central1')
    .pubsub
    .schedule('every 5 minutes')
    .onRun(async (context) => {
    console.log('Running scheduled meal reminder check');
    try {
        // Get current time in minutes
        const currentTimeInMinutes = getCurrentTimeInMinutes();
        console.log(`Current time in minutes: ${currentTimeInMinutes}`);
        // Query all users with notification settings
        const usersSnapshot = await db.collection('users')
            .where('notificationSettings', '!=', null)
            .get();
        console.log(`Found ${usersSnapshot.size} users with notification settings`);
        // Process each user
        const reminderPromises = usersSnapshot.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            const { uid, notificationSettings, fcmTokens } = userData;
            // Skip users without FCM tokens
            if (!fcmTokens || fcmTokens.length === 0) {
                console.log(`User ${uid} has no FCM tokens, skipping`);
                return;
            }
            // Skip users without notification settings
            if (!notificationSettings) {
                console.log(`User ${uid} has no notification settings, skipping`);
                return;
            }
            // Check each meal type for reminders
            const mealTypes = ['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner'];
            for (const mealType of mealTypes) {
                const timeString = notificationSettings[mealType];
                // Skip if no time is set for this meal
                if (!timeString)
                    continue;
                const reminderTimeInMinutes = timeStringToMinutes(timeString);
                // Check if reminder should be sent
                if (shouldSendReminder(reminderTimeInMinutes, currentTimeInMinutes)) {
                    const mealName = getMealName(mealType);
                    console.log(`Sending ${mealName} reminder to user ${uid}`);
                    // Send push notification
                    await sendPushNotification(uid, fcmTokens, `Time for ${mealName}!`, `It's time for your scheduled ${mealName.toLowerCase()}. Don't forget to eat mindfully.`, {
                        mealType,
                        scheduledTime: timeString,
                        notificationType: 'meal-reminder',
                    });
                }
            }
        });
        // Wait for all reminders to be processed
        await Promise.all(reminderPromises);
        console.log('Meal reminder check completed');
        return null;
    }
    catch (error) {
        console.error('Error in meal reminder check:', error);
        return null;
    }
});
/**
 * HTTP endpoint to manually trigger meal reminders check
 * Useful for testing or manual triggering
 */
exports.triggerMealReminders = functionsV2.https.onRequest({
    region: 'us-central1',
}, async (req, res) => {
    // --- Simple API-key check (use env/Secret Manager for real projects) ---
    const apiKey = req.query.apiKey || req.query.key;
    const validApiKey = 'glp1nutrition2025';
    if (!apiKey || apiKey !== validApiKey) {
        console.log('Unauthorized access attempt to triggerMealReminders');
        res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Valid API key required',
        });
        return;
    }
    try {
        const currentTimeInMinutes = getCurrentTimeInMinutes();
        const usersSnapshot = await db
            .collection('users')
            .where('notificationSettings', '!=', null)
            .get();
        const reminderPromises = usersSnapshot.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            const { uid, notificationSettings, fcmTokens } = userData;
            if (!(fcmTokens === null || fcmTokens === void 0 ? void 0 : fcmTokens.length) || !notificationSettings) {
                return { uid, remindersSent: 0 };
            }
            const mealTypes = [
                'breakfast',
                'morningSnack',
                'lunch',
                'afternoonSnack',
                'dinner',
            ];
            let remindersSent = 0;
            for (const mealType of mealTypes) {
                const timeString = notificationSettings[mealType];
                if (!timeString)
                    continue;
                const reminderMins = timeStringToMinutes(timeString);
                const diff = Math.abs(reminderMins - currentTimeInMinutes);
                if (diff <= 15 || diff >= 1425) {
                    await sendPushNotification(uid, fcmTokens, `Time for ${getMealName(mealType)}!`, `It's time for your scheduled ${getMealName(mealType).toLowerCase()}. Don't forget to eat mindfully.`, {
                        mealType,
                        scheduledTime: timeString,
                        notificationType: 'meal-reminder',
                        manualTrigger: 'true',
                    });
                    remindersSent++;
                }
            }
            return { uid, remindersSent };
        });
        const results = await Promise.all(reminderPromises);
        const totalSent = results.reduce((sum, r) => sum + ((r === null || r === void 0 ? void 0 : r.remindersSent) || 0), 0);
        res.status(200).json({
            success: true,
            message: `Processed ${usersSnapshot.size} users, sent ${totalSent} reminders`,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error('Error in manual reminder trigger:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process reminders',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * Function to send a test notification to a specific user
 * Useful for testing push notification setup
 */
exports.sendTestNotification = functionsV2.https.onCall({
    region: 'us-central1',
}, async (request) => {
    // Ensure user is authenticated
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const userId = request.auth.uid;
    try {
        // Get user's FCM tokens
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }
        const userData = userDoc.data();
        const fcmTokens = userData.fcmTokens || [];
        if (fcmTokens.length === 0) {
            throw new functions.https.HttpsError('failed-precondition', 'No FCM tokens found for this user. Please enable notifications first.');
        }
        // Send test notification
        await sendPushNotification(userId, fcmTokens, 'Test Notification', 'This is a test notification from GLP-1 Nutrition Companion', {
            notificationType: 'test',
            timestamp: Date.now().toString()
        });
        return {
            success: true,
            message: `Test notification sent to ${fcmTokens.length} devices`
        };
    }
    catch (error) {
        console.error(`Error sending test notification to user ${userId}:`, error);
        throw new functions.https.HttpsError('internal', 'Failed to send test notification', { message: error instanceof Error ? error.message : 'Unknown error' });
    }
});
//# sourceMappingURL=index.js.map