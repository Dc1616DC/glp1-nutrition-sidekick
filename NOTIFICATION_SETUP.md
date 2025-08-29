# Server-Side Notification Setup Guide

This guide explains how your GLP-1 Nutrition app's server-side notification system works and how to deploy it for iPhone push notifications.

## Overview

Your notification system now has two parts:
1. **Client-side**: Browser notifications and permission handling
2. **Server-side**: Firebase Cloud Functions for reliable push notifications

## Architecture

```
User Phone/Browser → Firebase Functions → Firebase Cloud Messaging → iPhone/Browser
                          ↓
                    Firestore Database
                    (scheduled notifications)
```

## Files Created

### Firebase Functions
- `functions/src/index.ts` - Main notification functions
- `functions/package.json` - Dependencies
- `functions/tsconfig.json` - TypeScript configuration

### Client Services
- `src/services/serverNotificationService.ts` - New server-based notification client
- `src/components/NotificationSettings.tsx` - Updated to use server service

### Firestore Rules
- Added rules for `notificationPreferences/{userId}` and `scheduledNotifications/{notificationId}`

## Key Features

### 1. Scheduled Notifications
- **Function**: `processScheduledNotifications` 
- **Trigger**: Runs every minute to check for pending notifications
- **Handles**: Meal reminders, education tips, progress check-ins

### 2. Meal Reminder Setup
- **Function**: `setupMealReminders`
- **Purpose**: Creates daily recurring meal notifications
- **Respects**: Custom meal times, quiet hours, reminder styles

### 3. Immediate Notifications
- **Function**: `sendImmediateNotification`
- **Purpose**: Testing and instant notifications
- **Usage**: Test button in notification settings

## Deployment Steps

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Functions (Already Done)
```bash
# Already created - just for reference
firebase init functions
```

### 3. Build and Deploy Functions
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 4. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## Environment Variables Needed

Make sure these are set in your Firebase project:

```bash
# Already in your .env.local for client
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your-vapid-key"

# These should be configured in Firebase Functions environment
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-service-account-email"
FIREBASE_PRIVATE_KEY="your-service-account-private-key"
```

## Testing

### 1. Local Testing with Emulators
```bash
# Start Firebase emulators
firebase emulators:start

# Your Next.js app will connect to local functions automatically
npm run dev
```

### 2. Production Testing
1. Deploy functions: `firebase deploy --only functions`
2. Use the "Test" button in notification settings
3. Check Firebase Console > Functions logs

## iPhone Push Notifications

### How It Works Now
1. **PWA Installation**: Users add your app to iPhone home screen via Safari
2. **Permission Request**: App requests notification permission
3. **FCM Token**: Firebase generates unique token for device
4. **Server Scheduling**: Functions schedule notifications in Firestore
5. **Automatic Delivery**: Function sends push notifications every minute

### For App Store (Future)
If you want to publish to App Store later:
1. Wrap app with Capacitor or React Native
2. Add native iOS push notification entitlements
3. Your server-side functions work the same!

## Key Benefits

✅ **Reliable**: Notifications work when app is closed  
✅ **Scalable**: Server handles all users automatically  
✅ **iPhone Compatible**: Works with Safari PWA and future native app  
✅ **Customizable**: Respects user preferences (quiet hours, meal times, styles)  
✅ **Educational**: Sends GLP-1 nutrition tips  

## Monitoring

Check these Firebase Console sections:
- **Functions**: See execution logs and errors
- **Firestore**: View scheduled notifications and user preferences
- **Cloud Messaging**: Monitor notification delivery stats

## Troubleshooting

### Common Issues
1. **No notifications received**: Check FCM tokens in user preferences
2. **Functions not running**: Verify deployment and check logs
3. **Permission denied**: Ensure Firestore rules are deployed
4. **Timing issues**: Functions run every minute, may have 1-minute delay

Your notification system is now ready for reliable iPhone push notifications! 🚀