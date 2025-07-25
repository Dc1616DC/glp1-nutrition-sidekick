// GLP-1 Nutrition Sidekick Service Worker
const CACHE_NAME = 'glp1-sidekick-v2'; // Bumped version to clear old cache
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',  // ✅ Updated to PNG
  '/icon-512.png',  // ✅ Updated to PNG
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Handle background sync for meal reminders
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'meal-reminder-sync') {
    event.waitUntil(
      // Handle any pending meal reminder operations
      handleMealReminderSync()
    );
  }
});

// Handle notification actions
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.notification.tag);
  
  event.notification.close();
  
  // Handle different notification actions
  const action = event.action;
  const notificationTag = event.notification.tag;
  
  if (action === 'snooze') {
    // Reschedule notification for later
    event.waitUntil(
      handleSnoozeAction(notificationTag)
    );
  } else if (action === 'complete') {
    // Mark meal as completed
    event.waitUntil(
      handleCompleteAction(notificationTag)
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event.notification.tag);
  // Track notification dismissal analytics if needed
});

// Helper function for meal reminder sync
async function handleMealReminderSync() {
  try {
    console.log('Service Worker: Handling meal reminder sync...');
    // This would sync with your backend or local storage
    // For now, we'll just log it
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Meal reminder sync failed:', error);
    throw error;
  }
}

// Helper function for snooze action
async function handleSnoozeAction(tag) {
  try {
    console.log('Service Worker: Handling snooze action for:', tag);
    // This would reschedule the notification
    // For now, we'll just log it
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Snooze action failed:', error);
    throw error;
  }
}

// Helper function for complete action
async function handleCompleteAction(tag) {
  try {
    console.log('Service Worker: Handling complete action for:', tag);
    // This would mark the meal as completed in your system
    // For now, we'll just log it
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Complete action failed:', error);
    throw error;
  }
}

// Handle push notifications (for future use with Firebase Cloud Messaging)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/icon-192.jpg',
      badge: '/icon-192.jpg',
      tag: data.tag || 'default',
      requireInteraction: true,
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'GLP-1 Sidekick', options)
    );
  }
});

console.log('Service Worker: Script loaded successfully');
