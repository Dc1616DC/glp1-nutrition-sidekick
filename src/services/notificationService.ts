// src/services/notificationService.ts
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from '../firebase/config';
import { updateUserProfile, getUserProfile } from '../firebase/db';

// The VAPID key should be in your .env.local file
// You can generate one at https://tools.reactpwa.com/vapid
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

/**
 * Checks if push notifications are supported in this browser
 * @returns {boolean} Whether notifications are supported
 */
export const isNotificationSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
};

/**
 * Gets the current notification permission state
 * @returns {'granted' | 'denied' | 'default' | 'unsupported'} The current permission state
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
 * Initializes Firebase Messaging
 * @returns {Promise<any>} The messaging instance or null if not supported
 */
export const initializeMessaging = async () => {
  if (!isNotificationSupported()) return null;
  
  try {
    console.log('[NotificationService] Initialising Firebase Messaging...');
    
    // First check if Firebase Messaging is supported in this browser
    const isMessagingSupported = await isSupported();
    if (!isMessagingSupported) {
      console.warn('[NotificationService] Firebase Messaging is not supported in this browser');
      return null;
    }
    
    const messaging = getMessaging(app);
    console.log('[NotificationService] Firebase Messaging initialised');
    return messaging;
  } catch (error) {
    console.error('Error initializing messaging:', error);
    return null;
  }
};

/**
 * Gets the FCM token for the current device using the V1 API
 * @returns {Promise<string|null>} The FCM token or null if failed
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const messaging = await initializeMessaging();
    if (!messaging) return null;
    
    console.log('[NotificationService] Attempting to obtain FCM token using V1 API...');
    // Ensure the dedicated service-worker is registered and pass Firebase
    // config to it so it can initialise the Messaging instance in the SW
    const swRegistration = await registerMessagingServiceWorker();
    if (!swRegistration) {
      console.warn(
        '[NotificationService] Service-worker registration failed or is unsupported'
      );
    } else {
      console.log(
        '[NotificationService] Service-worker registration ready:',
        swRegistration
      );
    }

    // Get token with VAPID key - explicitly using V1 API
    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration ?? undefined,
      // Force V1 API usage
      forceRefresh: true,
    });
    
    if (currentToken) {
      console.log('[NotificationService] Received FCM token:', currentToken);
      // Store token in localStorage for debugging purposes
      if (typeof window !== 'undefined') {
        localStorage.setItem('_fcmToken', currentToken);
      }
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
};

/**
 * Registers (or reuses) the `firebase-messaging-sw.js` service-worker and
 * sends it the Firebase config so it can call `firebase.initializeApp()`
 * internally.  The worker listens for a message `{ type: 'INIT_FIREBASE', payload: config }`.
 *
 * This must run only in the browser.
 */
export const registerMessagingServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    // Try to reuse an existing registration first.
    console.log('[NotificationService] Registering firebase-messaging SW…');
    let registration =
      (await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')) ??
      (await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
        updateViaCache: 'none' // Don't cache the service worker file
      }));

    console.log(
      '[NotificationService] Service-worker registration obtained:',
      registration
    );

    // Post Firebase config to the active worker so it can initialise itself.
    // (If it is still installing we wait for it to become active.)
    const sendConfig = (sw: ServiceWorker | null) => {
      if (!sw) return;
      console.log('[NotificationService] Posting Firebase config to SW');
      sw.postMessage({
        type: 'INIT_FIREBASE',
        payload: {
          apiKey: app.options.apiKey,
          authDomain: app.options.authDomain,
          projectId: app.options.projectId,
          storageBucket: app.options.storageBucket,
          messagingSenderId: app.options.messagingSenderId,
          appId: app.options.appId,
          // Add a flag to indicate we're using the V1 API
          useV1Api: true
        },
      });
    };

    if (registration.active) {
      sendConfig(registration.active);
    } else {
      // Wait until the worker is ready (installed -> activating -> activated)
      console.log(
        '[NotificationService] Waiting for service-worker to become active...'
      );
      navigator.serviceWorker.ready.then((readyReg) => sendConfig(readyReg.active));
    }

    return registration;
  } catch (err) {
    console.error('Failed to register firebase-messaging service-worker:', err);
    if (err instanceof Error) {
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
    return null;
  }
};

