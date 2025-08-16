/**
 * Service Worker for Push Notifications
 * Handles background notification processing
 */

const NOTIFICATION_CACHE = 'glp1-notifications-v1';
const APP_NAME = 'GLP-1 Nutrition Sidekick';

// Install event
self.addEventListener('install', (event) => {
  console.log('📱 Notification service worker installing...');
  self.skipWaiting();
});

// Activate event  
self.addEventListener('activate', (event) => {
  console.log('📱 Notification service worker activated');
  event.waitUntil(self.clients.claim());
});

// Handle push events (for future server-sent notifications)
self.addEventListener('push', (event) => {
  console.log('📬 Push event received:', event);
  
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    tag: data.tag,
    data: data.data,
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title || APP_NAME, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.notification);
  
  event.notification.close();

  const clickAction = event.action;
  const notificationData = event.notification.data || {};
  
  // Determine URL to open
  let urlToOpen = '/';
  
  if (clickAction === 'view_meal_generator') {
    urlToOpen = '/meal-generator';
  } else if (clickAction === 'log_meal') {
    urlToOpen = '/meal-log';
  } else if (clickAction === 'view_education') {
    urlToOpen = '/meal-generator'; // Will show education modal
  } else if (notificationData.url) {
    urlToOpen = notificationData.url;
  }

  // Handle notification click
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Check if app is already open
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            // App is open, focus it and navigate
            client.focus();
            return client.navigate(urlToOpen);
          }
        }
        
        // App is not open, open new window
        return self.clients.openWindow(urlToOpen);
      })
      .catch((error) => {
        console.error('Error handling notification click:', error);
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('🚫 Notification closed:', event.notification);
  
  // Track dismissal analytics if needed
  const data = event.notification.data || {};
  if (data.trackDismissal) {
    // Send analytics event
    console.log('📊 Notification dismissed:', data);
  }
});

// Background sync for sending queued notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-queued-notifications') {
    event.waitUntil(sendQueuedNotifications());
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SCHEDULE_NOTIFICATION':
      handleScheduleNotification(data);
      break;
    case 'CANCEL_NOTIFICATION':
      handleCancelNotification(data);
      break;
    case 'GET_NOTIFICATIONS':
      handleGetNotifications(event);
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

/**
 * Handle scheduling a notification
 */
function handleScheduleNotification(data) {
  const { id, scheduledFor, notification } = data;
  const now = new Date().getTime();
  const delay = new Date(scheduledFor).getTime() - now;
  
  if (delay <= 0) {
    console.warn('Cannot schedule notification in the past');
    return;
  }
  
  // Store scheduled notification
  setTimeout(() => {
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: notification.tag,
      data: notification.data,
      requireInteraction: notification.requireInteraction || false,
      actions: notification.actions || []
    });
  }, delay);
  
  console.log(`📅 Scheduled notification ${id} for ${new Date(scheduledFor).toLocaleString()}`);
}

/**
 * Handle canceling a notification
 */
function handleCancelNotification(data) {
  const { tag } = data;
  
  // Get all notifications and close matching ones
  self.registration.getNotifications({ tag })
    .then((notifications) => {
      notifications.forEach(notification => notification.close());
      console.log(`🚫 Cancelled notifications with tag: ${tag}`);
    });
}

/**
 * Handle getting active notifications
 */
function handleGetNotifications(event) {
  self.registration.getNotifications()
    .then((notifications) => {
      const notificationData = notifications.map(notification => ({
        title: notification.title,
        body: notification.body,
        tag: notification.tag,
        data: notification.data
      }));
      
      event.ports[0].postMessage({
        type: 'NOTIFICATIONS_RESPONSE',
        notifications: notificationData
      });
    });
}

/**
 * Send any queued notifications (for background sync)
 */
async function sendQueuedNotifications() {
  try {
    // In a full implementation, this would check a queue
    // and send notifications that were scheduled while offline
    console.log('📤 Processing queued notifications...');
    
    // For now, just log that we processed the queue
    console.log('✅ Queued notifications processed');
  } catch (error) {
    console.error('❌ Error processing queued notifications:', error);
    throw error; // This will cause the sync to retry
  }
}

/**
 * Helper function to create notification actions
 */
function createNotificationActions(type) {
  const actions = {
    meal_reminder: [
      {
        action: 'view_meal_generator',
        title: '🍽️ Generate Meal',
        icon: '/icons/meal-action.png'
      },
      {
        action: 'log_meal',
        title: '📝 Log Meal',
        icon: '/icons/log-action.png'
      }
    ],
    education_tip: [
      {
        action: 'view_education',
        title: '📚 Learn More',
        icon: '/icons/education-action.png'
      }
    ],
    hydration: [
      {
        action: 'mark_hydrated',
        title: '💧 Mark as Done',
        icon: '/icons/check-action.png'
      }
    ]
  };
  
  return actions[type] || [];
}

// Log that service worker is loaded
console.log('📱 GLP-1 Notification Service Worker loaded successfully');