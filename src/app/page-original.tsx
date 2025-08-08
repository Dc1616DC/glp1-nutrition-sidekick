'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import MealReminders from '../components/MealReminders';
import NutritionOnboarding from '../components/NutritionOnboarding';
import EveningToolkit from '../components/EveningToolkit';
import EveningToolkitFollowUp from '../components/EveningToolkitFollowUp';
import { useEffect, useState } from 'react';
import {
  getNotificationPermissionState,
} from '../services/simpleNotificationService';

// For a novice developer: This is the homepage of your application.
// It's a "client component" because its content changes based on whether a user is logged in.

export default function Home() {
  // We use our custom `useAuth` hook to get the current user and loading state.
  const { user, loading } = useAuth();
  const [showNutritionOnboarding, setShowNutritionOnboarding] = useState(false);
  const [showEveningToolkit, setShowEveningToolkit] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);

  // Local notification permission check (no service worker registration)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    getNotificationPermissionState();
    
    // Show nutrition onboarding for new authenticated users
    if (user && !loading) {
      const hasSeenOnboarding = localStorage.getItem('nutritionOnboardingSeen');
      if (!hasSeenOnboarding) {
        // Show onboarding after a brief delay for better UX
        setTimeout(() => setShowNutritionOnboarding(true), 1500);
      }
    }

    // Check for pending follow-up (highest priority)
    const followUpData = localStorage.getItem('eveningToolkitFollowUpData');
    if (followUpData && user) {
      try {
        const data = JSON.parse(followUpData);
        const now = Date.now();
        const scheduledTime = data.scheduledFor;
        
        // Show follow-up if it's time and not completed
        if (!data.completed && now >= scheduledTime && now <= scheduledTime + (2 * 60 * 60 * 1000)) { // Within 2 hours of scheduled time
          setTimeout(() => setShowFollowUp(true), 2000);
          return; // Don't show other modals if follow-up is pending
        }
      } catch (e) {
        console.error('Error parsing follow-up data:', e);
      }
    }

    // Check if Evening Toolkit should be shown (evening hours 6 PM - 11 PM)
    const currentHour = new Date().getHours();
    const isEveningTime = currentHour >= 18 && currentHour <= 23;
    const eveningToolkitEnabled = localStorage.getItem('eveningToolkitEnabled') === 'true';
    
    if (isEveningTime && eveningToolkitEnabled && user) {
      // Optional: Check if user has already seen toolkit today
      const lastShown = localStorage.getItem('eveningToolkitLastShown');
      const today = new Date().toDateString();
      if (lastShown !== today) {
        setTimeout(() => setShowEveningToolkit(true), 3000); // Show after nutrition onboarding
      }
    }
  }, [user, loading]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const features = [
    {
      title: 'Personalized Nutrition Calculator',
      description:
        'Calculate your unique TDEE, calorie, and protein targets, specifically adjusted for GLP-1 medication users to support muscle health.',
      color: 'bg-blue-100',
      textColor: 'text-blue-800',
    },
    {
      title: 'AI-Powered Meal Planner',
      description:
        'Get delicious, high-protein, high-fiber meal ideas tailored to your preferences, available ingredients, and prep time.',
      color: 'bg-green-100',
      textColor: 'text-green-800',
    },
    {
      title: 'Essential Nutrition Guide',
      description:
        "Master the fundamentals with 10 key nutrition insights specifically designed for GLP-1 users - from protein targets to managing low appetite days.",
      color: 'bg-teal-100',
      textColor: 'text-teal-800',
    },
  ];

  return (
    <div className="text-center">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
          Your Personal GLP-1 Nutrition Companion
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
          Simplify your nutrition journey on GLP-1 medication with AI-powered
          meal planning, personalized targets, and expert guidance.
        </p>
      </section>

      {/* Meal Reminders for authenticated users */}
      {!loading && user && (
        <section className="my-8 px-4">
          <MealReminders />
        </section>
      )}

      {/* Quick Symptom Log Widget for authenticated users */}
      {!loading && user && (
        <section className="my-4 px-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">How are you feeling?</h3>
                <p className="text-sm text-gray-600 mt-1">Track symptoms for personalized tips</p>
              </div>
              <Link
                href="/symptoms"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <span>Quick Log</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-12 bg-gray-50 -mx-4 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Everything You Need to Succeed
        </h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`p-8 rounded-lg shadow-md ${feature.color}`}
            >
              <h3 className={`text-2xl font-semibold mb-3 ${feature.textColor}`}>
                {feature.title}
              </h3>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action (CTA) Section */}
      <section className="py-16 md:py-20">
        <h2 className="text-3xl font-bold text-gray-800">
          Ready to Take Control?
        </h2>
        <div className="mt-8">
          {/* We wait for the auth state to load before showing a button */}
          {!loading && (
            <>
              {user ? (
                // If the user is logged in, show a link to their account
                <Link
                  href="/account"
                  className="inline-block px-8 py-4 text-lg font-semibold text-white bg-[#4A90E2] rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105"
                >
                  Go to Your Dashboard
                </Link>
              ) : (
                // If the user is not logged in, prompt them to sign up
                <Link
                  href="/signup"
                  className="inline-block px-8 py-4 text-lg font-semibold text-white bg-[#7ED321] rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105"
                >
                  Get Started for Free
                </Link>
              )}
            </>
          )}
        </div>
      </section>

      {/* Nutrition Onboarding Modal */}
      {showNutritionOnboarding && (
        <NutritionOnboarding
          onComplete={() => setShowNutritionOnboarding(false)}
          onSkip={() => setShowNutritionOnboarding(false)}
          isNewUser={true}
        />
      )}

      {/* Evening Toolkit Modal */}
      {showEveningToolkit && (
        <EveningToolkit
          onComplete={() => {
            setShowEveningToolkit(false);
            localStorage.setItem('eveningToolkitLastShown', new Date().toDateString());
          }}
          onSkip={() => {
            setShowEveningToolkit(false);
            localStorage.setItem('eveningToolkitLastShown', new Date().toDateString());
          }}
        />
      )}

      {/* Evening Toolkit Follow-up Modal */}
      {showFollowUp && (
        <EveningToolkitFollowUp
          onComplete={() => {
            setShowFollowUp(false);
            // Clean up follow-up data
            localStorage.removeItem('eveningToolkitFollowUpScheduled');
          }}
          onSkip={() => {
            setShowFollowUp(false);
            // Mark as completed to prevent showing again
            const followUpData = localStorage.getItem('eveningToolkitFollowUpData');
            if (followUpData) {
              try {
                const data = JSON.parse(followUpData);
                localStorage.setItem('eveningToolkitFollowUpData', JSON.stringify({
                  ...data,
                  completed: true
                }));
              } catch (e) {
                console.error('Error updating follow-up data:', e);
              }
            }
          }}
        />
      )}
    </div>
  );
}