/**
 * Saves the FCM token to the user's profile in Firestore
 * @param {string} userId - The user's ID
 * @param {string} token - The FCM token to save
 * @returns {Promise<boolean>} Whether the token was saved successfully
 */
export const saveFCMToken = async (userId: string, token: string): Promise<boolean> => {
  try {
    // Get the current user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) return false;
    
    // Check if token already exists in the user's tokens
    const currentTokens = userProfile.fcmTokens || [];
    if (currentTokens.includes(token)) {
      return true; // Token already saved
    }
    
    // Add the new token and update the profile
    const updatedTokens = [...currentTokens, token];
    await updateUserProfile(userId, { fcmTokens: updatedTokens });
    return true;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
};

/**
 * Requests notification permission and saves the FCM token
 * @param {string} userId - The user's ID
 * @returns {Promise<{status: string, error?: Error}>} The result of the request
 */
export const requestNotificationPermission = async (userId: string): Promise<{ 
  status: 'granted' | 'denied' | 'default' | 'unsupported' | 'error',
  error?: Error 
}> => {
  if (!isNotificationSupported()) {
    return { status: 'unsupported' };
  }
  
  try {
    // Request permission
    console.log('[NotificationService] Requesting Notification permission');
    const permission = await Notification.requestPermission();
    console.log(
      `[NotificationService] Browser permission result: ${permission}`
    );
    
    if (permission === 'granted') {
      // Get and save the FCM token
      const token = await getFCMToken();
      if (token) {
        console.log('[NotificationService] Saving FCM token to user profile');
        await saveFCMToken(userId, token);
      }
    }
    
    return { status: permission as 'granted' | 'denied' | 'default' };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { status: 'error', error: error as Error };
  }
};

/**
 * Sets up a listener for foreground messages
 * @param {Function} callback - The function to call when a message is received
 * @returns {Function} A function to unsubscribe the listener
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
  const setupListener = async () => {
    const messaging = await initializeMessaging();
    if (!messaging) return () => {};
    
    return onMessage(messaging, (payload) => {
      console.log('Message received in the foreground:', payload);
      callback(payload);
    });
  };
  
  // Return a dummy unsubscribe function in case setup fails
  let unsubscribe = () => {};
  
  // Set up the actual listener
  setupListener().then((unsub) => {
    if (typeof unsub === 'function') {
      unsubscribe = unsub;
    }
  });
  
  // Return the unsubscribe function
  return () => unsubscribe();
};

/**
 * Displays a notification using the Notification API
 * @param {string} title - The notification title
 * @param {object} options - Notification options like body, icon, etc.
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
    /* -----------------------------------------------------------
     * 1️⃣  Try the simplest approach first – the page-level
     *     Notification API.  Some browsers (e.g. Safari) prefer
     *     this while others (Chrome) may show the same notice via
     *     the service-worker.
     * --------------------------------------------------------- */
    try {
      const n = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        ...options,
      });

      // Optional click handler so the tab focuses when user clicks
      n.onclick = () => {
        window.focus();
        n.close();
      };

      console.debug(
        '[NotificationService] Notification shown via window.Notification API'
      );
      return true;
    } catch (inlineErr) {
      // Inline failed – log & fall back to service-worker.
      console.warn(
        '[NotificationService] Inline Notification failed, falling back to service-worker:',
        inlineErr
      );
    }

    /* -----------------------------------------------------------
     * 2️⃣  Fallback: use the service-worker registration so that
     *     notifications also work when the tab is in the background.
     * --------------------------------------------------------- */
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.error(
        '[NotificationService] No service-worker registration available'
      );
      return false;
    }

    await registration.showNotification(title, {
      icon: '/icons/icon-192x192.png',
      ...options,
    });

    console.debug(
      '[NotificationService] Notification shown via service-worker'
    );
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
};
