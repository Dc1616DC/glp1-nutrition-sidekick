'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          // Register the simple service worker
          const registration = await navigator.serviceWorker.register('/sw-simple.js');
          console.log('Service Worker registered successfully:', registration.scope);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New service worker installed, page refresh may be needed');
                  // You could show a toast here asking user to refresh
                }
              });
            }
          });
          
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      });
    } else {
      console.log('Service Worker not supported');
    }
  }, []);

  return null; // This component doesn't render anything
}
