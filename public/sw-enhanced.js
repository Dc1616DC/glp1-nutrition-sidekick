// GLP-1 Nutrition Sidekick Enhanced Service Worker for Offline Support
const CACHE_NAME = 'glp1-sidekick-v4';
const STATIC_CACHE_NAME = 'glp1-static-v4';
const DYNAMIC_CACHE_NAME = 'glp1-dynamic-v4';
const API_CACHE_NAME = 'glp1-api-v4';

// Static assets that should always be cached
const STATIC_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  '/offline', // Offline fallback page
  '/meals', // Recipe library (free for all users)
  '/education',
  '/protein-fiber-foods',
  '/calculator'
];

// Routes that should be cached dynamically
const CACHEABLE_ROUTES = [
  '/meals/',
  '/cookbook',
  '/meal-generator',
  '/meal-log',
  '/symptoms',
  '/analytics',
  '/settings',
  '/shopping-list',
  '/pantry'
];

// API endpoints that can be cached
const CACHEABLE_APIS = [
  '/api/get-meals-data'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing enhanced service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_URLS);
      }),
      // Pre-cache critical API data
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('SW: Pre-caching API data');
        // Pre-cache meals data for offline access
        return cache.add('/api/get-meals-data');
      })
    ]).then(() => {
      console.log('SW: Installation complete');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('SW: Installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  
  const expectedCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!expectedCaches.includes(cacheName)) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (isAPIRequest(request.url)) {
    event.respondWith(networkFirst(request, API_CACHE_NAME));
  } else if (isPageRequest(request)) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
  } else {
    // For other resources (images, fonts, etc.)
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE_NAME));
  }
});

// Cache-first strategy (for static assets)
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('SW: Cache-first failed:', error);
    
    // Return offline fallback for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline') || caches.match('/');
    }
    throw error;
  }
}

// Network-first strategy (for API calls)
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy (for pages)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Start fetching in the background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('SW: Background fetch failed:', error);
    return cachedResponse;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  if (cachedResponse) {
    return cachedResponse;
  } else {
    try {
      return await fetchPromise;
    } catch (error) {
      // Return offline fallback for navigation requests
      if (request.destination === 'document') {
        return caches.match('/offline') || caches.match('/');
      }
      throw error;
    }
  }
}

// Helper functions to categorize requests
function isStaticAsset(url) {
  return url.includes('/icon-') || 
         url.includes('/favicon.ico') || 
         url.includes('/manifest.json') ||
         url.includes('/_next/static/');
}

function isAPIRequest(url) {
  return url.includes('/api/') && 
         CACHEABLE_APIS.some(api => url.includes(api));
}

function isPageRequest(request) {
  return request.destination === 'document';
}

function isCacheableRoute(url) {
  return CACHEABLE_ROUTES.some(route => url.includes(route));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'meal-save-sync') {
    event.waitUntil(syncSavedMeals());
  } else if (event.tag === 'meal-log-sync') {
    event.waitUntil(syncMealLogs());
  } else if (event.tag === 'rating-sync') {
    event.waitUntil(syncRatings());
  }
});

// Sync saved meals when back online
async function syncSavedMeals() {
  try {
    console.log('SW: Syncing saved meals...');
    
    // Get offline saved meals from IndexedDB
    const offlineMeals = await getOfflineData('savedMeals');
    
    for (const meal of offlineMeals) {
      try {
        const response = await fetch('/api/save-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(meal.data)
        });
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineData('savedMeals', meal.id);
          console.log('SW: Synced saved meal:', meal.data.title);
        }
      } catch (error) {
        console.error('SW: Failed to sync meal:', error);
      }
    }
  } catch (error) {
    console.error('SW: Sync saved meals failed:', error);
  }
}

// Sync meal logs when back online
async function syncMealLogs() {
  try {
    console.log('SW: Syncing meal logs...');
    
    const offlineLogs = await getOfflineData('mealLogs');
    
    for (const log of offlineLogs) {
      try {
        const response = await fetch('/api/log-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log.data)
        });
        
        if (response.ok) {
          await removeOfflineData('mealLogs', log.id);
          console.log('SW: Synced meal log');
        }
      } catch (error) {
        console.error('SW: Failed to sync meal log:', error);
      }
    }
  } catch (error) {
    console.error('SW: Sync meal logs failed:', error);
  }
}

// Sync ratings when back online
async function syncRatings() {
  try {
    console.log('SW: Syncing ratings...');
    
    const offlineRatings = await getOfflineData('ratings');
    
    for (const rating of offlineRatings) {
      try {
        const response = await fetch(`/api/rate-meal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rating.data)
        });
        
        if (response.ok) {
          await removeOfflineData('ratings', rating.id);
          console.log('SW: Synced rating');
        }
      } catch (error) {
        console.error('SW: Failed to sync rating:', error);
      }
    }
  } catch (error) {
    console.error('SW: Sync ratings failed:', error);
  }
}

// Helper functions for offline data storage (using IndexedDB)
async function getOfflineData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('glp1-offline-db', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
}

async function removeOfflineData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('glp1-offline-db', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked:', event.notification.tag);
  event.notification.close();
  
  const action = event.action;
  let urlToOpen = '/';
  
  if (action === 'view-meals') {
    urlToOpen = '/meals';
  } else if (action === 'log-meal') {
    urlToOpen = '/meal-log';
  } else if (action === 'generate-meal') {
    urlToOpen = '/meal-generator';
  }
  
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'default',
      requireInteraction: false,
      actions: [
        { action: 'view-meals', title: 'View Recipes' },
        { action: 'log-meal', title: 'Log Meal' }
      ],
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'GLP-1 Sidekick', 
        options
      )
    );
  }
});

console.log('SW: Enhanced service worker loaded successfully');