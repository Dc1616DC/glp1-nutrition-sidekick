'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import NutritionOnboarding from '../components/NutritionOnboarding';
import EveningToolkit from '../components/EveningToolkit';
import EveningToolkitFollowUp from '../components/EveningToolkitFollowUp';
import NotificationPrompt from '../components/NotificationPrompt';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import InjectionWidget from '../components/injection-tracker/InjectionWidget';
import DoseDisplay from '../components/injection-tracker/DoseDisplay';
import InjectionSymptomInsights from '../components/injection-tracker/InjectionSymptomInsights';
import { useEffect, useState } from 'react';
import {
  getNotificationPermissionState,
} from '../services/simpleNotificationService';
import { mealLoggingService } from '../services/mealLoggingService';
import { mealCommitmentService } from '../services/mealCommitmentService';
import { subscriptionService } from '../services/subscriptionService';
import { getWeeklyTip } from '../data/weeklyTips';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { profile, getMedicationInfo, isNewUser, isStruggling, hasNauseaConcern } = useUserProfile();
  const [showNutritionOnboarding, setShowNutritionOnboarding] = useState(false);
  const [showEveningToolkit, setShowEveningToolkit] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [todaysStats, setTodaysStats] = useState<any>(null);
  const [commitments, setCommitments] = useState<any>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState<boolean | null>(null);

  // Get current time context for smart actions
  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 18 && currentHour <= 23;
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check notification permissions
    getNotificationPermissionState();
    
    // Handle new user onboarding flow - only redirect if truly needed
    if (user && !loading && profile) {
      const hasSeenOnboarding = localStorage.getItem('nutritionOnboardingSeen');
      const hasCompletedOnboarding = profile?.medication && profile?.calculatorComplete && profile?.educationSeen && profile?.proteinGuideViewed;
      
      console.log('Dashboard logic - Complete:', hasCompletedOnboarding, 'Seen:', !!hasSeenOnboarding);
      
      // ONLY redirect if onboarding is incomplete AND user hasn't seen it before
      if (!hasCompletedOnboarding && !hasSeenOnboarding) {
        console.log('Redirecting to getting-started - truly incomplete onboarding');
        setTimeout(() => {
          router.push('/getting-started');
        }, 1000);
        return;
      }
      
      // If we get here, either onboarding is complete OR user has seen it before
      // Show dashboard normally and handle modals
      if (hasCompletedOnboarding && !hasSeenOnboarding) {
        // Show nutrition modal for completed users who haven't seen it
        setTimeout(() => setShowNutritionOnboarding(true), 1500);
      } else if (hasCompletedOnboarding) {
        // Show notification prompt for fully onboarded users
        const notificationPromptShown = localStorage.getItem('notificationPromptShown');
        if (!notificationPromptShown) {
          setTimeout(() => {
            setShowNotificationPrompt(true);
            localStorage.setItem('notificationPromptShown', 'true');
          }, 3000);
        }
      }
      
      // Load user data
      loadUserData();
    }

    // Check for evening toolkit follow-up
    const followUpData = localStorage.getItem('eveningToolkitFollowUpData');
    if (followUpData && user) {
      try {
        const data = JSON.parse(followUpData);
        const now = Date.now();
        const scheduledTime = data.scheduledFor;
        
        if (!data.completed && now >= scheduledTime && now <= scheduledTime + (2 * 60 * 60 * 1000)) {
          setTimeout(() => setShowFollowUp(true), 2000);
          return;
        }
      } catch (e) {
        console.error('Error parsing follow-up data:', e);
      }
    }

    // Note: Evening Toolkit auto-popup removed - it should only be manually triggered
    // Users can access it through the Explore Features grid when they want it
  }, [user, loading, isEvening]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Check premium access
      const hasAccess = await subscriptionService.hasPremiumAccess(user.uid);
      setHasPremiumAccess(hasAccess);
      
      // Load today's meal log stats
      const stats = await mealLoggingService.getMealLogStats(user.uid);
      setTodaysStats(stats);
      
      // Load meal commitments
      const userCommitments = await mealCommitmentService.getUserCommitments(user.uid);
      setCommitments(userCommitments);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Smart contextual actions based on time and commitments
  const getSmartActions = () => {
    const actions = [];
    
    // Show recipe library for all users
    actions.push({
      href: '/meals',
      icon: '📖',
      title: 'Browse Recipes',
      description: 'Explore our recipe library',
      badge: 'FREE'
    });
    
    // Personalize primary action based on profile concerns
    if (profile && hasNauseaConcern()) {
      actions.push({
        href: '/meal-generator',
        icon: '🍵',
        title: 'Gentle Meal Ideas',
        description: 'Nausea-friendly recipes for you',
        primary: true
      });
    } else if (profile && profile.primaryConcerns.includes('constipation')) {
      actions.push({
        href: '/meal-generator',
        icon: '🥦',
        title: 'High-Fiber Meals',
        description: 'Fiber-rich options to help digestion',
        primary: true
      });
    } else if (profile && profile.primaryConcerns.includes('fatigue')) {
      actions.push({
        href: '/meal-generator',
        icon: '⚡',
        title: 'Energy-Boosting Meals',
        description: 'Iron & protein-rich recipes',
        primary: true
      });
    } else {
      // Default meal generator
      actions.push({
        href: '/meal-generator',
        icon: '🤖',
        title: 'Generate Today\'s Meal',
        description: 'Get AI-powered meal suggestions',
        primary: true
      });
    }

    // Add contextual meal logging if user has commitments
    if (commitments && commitments.committedSlots.length > 0) {
      const nextMealSlot = getNextMealSlot();
      if (nextMealSlot) {
        actions.push({
          href: '/meal-log',
          icon: '📝',
          title: `Log ${nextMealSlot}`,
          description: 'Track your protein & vegetables',
          badge: 'Committed'
        });
      }
    }

    // Add symptom tracking
    actions.push({
      href: '/symptoms',
      icon: '🏥',
      title: 'Track Symptom',
      description: 'Monitor how you\'re feeling',
    });

    return actions;
  };

  const getNextMealSlot = () => {
    if (!commitments) return null;
    
    const mealTimes = {
      'breakfast': 8,
      'mid-morning': 10,
      'lunch': 12,
      'afternoon': 15,
      'dinner': 18,
      'evening': 20
    };
    
    // Find the next committed meal based on current time
    for (const slot of commitments.committedSlots) {
      const mealHour = mealTimes[slot as keyof typeof mealTimes];
      if (currentHour <= mealHour + 1) { // Within 1 hour window
        return slot.charAt(0).toUpperCase() + slot.slice(1);
      }
    }
    
    return commitments.committedSlots[0]?.charAt(0).toUpperCase() + commitments.committedSlots[0]?.slice(1);
  };

  const getGreeting = () => {
    const name = user?.email?.split('@')[0] || 'there';
    if (timeOfDay === 'morning') return `Good morning, ${name}!`;
    if (timeOfDay === 'afternoon') return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  // Show loading or signed out states
  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="text-center py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your GLP-1 Nutrition Companion
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Optimize your nutrition journey with AI-powered meal planning, simple tracking, 
            and expert guidance designed specifically for GLP-1 users.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signin"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/education"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const smartActions = getSmartActions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      {showNutritionOnboarding && (
        <NutritionOnboarding 
          onComplete={() => setShowNutritionOnboarding(false)}
          onSkip={() => setShowNutritionOnboarding(false)}
        />
      )}
      {showEveningToolkit && (
        <EveningToolkit onSkip={() => {
          setShowEveningToolkit(false);
          // Store "maybe later" preference to prevent auto-popup for a while
          localStorage.setItem('eveningToolkitMaybeLater', Date.now().toString());
        }} />
      )}
      {showFollowUp && (
        <EveningToolkitFollowUp onClose={() => setShowFollowUp(false)} />
      )}
      {showNotificationPrompt && (
        <NotificationPrompt onComplete={() => setShowNotificationPrompt(false)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}
          </h1>
          <p className="text-gray-600">
            Ready to optimize your nutrition today?
          </p>
        </div>

        {/* Personalized Welcome Based on Profile */}
        {profile && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start">
                <div className="text-2xl mr-4">
                  {isNewUser() ? '🌟' : isStruggling() ? '🤝' : '🎯'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {getMedicationInfo()?.name} Companion Mode Active
                  </h3>
                  <div className="text-gray-700 space-y-2">
                    {isNewUser() && (
                      <p>Welcome to your {getMedicationInfo()?.name} journey! We'll help you navigate the first few weeks with confidence.</p>
                    )}
                    {isStruggling() && (
                      <p>We're here to help you succeed with {getMedicationInfo()?.name}. Let's work together to minimize those side effects.</p>
                    )}
                    {profile.experience === 'experienced' && (
                      <p>Great to see you're doing well with {getMedicationInfo()?.name}! Let's optimize your results even further.</p>
                    )}
                    
                    {/* Show personalized tips based on concerns */}
                    {hasNauseaConcern() && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
                        <span className="text-sm font-medium text-blue-800">💡 Nausea Tip:</span>
                        <span className="text-sm text-gray-700 ml-2">Try ginger tea or room-temperature meals today. Your meal suggestions will prioritize gentle options.</span>
                      </div>
                    )}
                    
                    {/* Medication-specific reminder */}
                    {getMedicationInfo()?.frequency === 'weekly' && (
                      <div className="text-sm text-gray-600 mt-2">
                        📅 Remember: {getMedicationInfo()?.name} is taken {getMedicationInfo()?.frequency}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {smartActions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className={`group relative rounded-xl transition-all duration-200 ${
                  action.primary
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white hover:shadow-md border border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-2xl ${action.primary ? 'animate-pulse' : ''}`}>
                      {action.icon}
                    </div>
                    {action.badge && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <h3 className={`font-semibold mb-1 ${
                    action.primary ? 'text-white' : 'text-gray-900'
                  }`}>
                    {action.title}
                  </h3>
                  <p className={`text-sm ${
                    action.primary ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Injection Tracker Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">GLP-1 Injection Tracker</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <InjectionWidget />
            <DoseDisplay />
          </div>
          <InjectionSymptomInsights />
        </div>

        {/* Weekly Tip/Intention */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="text-2xl mr-4">💡</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                  This Week&apos;s Intention
                </h3>
                <div className="text-emerald-700 leading-relaxed">
                  {getWeeklyTip()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hub Navigation */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Explore Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Link
              href="/meals-hub"
              className="bg-white rounded-lg p-6 hover:shadow-md transition-all border border-gray-200 group"
            >
              <div className="text-3xl mb-3">🍽️</div>
              <h3 className="font-semibold text-gray-900 mb-1">Meals</h3>
              <p className="text-sm text-gray-600">Plan & prepare</p>
            </Link>
            
            <Link
              href="/track-hub"
              className="bg-white rounded-lg p-6 hover:shadow-md transition-all border border-gray-200 group"
            >
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-semibold text-gray-900 mb-1">Track</h3>
              <p className="text-sm text-gray-600">Log progress</p>
            </Link>
            
            <Link
              href="/calculator"
              className="bg-white rounded-lg p-6 hover:shadow-md transition-all border border-gray-200 group"
            >
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-1">Learn</h3>
              <p className="text-sm text-gray-600">Goals & education</p>
            </Link>
            
            <Link
              href="/settings"
              className="bg-white rounded-lg p-6 hover:shadow-md transition-all border border-gray-200 group"
            >
              <div className="text-3xl mb-3">🌙</div>
              <h3 className="font-semibold text-gray-900 mb-1">Evening Toolkit</h3>
              <p className="text-sm text-gray-600">Manage cravings & patterns</p>
            </Link>
          </div>
        </div>

        {/* Next Meal Reminder */}
        {commitments && commitments.committedSlots.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Meal Reminder</h2>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {getNextMealSlot()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your next committed meal
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600">
                    {commitments.reminderSettings && commitments.reminderSettings.times && getNextMealSlot() 
                      ? commitments.reminderSettings.times[getNextMealSlot().toLowerCase()] || 'Time not set'
                      : 'Time not set'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Reminder time
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}