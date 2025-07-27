'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import MealReminders from '../components/MealReminders';
import NutritionOnboarding from '../components/NutritionOnboarding';
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
    </div>
  );
}
