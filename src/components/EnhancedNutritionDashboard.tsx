'use client';

import { useState } from 'react';
import { MealLogStats } from '../services/mealLoggingService';

interface EnhancedNutritionDashboardProps {
  stats: MealLogStats | null;
  loading?: boolean;
}

export default function EnhancedNutritionDashboard({ stats, loading }: EnhancedNutritionDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'insights'>('overview');

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8 text-center border border-blue-100">
        <div className="text-4xl mb-4">🌱</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Nutrition Journey Starts Here</h3>
        <p className="text-gray-600 mb-4">
          Begin tracking your meals to discover gentle patterns and celebrate your nutrition wins.
        </p>
        <div className="bg-white bg-opacity-60 rounded-lg p-4 text-sm text-gray-700">
          <strong>💡 Remember:</strong> This isn't about perfect tracking—it's about awareness and celebrating small victories along your journey.
        </div>
      </div>
    );
  }

  const getEncouragingMessage = () => {
    const { proteinPercentage, vegetablePercentage, mealsLoggedToday, streak } = stats;
    
    if (streak >= 7) return { emoji: '🔥', message: `Amazing ${streak}-day logging streak! You're building wonderful awareness habits.` };
    if (proteinPercentage >= 80) return { emoji: '💪', message: 'Excellent protein nourishment! Your body is getting what it needs.' };
    if (vegetablePercentage >= 70) return { emoji: '🌈', message: 'Beautiful variety in your vegetable choices! Your body loves this diversity.' };
    if (mealsLoggedToday >= 2) return { emoji: '✨', message: 'Great job staying aware of your eating patterns today!' };
    if (streak >= 3) return { emoji: '🌟', message: `${streak} days of mindful tracking—you're developing wonderful awareness!` };
    return { emoji: '🌱', message: 'Every meal logged is a step toward greater body awareness. Keep going!' };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-emerald-400 to-green-500';
    if (percentage >= 60) return 'from-blue-400 to-teal-500';
    if (percentage >= 40) return 'from-yellow-400 to-orange-400';
    return 'from-pink-400 to-rose-400';
  };

  const encouragement = getEncouragingMessage();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Encouraging Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{encouragement.emoji}</span>
          <p className="text-green-800 font-medium">{encouragement.message}</p>
        </div>
      </div>

      {/* Key Metrics - Gentle Presentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Protein Nourishment */}
        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Protein Nourishment</h4>
            <span className="text-2xl">🥚</span>
          </div>
          <div className="flex items-end space-x-2 mb-2">
            <span className="text-2xl font-bold text-gray-800">{stats.proteinMealsCount}</span>
            <span className="text-sm text-gray-500 pb-1">of {stats.totalMealsLogged} meals</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(stats.proteinPercentage)}`}
              style={{ width: `${Math.min(stats.proteinPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600">
            {stats.proteinPercentage >= 70 ? 'Excellent protein awareness! 🌟' : 
             stats.proteinPercentage >= 50 ? 'Good protein mindfulness 👍' : 
             'Building protein awareness 🌱'}
          </p>
        </div>

        {/* Vegetable Variety */}
        <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-600">Vegetable Variety</h4>
            <span className="text-2xl">🥬</span>
          </div>
          <div className="flex items-end space-x-2 mb-2">
            <span className="text-2xl font-bold text-gray-800">{stats.vegetableMealsCount}</span>
            <span className="text-sm text-gray-500 pb-1">of {stats.totalMealsLogged} meals</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(stats.vegetablePercentage)}`}
              style={{ width: `${Math.min(stats.vegetablePercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600">
            {stats.vegetablePercentage >= 70 ? 'Wonderful vegetable diversity! 🌈' : 
             stats.vegetablePercentage >= 50 ? 'Great veggie awareness 💚' : 
             'Exploring vegetable options 🌿'}
          </p>
        </div>
      </div>

      {/* Awareness Streak */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">📈</div>
          <div>
            <h4 className="font-semibold text-gray-800">Awareness Streak</h4>
            <p className="text-gray-600">
              <span className="text-xl font-bold text-purple-600">{stats.streak}</span> days of mindful tracking
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Building habits one meal at a time ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatterns = () => (
    <div className="space-y-6">
      {/* Meal Slot Insights */}
      {stats.mealSlotInsights && stats.mealSlotInsights.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Your Meal Patterns</h4>
          <div className="space-y-3">
            {stats.mealSlotInsights.map((slot, index) => (
              <div key={slot.slotName} className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-700 capitalize">{slot.slotName}</h5>
                  <span className="text-sm text-gray-500">{slot.totalEntries} entries</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {Math.round(slot.proteinFrequency * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Protein included</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(slot.vegetableFrequency * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Vegetables included</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Comparison */}
      {stats.weekComparison && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">This Week's Journey</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.weekComparison.thisWeekMealsLogged}
              </div>
              <div className="text-sm text-gray-600">Meals logged</div>
              {stats.weekComparison.thisWeekMealsLogged > stats.weekComparison.lastWeekMealsLogged && (
                <div className="text-xs text-green-600 mt-1">↗️ Growing awareness!</div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(stats.weekComparison.thisWeekProteinPercentage)}%
              </div>
              <div className="text-sm text-gray-600">Protein inclusion</div>
              {stats.weekComparison.thisWeekProteinPercentage > stats.weekComparison.lastWeekProteinPercentage && (
                <div className="text-xs text-green-600 mt-1">💪 Nice improvement!</div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(stats.weekComparison.thisWeekVegetablePercentage)}%
              </div>
              <div className="text-sm text-gray-600">Vegetable variety</div>
              {stats.weekComparison.thisWeekVegetablePercentage > stats.weekComparison.lastWeekVegetablePercentage && (
                <div className="text-xs text-green-600 mt-1">🌈 More variety!</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      {/* Gentle Recommendations */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-5 border border-amber-100">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Gentle Insights</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {stats.proteinPercentage < 60 && (
                <p>• Consider adding protein sources you enjoy - maybe Greek yogurt, nuts, or your favorite lean proteins</p>
              )}
              {stats.vegetablePercentage < 50 && (
                <p>• Try adding colorful vegetables in ways that feel good - maybe in smoothies, soups, or roasted with herbs</p>
              )}
              {stats.streak < 3 && (
                <p>• Building awareness takes time - celebrate each meal you log as a step toward understanding your patterns</p>
              )}
              {stats.mealsLoggedToday === 0 && (
                <p>• When you&apos;re ready, try logging just one meal today to start building gentle awareness</p>
              )}
              {stats.proteinPercentage >= 70 && stats.vegetablePercentage >= 70 && (
                <p>• You&apos;re doing beautifully! Your awareness and nourishment patterns are really developing 🌟</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">🎉</span>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Celebrating Your Journey</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {stats.totalMealsLogged > 0 && (
                <p>• You&apos;ve logged {stats.totalMealsLogged} meals - each one is building your body awareness!</p>
              )}
              {stats.streak >= 1 && (
                <p>• Your {stats.streak}-day awareness streak shows real commitment to understanding your needs</p>
              )}
              {stats.proteinMealsCount > 0 && (
                <p>• You&apos;ve nourished yourself with protein {stats.proteinMealsCount} times - your body appreciates this care</p>
              )}
              {stats.vegetableMealsCount > 0 && (
                <p>• You&apos;ve included vegetables {stats.vegetableMealsCount} times - wonderful way to add variety and nutrients!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Tab Navigation */}
      <div className="border-b border-gray-100">
        <div className="flex space-x-1 p-1">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'patterns', label: 'Patterns', icon: '🔍' },
            { key: 'insights', label: 'Insights', icon: '💡' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'patterns' && renderPatterns()}
        {activeTab === 'insights' && renderInsights()}
      </div>
    </div>
  );
}