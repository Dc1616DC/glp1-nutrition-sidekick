'use client';

import { useState } from 'react';
import { mealCommitmentService, MEAL_SLOT_LABELS, DEFAULT_REMINDER_TIMES } from '../services/mealCommitmentService';
import { useAuth } from '../context/AuthContext';

interface MealCommitmentOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export default function MealCommitmentOnboarding({ onComplete, onSkip }: MealCommitmentOnboardingProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'intro' | 'selection' | 'reminders'>('intro');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [reminderTimes, setReminderTimes] = useState<{ [slot: string]: string }>(DEFAULT_REMINDER_TIMES);
  const [enableReminders, setEnableReminders] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSlotToggle = (slot: string) => {
    setSelectedSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  const handleSaveCommitments = async () => {
    if (!user || selectedSlots.length === 0) return;

    setSaving(true);
    try {
      await mealCommitmentService.setUserCommitments(
        user.uid,
        selectedSlots,
        {
          enabled: enableReminders,
          times: reminderTimes
        }
      );
      onComplete();
    } catch (error) {
      console.error('Error saving commitments:', error);
      alert('Failed to save your meal commitments. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  if (step === 'intro') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <span className="text-4xl">🎯</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Would you like to set meal logging goals for better nutrition accountability and support?
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Choose which meals you want to commit to logging. We'll automatically set up reminders for these meals 
            and track your progress to help you stay consistent with your nutrition goals.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">✨ Benefits of Meal Commitments:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Automatic reminders for committed meals (synced across the app)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Build consistency with flexible goals</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>See your progress and celebrate streaks</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>No pressure - change your commitments anytime</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStep('selection')}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Yes, Set My Goals
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    );
  }

  if (step === 'selection') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Which meals would you like to commit to logging?
          </h2>
          <p className="text-gray-600">
            Select the meals and snacks you want to track regularly. You can always change this later.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {Object.entries(MEAL_SLOT_LABELS).map(([slot, label]) => (
            <label
              key={slot}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedSlots.includes(slot)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSlots.includes(slot)}
                onChange={() => handleSlotToggle(slot)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="ml-3 text-lg font-medium text-gray-800">{label}</span>
              <span className="ml-auto text-sm text-gray-500">
                {DEFAULT_REMINDER_TIMES[slot]}
              </span>
            </label>
          ))}
        </div>

        {selectedSlots.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-green-800">
              <strong>Great choice!</strong> You've selected {selectedSlots.length} {selectedSlots.length === 1 ? 'meal' : 'meals'} to track.
              This is a manageable goal that will help build consistency.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setStep('intro')}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
          >
            Back
          </button>
          <button
            onClick={() => selectedSlots.length > 0 && setStep('reminders')}
            disabled={selectedSlots.length === 0}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedSlots.length === 0 ? 'Select at least one meal' : 'Next: Set Reminders'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          When should we remind you?
        </h2>
        <p className="text-gray-600">
          Set reminder times for your committed meals. You can adjust these anytime.
        </p>
      </div>

      <div className="mb-6">
        <label className="flex items-center p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            checked={enableReminders}
            onChange={(e) => setEnableReminders(e.target.checked)}
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className="ml-3 font-medium text-gray-800">Enable meal reminders</span>
        </label>
      </div>

      {enableReminders && (
        <div className="space-y-3 mb-8">
          {selectedSlots.map(slot => (
            <div key={slot} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-800">
                {MEAL_SLOT_LABELS[slot]}
              </span>
              <input
                type="time"
                value={reminderTimes[slot] || DEFAULT_REMINDER_TIMES[slot]}
                onChange={(e) => setReminderTimes(prev => ({
                  ...prev,
                  [slot]: e.target.value
                }))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Set reminders for about 30 minutes after you typically eat. 
          This gives you time to finish your meal and log it while it's fresh in your memory.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep('selection')}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
        >
          Back
        </button>
        <button
          onClick={handleSaveCommitments}
          disabled={saving}
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Complete Setup'}
        </button>
      </div>
    </div>
  );
}