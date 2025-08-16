import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  connectionType: string;
  wasOffline: boolean;
  lastOnline: Date | null;
}

export function useOnlineStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);
    if (navigator.onLine) {
      setLastOnline(new Date());
    }

    // Get connection type if available
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      setConnectionType(connection.effectiveType || 'unknown');
    }

    // Handle online event
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
      
      // If we were previously offline, trigger sync
      if (wasOffline) {
        console.log('Back online - triggering sync');
        // You could dispatch a custom event here for sync
        window.dispatchEvent(new CustomEvent('back-online'));
      }
    };

    // Handle offline event
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      console.log('Gone offline');
      
      // Dispatch offline event for components to handle
      window.dispatchEvent(new CustomEvent('gone-offline'));
    };

    // Handle connection change
    const handleConnectionChange = () => {
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [wasOffline]);

  return {
    isOnline,
    connectionType,
    wasOffline,
    lastOnline
  };
}