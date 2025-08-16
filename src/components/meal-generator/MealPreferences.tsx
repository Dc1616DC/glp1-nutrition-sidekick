'use client';

import { useState } from 'react';
import AllergiesFilter from '../AllergiesFilter';
import { MealPreferences as MealPreferencesType } from '../../types/meal';

interface MealPreferencesProps {
  preferences: MealPreferencesType;
  setPreferences: (preferences: MealPreferencesType) => void;
  onGenerate: () => void;
  onClearHistory: () => void;
  isGenerating: boolean;
}

const dietaryOptions = [
  'vegetarian', 'vegan', 'pescatarian', 'gluten-free', 'dairy-free',
  'ketogenic', 'paleo', 'low-carb', 'mediterranean', 'whole30'
];

export default function MealPreferences({ 
  preferences, 
  setPreferences, 
  onGenerate, 
  onClearHistory,
  isGenerating 
}: MealPreferencesProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updatePreferences = <K extends keyof MealPreferencesType>(key: K, value: MealPreferencesType[K]) => {
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const newRestrictions = preferences.dietaryRestrictions.includes(restriction)
      ? preferences.dietaryRestrictions.filter(r => r !== restriction)
      : [...preferences.dietaryRestrictions, restriction];
    updatePreferences('dietaryRestrictions', newRestrictions);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Meal Preferences
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Meal Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meal Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
              <button
                key={type}
                onClick={() => updatePreferences('mealType', type)}
                className={`p-2 rounded border text-sm font-medium capitalize ${
                  preferences.mealType === type
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Cooking Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Cooking Time
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 15, label: '15 min' },
              { value: 30, label: '30 min' },
              { value: 45, label: '45 min' },
              { value: 60, label: '1 hour' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updatePreferences('maxCookingTime', value)}
                className={`p-2 rounded border text-sm font-medium ${
                  preferences.maxCookingTime === value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cooking Method */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cooking Method
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'any', label: 'Any Method' },
              { value: 'no-cook', label: 'No Cooking' },
              { value: 'stovetop-only', label: 'Stovetop Only' },
              { value: 'oven-only', label: 'Oven Only' },
              { value: 'one-pot', label: 'One Pot' },
              { value: 'advanced', label: 'Advanced' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updatePreferences('cookingMethod', value)}
                className={`px-3 py-2 rounded border text-sm font-medium ${
                  preferences.cookingMethod === value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((diet) => (
              <button
                key={diet}
                onClick={() => toggleDietaryRestriction(diet)}
                className={`px-3 py-2 rounded border text-sm font-medium capitalize ${
                  preferences.dietaryRestrictions.includes(diet)
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {diet}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="md:col-span-2">
          <AllergiesFilter
            selectedAllergies={preferences.allergies}
            onAllergiesChange={(allergies) => updatePreferences('allergies', allergies)}
          />
        </div>

        {/* Advanced Options */}
        <div className="md:col-span-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Advanced Options
            <svg
              className={`w-4 h-4 transform transition-transform ${
                showAdvanced ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Creativity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creativity Level
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'simple', label: 'Simple' },
                    { value: 'flavorful-twists', label: 'Flavorful Twists' },
                    { value: 'chef-inspired', label: 'Chef Inspired' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updatePreferences('creativityLevel', value)}
                      className={`px-3 py-2 rounded border text-sm font-medium ${
                        preferences.creativityLevel === value
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assembly Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Assembly vs Recipe Ratio
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Quick</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.assemblyToRecipeRatio || 60}
                    onChange={(e) => updatePreferences('assemblyToRecipeRatio', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">Recipe</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {preferences.assemblyToRecipeRatio || 60}% quick assembly, {100 - (preferences.assemblyToRecipeRatio || 60)}% structured recipes
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-6 flex gap-4 items-center">
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              🍽️ Generate Meals
            </>
          )}
        </button>

        <button 
          onClick={onClearHistory}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          Clear History
        </button>
      </div>
    </div>
  );
}