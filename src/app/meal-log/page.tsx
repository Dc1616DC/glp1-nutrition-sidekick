'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { mealLoggingService, DailyMealLog, MealLogEntry, MealLogStats } from '../../services/mealLoggingService';
import { mealCommitmentService, MealCommitment, CommitmentStats, MEAL_SLOT_LABELS } from '../../services/mealCommitmentService';
import MealCommitmentOnboarding from '../../components/MealCommitmentOnboarding';
import EnhancedNutritionDashboard from '../../components/EnhancedNutritionDashboard';
import GentleNutritionNudge from '../../components/GentleNutritionNudge';
import { useRouter } from 'next/navigation';

const MEAL_SLOTS = [
  { key: 'breakfast', label: '🌅 Breakfast', defaultTime: '07:30' },
  { key: 'mid-morning', label: '🍽️ Mid-Morning', defaultTime: '10:00' },
  { key: 'lunch', label: '🥪 Lunch', defaultTime: '12:30' },
  { key: 'afternoon', label: '🥨 Afternoon', defaultTime: '15:00' },
  { key: 'dinner', label: '🍽️ Dinner', defaultTime: '18:30' },
  { key: 'evening', label: '🌙 Evening', defaultTime: '20:30' }
] as const;

export default function MealLogPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dailyLog, setDailyLog] = useState<DailyMealLog | null>(null);
  const [stats, setStats] = useState<MealLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPremiumAccess, setHasPremiumAccess] = useState<boolean | null>(null);
  const [showStatsView, setShowStatsView] = useState(false);
  const [commitment, setCommitment] = useState<MealCommitment | null>(null);
  const [commitmentStats, setCommitmentStats] = useState<CommitmentStats | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/signin?redirect=meal-log');
      return;
    }

    checkPremiumAccessAndLoadData();
  }, [user, authLoading, router]);

  const checkPremiumAccessAndLoadData = async () => {
    if (!user) return;
    
    try {
      const hasAccess = await subscriptionService.hasPremiumAccess(user.uid);
      setHasPremiumAccess(hasAccess);
      
      if (hasAccess) {
        // Check if user needs onboarding
        const shouldShowOnboarding = await mealCommitmentService.shouldShowCommitmentOnboarding(user.uid);
        setShowOnboarding(shouldShowOnboarding);
        
        await Promise.all([
          loadTodaysLog(),
          loadStats(),
          loadCommitments()
        ]);
      }
    } catch (error) {
      console.error('Error checking premium access:', error);
      setHasPremiumAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const loadTodaysLog = async () => {
    if (!user) return;
    
    try {
      const log = await mealLoggingService.getTodaysMealLog(user.uid);
      setDailyLog(log);
    } catch (error) {
      console.error('Error loading meal log:', error);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const mealStats = await mealLoggingService.getMealLogStats(user.uid);
      setStats(mealStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadCommitments = async () => {
    if (!user) return;
    
    try {
      const userCommitment = await mealCommitmentService.getUserCommitments(user.uid);
      setCommitment(userCommitment);
      
      if (userCommitment && userCommitment.committedSlots.length > 0) {
        // Get commitment stats using meal history
        const history = await mealLoggingService.getMealLogHistory(user.uid, 30);
        const stats = await mealCommitmentService.calculateCommitmentStats(user.uid, history);
        setCommitmentStats(stats);
      }
    } catch (error) {
      console.error('Error loading commitments:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    await loadCommitments();
    await loadStats();
  };

  const logMeal = async (mealSlot: MealLogEntry['mealSlot'], data: {
    timeEaten?: string;
    hadProtein: boolean;
    hadVegetables: boolean;
    mealName?: string;
  }) => {
    if (!user) return;
    
    try {
      const updatedLog = await mealLoggingService.logMeal(user.uid, {
        mealSlot,
        ...data
      });
      setDailyLog(updatedLog);
      await Promise.all([
        loadStats(), // Refresh stats
        loadCommitments() // Refresh commitment stats
      ]);
    } catch (error) {
      console.error('Error logging meal:', error);
      alert('Failed to log meal');
    }
  };

  const clearMeal = async (mealSlot: MealLogEntry['mealSlot']) => {
    if (!user || !confirm('Clear this meal entry?')) return;
    
    try {
      const updatedLog = await mealLoggingService.clearMealEntry(user.uid, mealSlot);
      setDailyLog(updatedLog);
      await loadStats();
    } catch (error) {
      console.error('Error clearing meal:', error);
      alert('Failed to clear meal');
    }
  };

  const getMealEntry = (mealSlot: string): MealLogEntry | undefined => {
    return dailyLog?.meals.find(meal => meal.mealSlot === mealSlot);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your meal log...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Premium Access Gate
  if (hasPremiumAccess === false) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">📝 Meal Logger</h1>
          <p className="mt-2 text-lg text-gray-600">Simple tracking for protein and vegetable intake</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-white text-center">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
          <p className="text-green-100 mb-6">
            Perfect for GLP-1 users: Simple meal logging focused on protein and vegetable intake rather than detailed calorie counting.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📝 Simple Logging:</h3>
              <ul className="text-sm space-y-1">
                <li>• Quick checkboxes for protein & veggies</li>
                <li>• 6 meal/snack slots per day</li>
                <li>• Time tracking when you ate</li>
                <li>• Optional meal names & notes</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📊 Smart Analytics:</h3>
              <ul className="text-sm space-y-1">
                <li>• Protein intake consistency</li>
                <li>• Vegetable consumption patterns</li>
                <li>• Daily logging streaks</li>
                <li>• Weekly nutrition trends</li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/analytics')}
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Upgrade to Premium - $9.99/mo
          </button>
          <p className="text-xs text-green-200 mt-2">7-day free trial • Cancel anytime</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <MealCommitmentOnboarding 
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingComplete}
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Meal Logger</h1>
            <p className="text-gray-600">Track your protein & vegetable intake throughout the day</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowOnboarding(true)}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-green-200 text-green-700 hover:bg-green-300"
            >
              🎯 Set Goals
            </button>
            <button
              onClick={() => setShowStatsView(!showStatsView)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showStatsView 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showStatsView ? '📝 Daily View' : '📊 Stats View'}
            </button>
          </div>
        </div>

        {showStatsView ? (
          // Enhanced Stats View
          <div className="space-y-6">
            {/* Gentle Nutrition Nudge */}
            <GentleNutritionNudge stats={stats} context="meal-log" />
            
            {/* Commitment Stats Section */}
            {commitment && commitmentStats && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-semibold text-green-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">🎯</span>
                  Your Meal Commitments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{Math.round(commitmentStats.commitmentRate)}%</div>
                    <div className="text-sm text-green-600">Commitment Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700">{commitmentStats.currentStreak}</div>
                    <div className="text-sm text-blue-600">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">{commitment.committedSlots.length}</div>
                    <div className="text-sm text-purple-600">Committed Meals</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {commitment.committedSlots.map(slot => (
                    <span key={slot} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {MEAL_SLOT_LABELS[slot]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Nutrition Dashboard */}
            <EnhancedNutritionDashboard stats={stats} loading={loading} />
          </div>
        ) : (
          // Daily Logging View
          <div className="space-y-6">
            {/* Date Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">{today}</h2>
                {dailyLog && (
                  <div className="text-sm text-gray-600">
                    {dailyLog.meals.length}/6 meals logged • 
                    {dailyLog.meals.filter(m => m.hadProtein).length} protein • 
                    {dailyLog.meals.filter(m => m.hadVegetables).length} vegetables
                  </div>
                )}
              </div>
            </div>

            {/* Meal Slots */}
            <div className="grid grid-cols-1 gap-4">
              {MEAL_SLOTS.map(({ key, label, defaultTime }) => {
                const mealEntry = getMealEntry(key);
                const isLogged = !!mealEntry;
                
                return (
                  <MealSlotCard
                    key={key}
                    mealSlot={key as MealLogEntry['mealSlot']}
                    label={label}
                    defaultTime={defaultTime}
                    mealEntry={mealEntry}
                    isLogged={isLogged}
                    isCommitted={commitment?.committedSlots.includes(key) || false}
                    onLogMeal={logMeal}
                    onClearMeal={clearMeal}
                  />
                );
              })}
            </div>

            {/* Daily Summary */}
            {dailyLog && dailyLog.meals.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Today's Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{dailyLog.meals.length}</div>
                    <div className="text-sm text-gray-600">Meals Logged</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {dailyLog.meals.filter(m => m.hadProtein).length}
                    </div>
                    <div className="text-sm text-gray-600">Had Protein</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {dailyLog.meals.filter(m => m.hadVegetables).length}
                    </div>
                    <div className="text-sm text-gray-600">Had Vegetables</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {dailyLog.meals.filter(m => m.hadProtein && m.hadVegetables).length}
                    </div>
                    <div className="text-sm text-gray-600">Protein + Veggies</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Meal Slot Card Component
function MealSlotCard({
  mealSlot,
  label,
  defaultTime,
  mealEntry,
  isLogged,
  isCommitted,
  onLogMeal,
  onClearMeal
}: {
  mealSlot: MealLogEntry['mealSlot'];
  label: string;
  defaultTime: string;
  mealEntry?: MealLogEntry;
  isLogged: boolean;
  isCommitted: boolean;
  onLogMeal: (mealSlot: MealLogEntry['mealSlot'], data: any) => void;
  onClearMeal: (mealSlot: MealLogEntry['mealSlot']) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    timeEaten: mealEntry?.timeEaten || defaultTime,
    hadProtein: mealEntry?.hadProtein || false,
    hadVegetables: mealEntry?.hadVegetables || false,
    mealName: mealEntry?.mealName || ''
  });

  const handleSave = () => {
    onLogMeal(mealSlot, formData);
    setIsExpanded(false);
  };

  return (
    <div className={`bg-white rounded-lg shadow border-l-4 transition-all ${
      isLogged 
        ? 'border-green-500 bg-green-50' 
        : isCommitted
        ? 'border-blue-500 hover:shadow-md'
        : 'border-gray-300 hover:shadow-md'
    }`}>
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium text-gray-800">
              {label}
              {isCommitted && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🎯 Committed
                </span>
              )}
            </span>
            {isLogged && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{mealEntry?.timeEaten || 'No time'}</span>
                {mealEntry?.hadProtein && <span className="text-green-600 text-sm">🥩 Protein</span>}
                {mealEntry?.hadVegetables && <span className="text-orange-600 text-sm">🥬 Veggies</span>}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {isLogged ? (
              <>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onClearMeal(mealSlot)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsExpanded(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
              >
                Log Meal
              </button>
            )}
          </div>
        </div>

        {mealEntry?.mealName && !isExpanded && (
          <p className="mt-2 text-sm text-gray-600">"{mealEntry.mealName}"</p>
        )}

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Eaten</label>
                <input
                  type="time"
                  value={formData.timeEaten}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeEaten: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meal Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Greek yogurt with berries"
                  value={formData.mealName}
                  onChange={(e) => setFormData(prev => ({ ...prev, mealName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hadProtein}
                  onChange={(e) => setFormData(prev => ({ ...prev, hadProtein: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">🥩 Had Protein</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hadVegetables}
                  onChange={(e) => setFormData(prev => ({ ...prev, hadVegetables: e.target.checked }))}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">🥬 Had Vegetables</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600"
              >
                Save Meal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}