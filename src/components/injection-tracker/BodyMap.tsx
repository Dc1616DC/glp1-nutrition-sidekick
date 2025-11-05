'use client';

import { useEffect, useState } from 'react';
import { injectionService } from '@/services/injectionService';
import { InjectionSite } from '@/types/injection';
import InjectionEducation from './InjectionEducation';

interface BodyMapProps {
  selectedSite: string;
  onSelectSite: (site: string) => void;
}

export default function BodyMap({ selectedSite, onSelectSite }: BodyMapProps) {
  const [sites, setSites] = useState<InjectionSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadSites = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const injectionSites = await injectionService.getInjectionSites();
        if (!mounted) return; // Prevent state updates if component unmounted
        
        // Ensure we always have a valid array
        setSites(Array.isArray(injectionSites) ? injectionSites : []);
      } catch (err) {
        if (!mounted) return; // Prevent state updates if component unmounted
        
        setError('Failed to load injection sites. Using default sites.');
        console.error('Error loading injection sites:', err);
        // Provide fallback sites instead of empty array
        setSites([
          { id: 'left-abdomen', label: 'Left Abdomen', coordinates: { x: 35, y: 45 }, isAvailable: true },
          { id: 'right-abdomen', label: 'Right Abdomen', coordinates: { x: 65, y: 45 }, isAvailable: true },
          { id: 'left-thigh', label: 'Left Thigh', coordinates: { x: 42, y: 70 }, isAvailable: true },
          { id: 'right-thigh', label: 'Right Thigh', coordinates: { x: 58, y: 70 }, isAvailable: true }
        ]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    loadSites();
    
    return () => {
      mounted = false; // Cleanup: prevent state updates after unmount
    };
  }, []);

  const getSiteStyle = (site: InjectionSite) => {
    const isSelected = selectedSite === site.id;
    const baseStyle = 'absolute w-12 h-12 rounded-full border-2 cursor-pointer transition-all transform -translate-x-1/2 -translate-y-1/2';
    
    if (!site.isAvailable) {
      return `${baseStyle} border-red-500 bg-red-100 hover:scale-110`;
    }
    if (isSelected) {
      return `${baseStyle} border-blue-500 bg-blue-200 scale-110`;
    }
    return `${baseStyle} border-green-500 bg-green-100 hover:scale-110 hover:bg-green-200`;
  };

  const formatSiteLabel = (siteId: string) => {
    return siteId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getDaysAgo = (lastUsed?: Date | null): number | null => {
    if (!lastUsed) return null;
    const now = new Date();
    const days = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading injection sites...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-red-800 font-medium">Error Loading Sites</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded text-sm transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // No sites available
  if (sites.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">No injection sites available. Please log your first injection to begin site rotation tracking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Body Visualization */}
      <div className="relative bg-gray-50 rounded-lg p-8 mx-auto" style={{ maxWidth: '300px', height: '400px' }}>
        {/* Simple body outline */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Head */}
          <circle cx="50" cy="15" r="8" fill="none" stroke="#9CA3AF" strokeWidth="1" />
          
          {/* Body */}
          <rect x="40" y="23" width="20" height="30" rx="4" fill="none" stroke="#9CA3AF" strokeWidth="1" />
          
          {/* Arms */}
          <rect x="25" y="28" width="10" height="20" rx="3" fill="none" stroke="#9CA3AF" strokeWidth="1" />
          <rect x="65" y="28" width="10" height="20" rx="3" fill="none" stroke="#9CA3AF" strokeWidth="1" />
          
          {/* Legs */}
          <rect x="42" y="53" width="7" height="25" rx="3" fill="none" stroke="#9CA3AF" strokeWidth="1" />
          <rect x="51" y="53" width="7" height="25" rx="3" fill="none" stroke="#9CA3AF" strokeWidth="1" />
        </svg>

        {/* Injection Sites */}
        {sites.map((site) => (
          <button
            key={site.id}
            onClick={() => onSelectSite(site.id)}
            className={getSiteStyle(site)}
            style={{
              left: `${site.coordinates.x}%`,
              top: `${site.coordinates.y}%`
            }}
            title={site.label}
          >
            {!site.isAvailable && (
              <span className="text-xs font-bold text-red-600">!</span>
            )}
            {selectedSite === site.id && (
              <span className="text-xs font-bold text-blue-600">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Site List with Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Select Injection Site:</h4>
        <div className="grid grid-cols-2 gap-2">
          {sites.map((site) => {
            const daysAgo = getDaysAgo(site.lastUsed);
            return (
              <button
                key={site.id}
                onClick={() => onSelectSite(site.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedSite === site.id
                    ? 'border-blue-500 bg-blue-50'
                    : site.isAvailable
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{formatSiteLabel(site.id)}</span>
                  {selectedSite === site.id && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
                {site.lastUsed && (
                  <div className="text-xs mt-1">
                    {site.isAvailable ? (
                      <span className="text-green-600">
                        Available (used {daysAgo} days ago)
                      </span>
                    ) : (
                      <span className="text-red-600">
                        Wait {14 - (daysAgo || 0)} more days
                      </span>
                    )}
                  </div>
                )}
                {!site.lastUsed && (
                  <div className="text-xs text-gray-500 mt-1">
                    Never used
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rotation Warning */}
      {sites.some(s => !s.isAvailable && s.id === selectedSite) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Site Recently Used:</strong> This site was used less than 14 days ago. 
            Consider selecting a different site to prevent irritation and lumps.
          </p>
        </div>
      )}

      {/* Educational Information */}
      <InjectionEducation />
    </div>
  );
}