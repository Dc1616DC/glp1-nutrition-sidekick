'use client';

import Link from 'next/link';
import { useUserProfile } from '../hooks/useUserProfile';

export default function NutritionGoalsWidget() {
  const { profile } = useUserProfile();

  // If no calculator data, show prompt to complete calculator
  if (!profile?.calculatorComplete || !profile?.targetCalories) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📊 Your Nutrition Goals
            </h3>
            <p className="text-gray-600 mb-4">
              Calculate your personalized calorie and protein targets based on your body and activity level.
            </p>
            <Link
              href="/calculator"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Calculate My Goals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">🎯</span>
            Your Daily Nutrition Goals
          </h3>
          <Link
            href="/calculator"
            className="text-sm text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
          >
            Update
          </Link>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {/* Target Calories */}
        <div className="px-6 py-4">
          <div className="text-sm text-gray-600 mb-1">Daily Calories</div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {profile.targetCalories?.toLocaleString()}
            </span>
            <span className="ml-1 text-sm text-gray-500">kcal</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            For weight loss
          </div>
        </div>

        {/* Protein Goal */}
        <div className="px-6 py-4">
          <div className="text-sm text-gray-600 mb-1">Protein Target</div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-blue-600">
              {profile.proteinGoal ?
                `${Math.round(profile.proteinGoal.low)}–${Math.round(profile.proteinGoal.high)}`
                : 'N/A'
              }
            </span>
            <span className="ml-1 text-sm text-gray-500">g/day</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Aim for 20g+ per meal
          </div>
        </div>

        {/* TDEE */}
        <div className="px-6 py-4">
          <div className="text-sm text-gray-600 mb-1">Maintenance</div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {profile.tdee?.toLocaleString()}
            </span>
            <span className="ml-1 text-sm text-gray-500">kcal</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            TDEE (no deficit)
          </div>
        </div>
      </div>

      {/* Quick Update Reminder */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            💡 <span className="font-medium">Tip:</span> Update your goals as your weight changes
          </span>
          <Link
            href="/calculator"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Recalculate →
          </Link>
        </div>
      </div>
    </div>
  );
}
