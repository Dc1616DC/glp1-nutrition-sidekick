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

  useEffect(() => {
    const loadSites = async () => {
      try {
        const injectionSites = await injectionService.getInjectionSites();
        setSites(injectionSites);
      } catch (error) {
        console.error('Error loading injection sites:', error);
        setSites([]);
      }
    };
    
    loadSites();
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

  const getDaysAgo = (lastUsed?: Date) => {
    if (!lastUsed) return null;
    const days = Math.floor((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

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