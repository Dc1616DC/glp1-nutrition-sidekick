'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { symptomMealService } from '../services/symptomMealService';
import { useAuth } from '../context/AuthContext';

interface SymptomProfile {
  mostCommonSymptoms: string[];
  averageSeverity: number;
  mealRelatedPercentage: number;
}

const SYMPTOM_LABELS: { [key: string]: { label: string; emoji: string } } = {
  nausea: { label: 'Nausea', emoji: '🤢' },
  constipation: { label: 'Constipation', emoji: '🚽' },
  fatigue: { label: 'Fatigue', emoji: '😴' },
  fullness: { label: 'Early Fullness', emoji: '🍽️' },
  cravings: { label: 'Cravings', emoji: '🍩' },
  heartburn: { label: 'Heartburn', emoji: '🔥' },
  bloating: { label: 'Bloating', emoji: '🎈' },
  dizziness: { label: 'Dizziness', emoji: '💫' },
};

export default function SymptomMealSuggestions() {
  const { user } = useAuth();
  const [symptomProfile, setSymptomProfile] = useState<SymptomProfile | null>(null);
  const [suggestions, setSuggestions] = useState<{[key: string]: string[]}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSymptomProfile();
  }, [user]);

  const fetchSymptomProfile = async () => {
    if (!user) return;

    try {
      const profile = await symptomMealService.analyzeSymptomProfile(user.uid);
      
      if (profile) {
        setSymptomProfile(profile);
        
        // Get meal suggestions for most common symptoms
        const suggestions = symptomMealService.getSymptomBasedSuggestions(profile.mostCommonSymptoms);
        setSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Error fetching symptom profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!symptomProfile || symptomProfile.mostCommonSymptoms.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🍽️</span>
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">Personalized Meal Recommendations</h3>
            <p className="text-sm text-blue-700 mb-3">
              Log a few symptoms to get meal suggestions optimized for your comfort.
            </p>
            <Link
              href="/meal-generator"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              <span>Generate Meals</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Symptom-Friendly Meals</h3>
        <Link
          href="/meal-generator"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Generate More →
        </Link>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Based on your recent patterns: {' '}
          {symptomProfile.mostCommonSymptoms.map((symptom, index) => (
            <span key={symptom} className="inline-flex items-center gap-1">
              <span>{SYMPTOM_LABELS[symptom]?.emoji}</span>
              <span className="font-medium">{SYMPTOM_LABELS[symptom]?.label}</span>
              {index < symptomProfile.mostCommonSymptoms.length - 1 && <span>, </span>}
            </span>
          ))}
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(suggestions).map(([symptom, mealList]) => (
          <div key={symptom} className="border-l-4 border-blue-200 pl-4">
            <h4 className="flex items-center gap-2 font-medium text-gray-800 mb-2">
              <span className="text-lg">{SYMPTOM_LABELS[symptom]?.emoji}</span>
              For {SYMPTOM_LABELS[symptom]?.label}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {mealList.map((meal, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700"
                >
                  {meal}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {symptomProfile.mealRelatedPercentage > 50 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>💡 Tip:</strong> {symptomProfile.mealRelatedPercentage}% of your symptoms are meal-related. 
            Consider discussing meal timing and portions with your healthcare provider.
          </p>
        </div>
      )}

    </div>
  );
}