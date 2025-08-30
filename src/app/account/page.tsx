'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, UserProfile } from '../../firebase/db';

// For a novice developer: This is the user's account page. It's a "client component"
// (indicated by 'use client') because it needs to interact with the user and manage its own state.

export default function AccountPage() {
  // --- Hooks and State Management ---

  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state from our global context
  const router = useRouter(); // Hook to programmatically navigate between pages

  const [profile, setProfile] = useState<UserProfile | null>(null); // State to hold the user's profile data from Firestore
  const [loading, setLoading] = useState(true); // Loading state for fetching profile data
  const [error, setError] = useState<string | null>(null); // State for holding any error messages

  // State for the editable form fields
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    breakfast: '07:00',
    morningSnack: '10:00',
    lunch: '13:00',
    afternoonSnack: '16:00',
    dinner: '19:00',
  });
  const [isSaving, setIsSaving] = useState(false); // State to show a saving indicator on buttons

  // --- Authentication and Data Fetching Effects ---

  // Effect to protect the route and fetch data
  useEffect(() => {
    // 1. Check if the authentication status is still loading
    if (authLoading) {
      return; // If it is, do nothing and wait for it to finish
    }

    // 2. If auth is done and there's no user, redirect to sign-in
    if (!user) {
      router.push('/signin');
      return;
    }

    // 3. If user is new (hasn't completed onboarding), redirect to getting-started
    const hasCompletedCalculator = localStorage.getItem('calculatorComplete');
    if (!hasCompletedCalculator) {
      router.push('/getting-started');
      return;
    }

    // 4. If there IS a user who has completed onboarding, fetch their profile data from Firestore
    const fetchProfile = async () => {
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
          // Initialize form state with data from the database
          setDietaryRestrictions(userProfile.dietaryRestrictions || []);
          if (userProfile.notificationSettings) {
            setNotificationSettings(userProfile.notificationSettings);
          }
        } else {
          setError("Could not find user profile.");
        }
      } catch (err) {
        setError("Failed to fetch profile data.");
        console.error(err);
      } finally {
        setLoading(false); // Stop the loading indicator
      }
    };

    fetchProfile();
  }, [user, authLoading, router]); // This effect re-runs whenever user, authLoading, or router changes

  // --- Event Handlers ---

  const handleDietaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setDietaryRestrictions(prev =>
      checked ? [...prev, value] : prev.filter(item => item !== value)
    );
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!user) return; // Safety check

    setIsSaving(true);
    setError(null);

    const dataToUpdate: Partial<UserProfile> = {
      dietaryRestrictions,
      notificationSettings,
    };

    try {
      await updateUserProfile(user.uid, dataToUpdate);
      // Optionally, show a success message to the user
      alert('Your profile has been updated!');
    } catch (err) {
      setError('Failed to save changes. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Render Logic ---

  if (loading || authLoading) {
    return <div className="text-center p-10">Loading account information...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="text-center p-10">No profile data found.</div>;
  }

  const availableRestrictions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome, {profile.email}!
      </h1>

      {/* Calculator Results Section */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-[#4A90E2]">Your Nutrition Targets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-gray-600">Target Calories</p>
            <p className="text-2xl font-bold">{profile.targetCalories || 'N/A'}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-md">
            <p className="text-sm text-gray-600">Protein Goal</p>
            <p className="text-2xl font-bold">
              {profile.proteinGoal ? `${profile.proteinGoal.low}–${profile.proteinGoal.high}g` : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600">TDEE</p>
            <p className="text-2xl font-bold">{profile.tdee || 'N/A'}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">These values are based on your latest calculator submission.</p>
      </div>

      {/* Dietary Preferences Section */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-[#7ED321]">Dietary Preferences</h2>
        <div className="space-y-2">
          {availableRestrictions.map(restriction => (
            <label key={restriction} className="flex items-center space-x-3">
              <input
                type="checkbox"
                value={restriction}
                checked={dietaryRestrictions.includes(restriction)}
                onChange={handleDietaryChange}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">{restriction}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Meal Reminder Notifications Section */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-[#50E3C2]">Meal Reminders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {Object.entries(notificationSettings).map(([meal, time]) => (
            <div key={meal}>
              <label htmlFor={meal} className="block text-sm font-medium text-gray-700 capitalize">
                {meal.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="time"
                id={meal}
                name={meal}
                value={time}
                onChange={handleNotificationChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="w-full md:w-auto px-6 py-3 font-semibold text-white bg-[#4A90E2] rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
