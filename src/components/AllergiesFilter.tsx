'use client';

import { useState } from 'react';

interface AllergiesFilterProps {
  selectedAllergies: string[];
  onAllergiesChange: (allergies: string[]) => void;
  className?: string;
}

const COMMON_ALLERGIES = [
  { id: 'nuts', label: 'Nuts', icon: '🥜' },
  { id: 'dairy', label: 'Dairy', icon: '🥛' },
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'shellfish', label: 'Shellfish', icon: '🦐' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'soy', label: 'Soy', icon: '🫘' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'sesame', label: 'Sesame', icon: '🧈' }
];

export default function AllergiesFilter({ 
  selectedAllergies, 
  onAllergiesChange, 
  className = '' 
}: AllergiesFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleAllergy = (allergyId: string) => {
    if (selectedAllergies.includes(allergyId)) {
      onAllergiesChange(selectedAllergies.filter(id => id !== allergyId));
    } else {
      onAllergiesChange([...selectedAllergies, allergyId]);
    }
  };

  const clearAllergies = () => {
    onAllergiesChange([]);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🚫</span>
          <h3 className="font-semibold text-gray-900">Allergies & Restrictions</h3>
          {selectedAllergies.length > 0 && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              {selectedAllergies.length} selected
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg 
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Select any allergies or ingredients to avoid. All recipes will be carefully checked.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {COMMON_ALLERGIES.map((allergy) => (
              <button
                key={allergy.id}
                onClick={() => toggleAllergy(allergy.id)}
                className={`
                  flex items-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200
                  ${selectedAllergies.includes(allergy.id)
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-lg">{allergy.icon}</span>
                <span className="text-sm font-medium">{allergy.label}</span>
                {selectedAllergies.includes(allergy.id) && (
                  <span className="text-red-500 ml-auto">✓</span>
                )}
              </button>
            ))}
          </div>

          {selectedAllergies.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex flex-wrap gap-1">
                {selectedAllergies.map((allergyId) => {
                  const allergy = COMMON_ALLERGIES.find(a => a.id === allergyId);
                  return allergy ? (
                    <span 
                      key={allergyId}
                      className="inline-flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs"
                    >
                      <span>{allergy.icon}</span>
                      <span>{allergy.label}</span>
                      <button
                        onClick={() => toggleAllergy(allergyId)}
                        className="text-red-600 hover:text-red-800 ml-1 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
              <button
                onClick={clearAllergies}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-600 mt-0.5">⚠️</span>
              <div className="text-sm text-yellow-800">
                <strong>Important:</strong> Always verify ingredients yourself. This filter helps 
                guide recipe selection but doesn't replace careful ingredient checking.
              </div>
            </div>
          </div>
        </div>
      )}

      {!isExpanded && selectedAllergies.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedAllergies.slice(0, 3).map((allergyId) => {
            const allergy = COMMON_ALLERGIES.find(a => a.id === allergyId);
            return allergy ? (
              <span 
                key={allergyId}
                className="inline-flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs"
              >
                <span>{allergy.icon}</span>
                <span>{allergy.label}</span>
              </span>
            ) : null;
          })}
          {selectedAllergies.length > 3 && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              +{selectedAllergies.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
