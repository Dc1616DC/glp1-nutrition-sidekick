'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../firebase/db';

// MealReminders component displays upcoming meal reminders based on user settings
export default function MealReminders() {
  const { user, loading: authLoading } = useAuth();
  const [reminders, setReminders] = useState({});
  const [loading, setLoading] = useState(true);
  const [nextMeal, setNextMeal] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  // Meal display names
  const mealLabels = {
    breakfast: 'Breakfast',
    morningSnack: 'Morning Snack',
    lunch: 'Lunch',
    afternoonSnack: 'Afternoon Snack',
    dinner: 'Dinner'
  };

  // Fetch user's notification settings
  useEffect(() => {
    const fetchReminders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile?.notificationSettings) {
          // Filter out any disabled reminders (empty strings)
          const activeReminders = Object.entries(userProfile.notificationSettings)
            .filter(([_, time]) => time)
            .reduce((acc, [meal, time]) => {
              acc[meal] = time;
              return acc;
            }, {});
          
          setReminders(activeReminders);
        } else {
          setReminders({});
        }
      } catch (error) {
        console.error('Error fetching reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchReminders();
    }
  }, [user, authLoading]);

  // Calculate next meal and update countdown
  useEffect(() => {
    if (Object.keys(reminders).length === 0) return;

    const calculateNextMeal = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;

      // Convert reminder times to minutes since midnight for comparison
      const reminderTimes = Object.entries(reminders).map(([meal, timeStr]) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return {
          meal,
          label: mealLabels[meal],
          time: timeStr,
          minutesSinceMidnight: hours * 60 + minutes
        };
      });

      // Sort reminders by time
      reminderTimes.sort((a, b) => a.minutesSinceMidnight - b.minutesSinceMidnight);

      // Find the next meal (first one that's later than current time)
      let next = reminderTimes.find(r => r.minutesSinceMidnight > currentTimeInMinutes);
      
      // If no next meal today, take the first meal (for tomorrow)
      if (!next && reminderTimes.length > 0) {
        next = reminderTimes[0];
        // Add 24 hours to show it's tomorrow
        next.isTomorrow = true;
      }

      return next;
    };

    const calculateTimeRemaining = (mealInfo) => {
      if (!mealInfo) return '';

      const now = new Date();
      const mealTime = new Date();
      
      const [hours, minutes] = mealInfo.time.split(':').map(Number);
      mealTime.setHours(hours, minutes, 0, 0);
      
      // If the meal is tomorrow, add 24 hours
      if (mealInfo.isTomorrow) {
        mealTime.setDate(mealTime.getDate() + 1);
      }
      
      // Calculate difference in milliseconds
      let diff = mealTime.getTime() - now.getTime();
      if (diff < 0) return '0h 0m';
      
      // Convert to hours and minutes
      const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hoursRemaining}h ${minutesRemaining}m`;
    };

    // Initial calculation
    const nextMealInfo = calculateNextMeal();
    setNextMeal(nextMealInfo);
    if (nextMealInfo) {
      setTimeRemaining(calculateTimeRemaining(nextMealInfo));
    }

    // Update countdown every minute
    const interval = setInterval(() => {
      const updatedNextMeal = calculateNextMeal();
      setNextMeal(updatedNextMeal);
      if (updatedNextMeal) {
        setTimeRemaining(calculateTimeRemaining(updatedNextMeal));
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [reminders]);

  // Sort reminders by time for the full day view
  const getSortedReminders = () => {
    return Object.entries(reminders)
      .map(([meal, timeStr]) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return {
          meal,
          label: mealLabels[meal],
          time: timeStr,
          minutesSinceMidnight: hours * 60 + minutes
        };
      })
      .sort((a, b) => a.minutesSinceMidnight - b.minutesSinceMidnight);
  };

  // Format time from 24h to 12h format
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">Meal Reminders</h2>
        <div className="py-4 text-center text-gray-500">Loading your reminders...</div>
      </div>
    );
  }

  // Not signed in state
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">Meal Reminders</h2>
        <div className="py-4 text-center text-gray-500">
          <p className="mb-2">Sign in to set up meal reminders</p>
          <Link href="/signin" className="text-[#4A90E2] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // No reminders set
  if (Object.keys(reminders).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">Meal Reminders</h2>
        <div className="py-4 text-center text-gray-500">
          <p className="mb-2">No meal reminders set</p>
          <Link href="/reminders" className="text-[#4A90E2] hover:underline">
            Set Up Reminders
          </Link>
        </div>
      </div>
    );
  }

  // Reminders found
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Meal Reminders</h2>
      
      {/* Next meal with countdown */}
      {nextMeal && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700">Next Meal</h3>
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg text-blue-800">
                  {nextMeal.label}
                  {nextMeal.isTomorrow && <span className="text-sm font-normal ml-2">(Tomorrow)</span>}
                </p>
                <p className="text-gray-600">{formatTime(nextMeal.time)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Coming up in</p>
                <p className="font-bold text-blue-800">{timeRemaining}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* All meals for today */}
      <div className="mb-4">
        <h3 className="text-md font-medium text-gray-700 mb-2">Today's Schedule</h3>
        <ul className="space-y-2">
          {getSortedReminders().map((reminder) => (
            <li 
              key={reminder.meal} 
              className={`p-2 rounded-md flex justify-between items-center ${
                nextMeal && nextMeal.meal === reminder.meal ? 'bg-blue-100' : 'bg-gray-50'
              }`}
            >
              <span className="font-medium">{reminder.label}</span>
              <span className="text-gray-600">{formatTime(reminder.time)}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Settings link */}
      <div className="text-right mt-4">
        <Link 
          href="/reminders" 
          className="text-sm text-[#4A90E2] hover:underline flex items-center justify-end"
        >
          <span>Edit Reminders</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
