// Firebase Messaging Service Worker
// This file must be placed in the public directory at the root level of your domain
// to properly handle background push notifications
// (updated to Firebase 9.22.0 which supports the Cloud Messaging V1 API)

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

/**
 * In production we do **not** hard-code secrets in the service-worker.
 * The main application should post the Firebase config object once the SW
 * is registered:
 *
 *   registration.active?.postMessage({
 *     type: 'INIT_FIREBASE',
 *     payload: { apiKey, authDomain, … }
 *   });
 *
 * When the SW receives this message it will initialise Firebase exactly once
 * and wire-up all background handlers.
 */

let messagingInitialised = false;
let messaging; // will hold the Firebase Messaging instance

function setupMessagingHandlers() {
  if (!messaging) return;

  console.log('[firebase-messaging-sw.js] Setting up messaging handlers');
  
  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log(
      '[firebase-messaging-sw.js] Received background message:',
      payload
    );

    const notificationTitle =
      payload.notification?.title || 'Meal Reminder';
    const notificationOptions = {
      body:
        payload.notification?.body ||
        "It's time for your scheduled meal!",
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-128x128.png',
      tag: 'meal-reminder',
      data: payload.data,
    };

    self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  });
}

function initialiseFirebase(config) {
  // Guard: initialise only once
  if (messagingInitialised) return;
  messagingInitialised = true;

  try {
    console.log('[firebase-messaging-sw.js] Initializing Firebase with config:', {
      projectId: config.projectId,
      messagingSenderId: config.messagingSenderId,
      useV1Api: config.useV1Api || false
    });
    
    // Initialize Firebase app
    firebase.initializeApp(config);
    
    // Initialize Firebase Messaging with V1 API options if specified
    if (config.useV1Api) {
      console.log('[firebase-messaging-sw.js] Using Firebase Cloud Messaging V1 API');
      messaging = firebase.messaging();
      
      // You can add specific V1 API configurations here if needed
      // For example, you might want to set specific options for the V1 API
    } else {
      // Legacy initialization (fallback)
      console.log('[firebase-messaging-sw.js] Using legacy Firebase Cloud Messaging API');
      messaging = firebase.messaging();
    }
    
    setupMessagingHandlers();
    console.log('[firebase-messaging-sw.js] Firebase initialised successfully');
  } catch (err) {
    console.error(
      '[firebase-messaging-sw.js] Failed to initialise Firebase:',
      err
    );
    // Log more detailed error information
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.stack) {
      console.error('Error stack:', err.stack);
    }
  }
}

// Listen for configuration message from the client
self.addEventListener('message', (event) => {
  console.log('[firebase-messaging-sw.js] Received message event:', event.data?.type);
  
  if (
    event?.data?.type === 'INIT_FIREBASE' &&
    event.data.payload &&
    !messagingInitialised
  ) {
    initialiseFirebase(event.data.payload);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  
  // Close the notification
  event.notification.close();
  
  // Get the notification data
  const notificationData = event.notification.data;
  
  // This will open or focus the client when a notification is clicked
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true})
      .then((clientList) => {
        // If a window client is available, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window client is available, open a new one
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Optional: Handle subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[firebase-messaging-sw.js] Push subscription changed');
  
  // You can add logic here to update the subscription in your backend
  // This event fires when the push subscription is renewed or changed
});
