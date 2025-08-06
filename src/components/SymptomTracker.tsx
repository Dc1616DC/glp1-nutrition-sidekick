'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

// Common GLP-1 symptoms based on research
const SYMPTOM_OPTIONS = [
  { value: 'nausea', label: 'Nausea', emoji: '🤢' },
  { value: 'constipation', label: 'Constipation', emoji: '🚽' },
  { value: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { value: 'fullness', label: 'Early Fullness', emoji: '🍽️' },
  { value: 'cravings', label: 'Cravings', emoji: '🍩' },
  { value: 'heartburn', label: 'Heartburn', emoji: '🔥' },
  { value: 'bloating', label: 'Bloating', emoji: '🎈' },
  { value: 'dizziness', label: 'Dizziness', emoji: '💫' },
  { value: 'other', label: 'Other', emoji: '📝' },
];

export default function SymptomTracker({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const [symptom, setSymptom] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [mealRelated, setMealRelated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user || !symptom) return;
    if (symptom === 'other' && !customSymptom.trim()) return;

    setLoading(true);
    try {
      // Use custom symptom name if "other" is selected
      const finalSymptom = symptom === 'other' ? customSymptom.trim() : symptom;
      
      // Save to Firestore
      const symptomData = {
        symptom: finalSymptom,
        originalSymptom: symptom, // Keep track of whether it was a predefined or custom symptom
        severity,
        notes,
        mealRelated,
        timestamp: new Date(),
        userId: user.uid,
      };

      await addDoc(collection(db, `userSymptoms/${user.uid}/logs`), symptomData);

      // Get AI tip from Grok (use the final symptom name)
      const aiTip = await generateSymptomTip({ symptom: finalSymptom, severity });
      setTip(aiTip);
      setShowSuccess(true);

      // Reset form after 5 seconds
      setTimeout(() => {
        setSymptom('');
        setCustomSymptom('');
        setSeverity(5);
        setNotes('');
        setMealRelated(null);
        setShowSuccess(false);
        if (onClose) onClose();
      }, 5000);

    } catch (error) {
      console.error('Error logging symptom:', error);
      setTip('Unable to generate tip at this time. Your symptom has been logged.');
    } finally {
      setLoading(false);
    }
  };

  // Generate symptom tip using API route
  const generateSymptomTip = async ({ symptom, severity }: { symptom: string; severity: number }) => {
    try {
      const response = await fetch('/api/generate-symptom-tip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptom, severity }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tip');
      }

      const data = await response.json();
      return data.tip;
    } catch (error) {
      console.error('Error generating tip:', error);
      return 'Remember to stay hydrated and eat small, frequent meals. Consult your healthcare provider if symptoms persist.';
    }
  };

  const getSeverityLabel = (value: number) => {
    if (value <= 3) return 'Mild';
    if (value <= 6) return 'Moderate';
    return 'Severe';
  };

  const getSeverityColor = (value: number) => {
    if (value <= 3) return 'text-green-600';
    if (value <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Log Symptom</h2>
        <p className="text-xs text-gray-500">Track for better care</p>
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-xs">
        <p className="text-blue-800">
          <strong>Note:</strong> This is for personal tracking only, not medical advice. 
          Consult your doctor for concerning symptoms.
        </p>
      </div>

      {showSuccess ? (
        // Success State
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Symptom Logged!</h3>
          {tip && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 text-left">
              <p className="text-sm text-green-800">
                <strong>💡 RD Tip:</strong> {tip}
              </p>
            </div>
          )}
        </div>
      ) : (
        // Form
        <div className="space-y-4">
          {/* Symptom Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you experiencing?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SYMPTOM_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSymptom(option.value)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    symptom === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Symptom Input (when "Other" is selected) */}
          {symptom === 'other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your symptom
              </label>
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                placeholder="e.g., headache, stomach pain, mood changes"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Severity Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity: <span className={`font-semibold ${getSeverityColor(severity)}`}>
                {severity}/10 ({getSeverityLabel(severity)})
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${severity * 10}%, #E5E7EB ${severity * 10}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Meal Related */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Is this related to a recent meal?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMealRelated(true)}
                className={`p-2 rounded-lg border-2 text-sm ${
                  mealRelated === true
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setMealRelated(false)}
                className={`p-2 rounded-lg border-2 text-sm ${
                  mealRelated === false
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                No
              </button>
              <button
                onClick={() => setMealRelated(null)}
                className={`p-2 rounded-lg border-2 text-sm ${
                  mealRelated === null
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Not Sure
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., After eating high-fat meal, feeling stressed, etc."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!symptom || (symptom === 'other' && !customSymptom.trim()) || loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              !symptom || (symptom === 'other' && !customSymptom.trim()) || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Logging...' : 'Log Symptom'}
          </button>
        </div>
      )}

      {/* Quick Tips */}
      {!showSuccess && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Quick Tips:</strong> Log symptoms regularly to identify patterns. 
            Consider timing, meals, stress, and medication schedule.
          </p>
        </div>
      )}
    </div>
  );
}