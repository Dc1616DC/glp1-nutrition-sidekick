/**
 * Service Worker for GLP-1 Notification System Testing
 * Simplified version for testing notifications with test-notification.html
 */

const CACHE_NAME = 'glp1-notification-test-v1';
const DEBUG = true;

// Debug logging helper
function debug(message, data = null) {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[SW-TEST ${timestamp}] ${message}`, data);
    } else {
      console.log(`[SW-TEST ${timestamp}] ${message}`);
    }
  }
}

// Log service worker startup
debug('Test Service Worker loaded');

// Assets to cache for the test page
const TEST_ASSETS = [
  '/test-notification.html',
  '/icon-192.jpg',
  '/badge-72.jpg',
  '/badge-urgent.jpg',
  '/check-icon.jpg',
  '/snooze-icon.jpg',
  '/skip-icon.jpg',
  '/help-icon.jpg',
  '/sounds/gentle-chime.wav',
  '/sounds/urgent-chime.wav'
];

// In-memory reminder scheduling
const reminderTimeouts = new Map(); // { reminderId -> timeoutHandle }

/**
 * Schedule a reminder notification
 * @param {Object} reminder Reminder object
 */
function scheduleReminder(reminder) {
  try {
    const when = new Date(reminder.reminderTime).getTime();
    const now = Date.now();
    const delay = when - now;

    // If time already passed (or within 1 sec), fire immediately
    if (delay <= 1000) {
      debug(`Reminder time already elapsed – showing now (${reminder.id})`);
      displayNotificationFromReminder(reminder);
      return;
    }

    debug(`Scheduling reminder ${reminder.id} in ${Math.round(delay / 1000)}s`);
    const handle = setTimeout(() => {
      displayNotificationFromReminder(reminder);
      reminderTimeouts.delete(reminder.id);
    }, delay);

    // Store handle for future cancellation
    reminderTimeouts.set(reminder.id, handle);
  } catch (err) {
    debug('Error scheduling reminder:', err);
  }
}

/**
 * Cancel all pending timeouts
 */
function clearAllScheduledReminders() {
  debug(`Clearing ${reminderTimeouts.size} scheduled reminder(s)`);
  for (const handle of reminderTimeouts.values()) {
    clearTimeout(handle);
  }
  reminderTimeouts.clear();
}

/**
 * Display notification from reminder object
 * @param {Object} r Reminder object
 */
function displayNotificationFromReminder(r) {
  const mealTypeCap =
    r.mealType.charAt(0).toUpperCase() + r.mealType.slice(1);

  let title;
  let body;
  if (r.reminderType === 'prep') {
    title = `${mealTypeCap} Coming Up`;
    body = `Prepare for your ${r.mealType} in 15 minutes.`;
  } else {
    title = `${mealTypeCap} Time`;
    body = `It's time for your ${r.mealType} now.`;
  }

  if (r.isCritical) {
    title = `Important: ${title}`;
  }

  const options = {
    body,
    icon: '/icon-192.jpg',
    badge: r.isCritical ? '/badge-urgent.jpg' : '/badge-72.jpg',
    tag: `meal-reminder-${r.id}`,
    requireInteraction: r.isCritical,
    data: {
      reminderId: r.id,
      mealType: r.mealType,
      reminderType: r.reminderType,
      isCritical: r.isCritical
    },
    actions: [
      { action: 'eaten', title: 'I ate', icon: '/check-icon.jpg' },
      { action: 'snooze', title: 'Remind later', icon: '/snooze-icon.jpg' },
      { action: 'skip', title: 'Skip', icon: '/skip-icon.jpg' }
    ]
  };

  debug('Showing notification from scheduled reminder', { id: r.id });
  self.registration.showNotification(title, options).catch((err) => {
    debug('Error showing scheduled notification:', err);
  });
}

// Install event - cache test assets
self.addEventListener('install', (event) => {
  debug('Service worker install event triggered');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        debug('Caching test assets', TEST_ASSETS);
        return cache.addAll(TEST_ASSETS)
          .then(() => {
            debug('Test assets cached successfully');
            return self.skipWaiting(); // Activate immediately
          })
          .catch(error => {
            debug('Error caching test assets:', error);
            throw error;
          });
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  debug('Service worker activate event triggered');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        debug('Found caches:', cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              debug(`Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        debug('Taking control of all clients');
        return self.clients.claim(); // Take control immediately
      })
      .catch(error => {
        debug('Error during activation:', error);
      })
  );
});

// Message event - handle messages from the test page
self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  if (!type) return;

  debug('Received message:', event.data);

  switch (type) {
    case 'REGISTER_REMINDERS': {
      const { prepReminder, actionReminder } = event.data;
      debug('REGISTER_REMINDERS received', {
        prepId: prepReminder?.id,
        actionId: actionReminder?.id
      });

      if (prepReminder) scheduleReminder(prepReminder);
      if (actionReminder) scheduleReminder(actionReminder);
      break;
    }
    case 'CLEAR_ALL_REMINDERS': {
      clearAllScheduledReminders();
      break;
    }
    case 'TEST_PING': {
      // Send a pong back to confirm connection
      event.source.postMessage({
        type: 'TEST_PONG',
        timestamp: Date.now()
      });
      break;
    }
    default:
      debug('Unknown message type:', type);
      break;
  }
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle requests for test page assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          debug(`Serving from cache: ${event.request.url}`);
          return response;
        }

        debug(`Network request: ${event.request.url}`);
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses for test assets
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                debug(`Caching resource: ${event.request.url}`);
                cache.put(event.request, responseClone);
              });
            }
            return response;
          });
      })
      .catch((error) => {
        debug(`Fetch error: ${error}`);
        return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const reminderId = notification.data?.reminderId;
  const mealType = notification.data?.mealType;
  const reminderType = notification.data?.reminderType || 'unknown';
  
  debug('Notification clicked', {
    reminderId,
    action,
    mealType,
    reminderType
  });
  
  // Close the notification
  notification.close();

  // Handle different actions
  if (action === 'eaten' || action === 'snooze' || action === 'skip' || action === 'acknowledge' || action === 'emergency') {
    // Notify all clients about the action
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'NOTIFICATION_ACTION',
          action,
          reminderId,
          mealType,
          reminderType,
          timestamp: Date.now()
        });
      });
    });
  } else {
    // Default action - open or focus the test page
    event.waitUntil(
      clients.matchAll({
        type: 'window'
      }).then((clientList) => {
        // If test page is already open, focus it
        for (const client of clientList) {
          if (client.url.includes('/test-notification.html') && 'focus' in client) {
            debug('Focusing existing test page window');
            return client.focus();
          }
        }
        
        // Otherwise open the test page
        debug('Opening test page');
        if (clients.openWindow) {
          return clients.openWindow('/test-notification.html');
        }
      })
    );
  }
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  const notification = event.notification;
  const reminderId = notification.data?.reminderId;
  
  debug('Notification dismissed', {
    reminderId,
    data: notification.data
  });
  
  // Notify clients about the dismissal
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NOTIFICATION_DISMISSED',
        reminderId,
        timestamp: Date.now()
      });
    });
  });
});

// Handle errors
self.addEventListener('error', (event) => {
  debug('Service worker error:', event.error);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  debug('Unhandled promise rejection:', event.reason);
});

debug('Test service worker initialization complete');
