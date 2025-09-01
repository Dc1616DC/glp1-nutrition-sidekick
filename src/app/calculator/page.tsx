'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../firebase/db';
import { useUserProfile } from '../../hooks/useUserProfile';

export default function CalculatorPage() {
  const { user } = useAuth();
  const { profile, updateOnboardingProgress } = useUserProfile();
  const [form, setForm] = useState({
    age: '',
    weight: '',
    heightFeet: '',
    heightInches: '',
    gender: 'female',
    activityLevel: 'light',
    weightLossGoal: 'moderate'
  });

  const [results, setResults] = useState<any | null>(null);
  const [showCalorieWarning, setShowCalorieWarning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load saved calculator data on mount - only if user has completed calculator before
  useEffect(() => {
    if (user && profile?.calculatorComplete) {
      const savedCalculatorData = localStorage.getItem('calculatorData');
      const savedResults = localStorage.getItem('calculatorResults');
      
      if (savedCalculatorData) {
        setForm(JSON.parse(savedCalculatorData));
      }
      
      if (savedResults) {
        setResults(JSON.parse(savedResults));
      }
    } else {
      // Clear any old localStorage data for new users
      localStorage.removeItem('calculatorData');
      localStorage.removeItem('calculatorResults');
    }
  }, [user, profile]);


  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const age = parseInt(form.age);
    const weightLbs = parseFloat(form.weight);
    const heightInches = parseInt(form.heightFeet) * 12 + parseInt(form.heightInches);
    const heightCm = heightInches * 2.54;
    const weightKg = weightLbs * 0.453592;

    const bmi = weightKg / Math.pow(heightCm / 100, 2);
    const ibw = form.gender === 'female'
      ? 100 + (heightInches - 60) * 5
      : 106 + (heightInches - 60) * 6;
    const ibwKg = ibw * 0.453592;

    const adjustmentFactor =
      bmi > 40 ? 0.25 :
      bmi > 35 ? 0.30 :
      bmi > 30 ? 0.35 :
      0.40;

    const abwKg = ibwKg + adjustmentFactor * (weightKg - ibwKg);

    const bmr = form.gender === 'female'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
      : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

    const activityMultiplier = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725
    }[form.activityLevel as keyof typeof activityMultiplier];

    const tdee = bmr * activityMultiplier;

    const calorieDeficit = {
      conservative: 250,
      moderate: 500,
      aggressive: 750
    }[form.weightLossGoal as keyof typeof calorieDeficit];

    const targetCalories = tdee - calorieDeficit;
    const proteinLow = abwKg * 1.2;
    const proteinHigh = abwKg * 1.6;

    // Check for minimum calorie warnings
    const minCalories = form.gender === 'female' ? 1200 : 1500;
    const needsWarning = targetCalories < minCalories;
    setShowCalorieWarning(needsWarning);

    const resultsData = {
      bmi: bmi.toFixed(1),
      ibw: Math.round(ibw),
      abw: Math.round(abwKg * 2.20462),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      proteinRange: `${Math.round(proteinLow)}–${Math.round(proteinHigh)}g/day`
    };

    setResults(resultsData);

    // Save form data and results to localStorage
    localStorage.setItem('calculatorData', JSON.stringify(form));
    localStorage.setItem('calculatorResults', JSON.stringify(resultsData));

    // If the user is logged in, save these results to their profile
    if (user) {
      try {
        await updateUserProfile(user.uid, {
          tdee: Math.round(tdee),
          targetCalories: Math.round(targetCalories),
          proteinGoal: {
            low: Math.round(proteinLow),
            high: Math.round(proteinHigh)
          }
        });
        
        // Mark calculator as completed for onboarding flow
        await updateOnboardingProgress({ calculatorComplete: true });
      } catch (err) {
        console.error('Failed to save calculator results:', err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">GLP-1 Nutrition Calculator</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Calculate your personalized calorie and protein targets optimized for GLP-1 medication success
        </p>
        {results && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            ✏️ Edit Your Information
          </button>
        )}
      </div>

      {(!results || isEditing) && (
        <form onSubmit={(e) => {
          handleSubmit(e);
          setIsEditing(false);
        }} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input 
                type="number" 
                placeholder="Age in years" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
                value={form.age} 
                onChange={e => handleChange('age', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Weight</label>
              <input 
                type="number" 
                placeholder="Weight in pounds" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
                value={form.weight} 
                onChange={e => handleChange('weight', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (Feet)</label>
              <input 
                type="number" 
                placeholder="Feet" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
                value={form.heightFeet} 
                onChange={e => handleChange('heightFeet', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (Inches)</label>
              <input 
                type="number" 
                placeholder="Additional inches" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
                value={form.heightInches} 
                onChange={e => handleChange('heightInches', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biological Sex</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={form.gender}
                onChange={e => handleChange('gender', e.target.value)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Level */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Physical Activity Level</h2>
          <p className="text-sm text-gray-600 mb-4">
            Choose the option that best describes your typical weekly activity level:
          </p>
          <div className="space-y-3">
            <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="activityLevel"
                value="sedentary"
                checked={form.activityLevel === 'sedentary'}
                onChange={e => handleChange('activityLevel', e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Sedentary</div>
                <div className="text-sm text-gray-600">Little to no exercise, desk job, mostly sitting/lying down</div>
              </div>
            </label>
            <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="activityLevel"
                value="light"
                checked={form.activityLevel === 'light'}
                onChange={e => handleChange('activityLevel', e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Light Activity</div>
                <div className="text-sm text-gray-600">Light exercise 1-3 days/week, some walking, light household activities</div>
              </div>
            </label>
            <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="activityLevel"
                value="moderate"
                checked={form.activityLevel === 'moderate'}
                onChange={e => handleChange('activityLevel', e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Moderate Activity</div>
                <div className="text-sm text-gray-600">Exercise 3-5 days/week, regular walking, moderate gym workouts</div>
              </div>
            </label>
            <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="activityLevel"
                value="very"
                checked={form.activityLevel === 'very'}
                onChange={e => handleChange('activityLevel', e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Very Active</div>
                <div className="text-sm text-gray-600">Hard exercise 6-7 days/week, intensive workouts, physical job</div>
              </div>
            </label>
          </div>
        </div>

        {/* Weight Loss Goal */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Weight Loss Goal</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select your preferred rate of weight loss:
          </p>
          <div className="space-y-3">
            <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="weightLossGoal"
                value="conservative"
                checked={form.weightLossGoal === 'conservative'}
                onChange={e => handleChange('weightLossGoal', e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Conservative</div>
                <div className="text-sm text-gray-600">~0.5 lbs/week - Easier to maintain, less hunger, sustainable approach</div>
              </div>
            </label>
            <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="weightLossGoal"
                value="moderate"
                checked={form.weightLossGoal === 'moderate'}
                onChange={e => handleChange('weightLossGoal', e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Moderate (Recommended)</div>
                <div className="text-sm text-gray-600">~1 lb/week - Good balance of results and sustainability</div>
              </div>
            </label>
            <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="weightLossGoal"
                value="aggressive"
                checked={form.weightLossGoal === 'aggressive'}
                onChange={e => handleChange('weightLossGoal', e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Aggressive</div>
                <div className="text-sm text-gray-600">~1.5 lbs/week - Faster results, requires medical supervision</div>
              </div>
            </label>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> GLP-1 medications naturally reduce appetite. Starting with conservative or moderate goals allows your body to adjust while maintaining adequate nutrition.
            </p>
          </div>
        </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            {isEditing ? 'Recalculate My Nutrition Targets' : 'Calculate My Nutrition Targets'}
          </button>
        </form>
      )}

      {results && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Personalized Nutrition Targets</h2>
            <p className="text-gray-600">Optimized for your GLP-1 medication journey</p>
          </div>

          {/* Safety Warning */}
          {showCalorieWarning && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Important Safety Notice</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Your calculated target ({results.targetCalories} calories) is below the recommended minimum of {form.gender === 'female' ? '1200' : '1500'} calories for {form.gender === 'female' ? 'women' : 'men'}. 
                    Please consult your healthcare provider before following a plan below these levels to ensure you're getting adequate nutrition.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Targets */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Daily Targets</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-900">Target Calories</span>
                  <span className="text-xl font-bold text-blue-600">{results.targetCalories}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-900">Protein Goal</span>
                  <span className="text-xl font-bold text-green-600">{results.proteinRange}</span>
                </div>
              </div>
            </div>

            {/* Metabolic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Your Metabolism</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">BMI:</span>
                  <span className="font-medium">{results.bmi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">BMR (Resting):</span>
                  <span className="font-medium">{results.bmr} kcal/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TDEE (Total):</span>
                  <span className="font-medium">{results.tdee} kcal/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ideal Weight:</span>
                  <span className="font-medium">{results.ibw} lbs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Adjusted Weight:</span>
                  <span className="font-medium">{results.abw} lbs</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="mt-6 space-y-4">
            {user ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/getting-started"
                  className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Next: Learn GLP-1 Nutrition Basics →
                </Link>
                <Link
                  href="/"
                  className="flex-1 border border-gray-300 text-gray-700 text-center py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Want to save your results and continue your GLP-1 journey?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/signup"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Sign Up to Continue
                  </Link>
                  <Link
                    href="/signin"
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
            
            {/* Nutrition tips highlight */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Ready to put these numbers to work?</strong> Check out our{' '}
                <Link href="/education" className="underline hover:text-blue-900 font-medium">
                  GLP-1 Nutrition Education
                </Link>{' '}
                to make the most of your journey and hit your protein goals with confidence.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}