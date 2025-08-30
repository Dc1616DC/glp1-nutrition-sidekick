'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../firebase/db';

export default function CalculatorPage() {
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

  // Grab the currently authenticated user (if any)
  const { user } = useAuth();

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

    setResults({
      bmi: bmi.toFixed(1),
      ibw: Math.round(ibw),
      abw: Math.round(abwKg * 2.20462),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      proteinRange: `${Math.round(proteinLow)}–${Math.round(proteinHigh)}g/day`
    });

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
        localStorage.setItem('calculatorComplete', 'true');
      } catch (err) {
        console.error('Failed to save calculator results:', err);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center">GLP-1 Nutrition Calculator</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="number" placeholder="Age" className="p-2 border rounded" required
          value={form.age} onChange={e => handleChange('age', e.target.value)} />
        <input type="number" placeholder="Weight (lbs)" className="p-2 border rounded" required
          value={form.weight} onChange={e => handleChange('weight', e.target.value)} />
        <input type="number" placeholder="Height (feet)" className="p-2 border rounded" required
          value={form.heightFeet} onChange={e => handleChange('heightFeet', e.target.value)} />
        <input type="number" placeholder="Height (inches)" className="p-2 border rounded" required
          value={form.heightInches} onChange={e => handleChange('heightInches', e.target.value)} />
        <select className="p-2 border rounded" value={form.gender}
          onChange={e => handleChange('gender', e.target.value)}>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
        <select className="p-2 border rounded" value={form.activityLevel}
          onChange={e => handleChange('activityLevel', e.target.value)}>
          <option value="sedentary">Sedentary</option>
          <option value="light">Light Activity</option>
          <option value="moderate">Moderate Activity</option>
          <option value="very">Very Active</option>
        </select>
        <select className="p-2 border rounded" value={form.weightLossGoal}
          onChange={e => handleChange('weightLossGoal', e.target.value)}>
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>

        <button type="submit" className="col-span-1 md:col-span-2 bg-blue-600 text-white py-2 rounded">
          Calculate
        </button>
      </form>

      {results && (
        <div className="bg-gray-50 p-4 rounded shadow space-y-3">
          <h2 className="text-lg font-semibold">Your Results</h2>
          <p><strong>BMI:</strong> {results.bmi}</p>
          <p><strong>IBW:</strong> {results.ibw} lbs</p>
          <p><strong>ABW:</strong> {results.abw} lbs</p>
          <p><strong>BMR:</strong> {results.bmr} kcal/day</p>
          <p><strong>TDEE:</strong> {results.tdee} kcal/day</p>
          <p><strong>Target Calories:</strong> {results.targetCalories} kcal/day</p>
          <p><strong>Protein Goal:</strong> {results.proteinRange}</p>
          
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