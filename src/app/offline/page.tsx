'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [retryAttempts, setRetryAttempts] = useState(0);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setRetryAttempts(0);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetryAttempts(prev => prev + 1);
    
    // Try to navigate back to the original page
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {isOnline ? (
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
              </svg>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="mb-6">
          {isOnline ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Back Online!</h1>
              <p className="text-gray-600">
                Your internet connection has been restored. You can now access all features.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Offline</h1>
              <p className="text-gray-600">
                It looks like you're not connected to the internet. Don't worry - you can still access some features!
              </p>
            </>
          )}
        </div>

        {/* Available Offline Features */}
        {!isOnline && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Available Offline:</h2>
            <div className="space-y-2 text-left">
              <Link 
                href="/meals" 
                className="flex items-center text-blue-700 hover:text-blue-900 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Recipe Library
              </Link>
              <Link 
                href="/education" 
                className="flex items-center text-blue-700 hover:text-blue-900 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Education Resources
              </Link>
              <Link 
                href="/protein-fiber-foods" 
                className="flex items-center text-blue-700 hover:text-blue-900 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Protein & Fiber Guide
              </Link>
              <Link 
                href="/calculator" 
                className="flex items-center text-blue-700 hover:text-blue-900 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Nutrition Calculator
              </Link>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isOnline ? (
            <button
              onClick={handleRetry}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Continue to App
            </button>
          ) : (
            <button
              onClick={handleRetry}
              disabled={retryAttempts >= 3}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {retryAttempts >= 3 ? 'Please Check Connection' : 'Try Again'}
            </button>
          )}
          
          <Link
            href="/"
            className="block w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
          >
            Go to Home
          </Link>
        </div>

        {/* Connection Tips */}
        {!isOnline && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <h3 className="font-semibold mb-2">Connection Tips:</h3>
            <ul className="text-left space-y-1">
              <li>• Check your WiFi connection</li>
              <li>• Try switching to mobile data</li>
              <li>• Move to an area with better signal</li>
              <li>• Restart your device's network</li>
            </ul>
          </div>
        )}

        {/* Status Indicator */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          <span className={isOnline ? 'text-green-700' : 'text-orange-700'}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}