'use client';

import { useState, useEffect } from 'react';

export default function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setShowOfflineMessage(true);
      } else if (showOfflineMessage) {
        // Show "back online" message briefly
        setTimeout(() => setShowOfflineMessage(false), 3000);
      }
    };

    // Set initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [showOfflineMessage]);

  if (!showOfflineMessage) {
    return null;
  }

  return (
    <div className={`fixed top-16 left-4 right-4 md:left-auto md:right-4 md:max-w-sm p-3 rounded-lg shadow-lg z-40 transition-all duration-300 ${
      isOnline 
        ? 'bg-emerald-600 text-white' 
        : 'bg-amber-600 text-white'
    }`}>
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0">
          {isOnline ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364m0-12.728L18.364 18.364M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {isOnline ? 'Back online!' : 'You\'re offline'}
          </p>
          <p className="text-xs opacity-90">
            {isOnline 
              ? 'All features restored' 
              : 'Some features may be limited'
            }
          </p>
        </div>
        <button
          onClick={() => setShowOfflineMessage(false)}
          className="text-white hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
