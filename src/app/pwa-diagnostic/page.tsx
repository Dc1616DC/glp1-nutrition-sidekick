'use client';

import { useState, useEffect } from 'react';

export default function PWADiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState({
    serviceWorker: 'Checking...',
    manifest: 'Checking...',
    installPrompt: 'Checking...',
    isInstallable: false,
    userAgent: '',
    isStandalone: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {
        userAgent: navigator.userAgent,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches
      };

      // Check Service Worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration('/');
          if (registration) {
            results.serviceWorker = `✅ Registered: ${registration.scope}`;
            
            // Check if service worker is active
            if (registration.active) {
              results.serviceWorker += ` (Active)`;
            } else {
              results.serviceWorker += ` (Not Active)`;
            }
          } else {
            results.serviceWorker = '❌ Not registered';
          }
        } catch (error) {
          results.serviceWorker = `❌ Error: ${error}`;
        }
      } else {
        results.serviceWorker = '❌ Not supported';
      }

      // Check Manifest with more details
      try {
        const response = await fetch('/manifest.json');
        if (response.ok) {
          const manifest = await response.json();
          results.manifest = `✅ Loaded: ${manifest.name}`;
          
          // Validate required PWA fields
          const requiredFields = ['name', 'start_url', 'display', 'icons'];
          const missingFields = requiredFields.filter(field => !manifest[field]);
          if (missingFields.length > 0) {
            results.manifest += ` (Missing: ${missingFields.join(', ')})`;
          }
          
          // Check icons
          const validIcons = manifest.icons?.filter((icon: any) => 
            icon.sizes && parseInt(icon.sizes) >= 192
          );
          if (!validIcons || validIcons.length === 0) {
            results.manifest += ` (No valid icons ≥192px)`;
          }
        } else {
          results.manifest = '❌ Failed to load';
        }
      } catch (error) {
        results.manifest = `❌ Error: ${error}`;
      }

      // Check install prompt
      results.installPrompt = deferredPrompt ? '✅ Available' : '❌ Not available';
      results.isInstallable = !!deferredPrompt;

      setDiagnostics(results);
    };

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setDiagnostics(prev => ({ 
        ...prev, 
        installPrompt: '✅ Available',
        isInstallable: true 
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Run diagnostics after a short delay
    setTimeout(runDiagnostics, 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleManualCheck = () => {
    // Force trigger beforeinstallprompt check
    console.log('Checking for install prompt...');
    
    // Simulate user engagement (Chrome requires this)
    const event = new Event('click');
    document.dispatchEvent(event);
    
    // Check if Chrome has the app install criteria
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
        console.log('Installed apps:', apps);
      });
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome} the install prompt`);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">PWA Installation Diagnostics</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">PWA Status</h2>
          <div className="space-y-3 text-sm">
            <div><strong>Service Worker:</strong> {diagnostics.serviceWorker}</div>
            <div><strong>Manifest:</strong> {diagnostics.manifest}</div>
            <div><strong>Install Prompt:</strong> {diagnostics.installPrompt}</div>
            <div><strong>Installable:</strong> {diagnostics.isInstallable ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Standalone Mode:</strong> {diagnostics.isStandalone ? '✅ Yes' : '❌ No'}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browser Info</h2>
          <div className="text-sm">
            <div><strong>User Agent:</strong></div>
            <div className="text-xs text-gray-600 mt-1 break-all">
              {diagnostics.userAgent}
            </div>
          </div>
        </div>

        {diagnostics.isInstallable && (
          <div className="bg-green-50 rounded-lg p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-green-900 mb-4">🎉 Ready to Install!</h2>
            <p className="text-green-700 mb-4">
              Your PWA is installable! Click the button below to install it.
            </p>
            <button
              onClick={handleInstall}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Install PWA
            </button>
          </div>
        )}

        {!diagnostics.isInstallable && (
          <div className="bg-yellow-50 rounded-lg p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-yellow-900 mb-4">⚠️ Not Installable Yet</h2>
            <div className="text-yellow-700 space-y-2">
              {diagnostics.userAgent.includes('Firefox') ? (
                <div>
                  <p><strong>You're using Firefox:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                    <li>Firefox has limited PWA install support</li>
                    <li>The app still works as a PWA (offline, notifications, etc.)</li>
                    <li><strong>For full install experience, try Chrome or Edge</strong></li>
                    <li>In Chrome: Look for install icon in address bar</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p><strong>Possible reasons:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Service Worker needs time to register (wait a few seconds)</li>
                    <li>Browser doesn't show prompt immediately</li>
                    <li>You might already have it installed</li>
                    <li>Some browsers require user interaction first</li>
                  </ul>
                </div>
              )}
              <p className="mt-4">
                <strong>Try:</strong> {diagnostics.userAgent.includes('Firefox') 
                  ? 'Open in Chrome/Edge for install options, or bookmark this page.'
                  : 'Refresh the page, or check browser address bar for an install icon.'
                }
              </p>
              
              {!diagnostics.userAgent.includes('Firefox') && (
                <div className="mt-4">
                  <button
                    onClick={handleManualCheck}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
                  >
                    Force Install Check
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Refresh Page
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
