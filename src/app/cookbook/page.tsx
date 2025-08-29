'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { savedMealsService, SavedMeal } from '../../services/savedMealsService';
import { shoppingListService } from '../../services/shoppingListService';
import { useRouter } from 'next/navigation';
import StarRating from '../../components/StarRating';
import CookbookSkeleton from '../../components/skeletons/CookbookSkeleton';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export default function CookbookPage() {
  const { user, loading: authLoading } = useAuth();
  const { isOnline } = useOnlineStatus();
  const router = useRouter();
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPremiumAccess, setHasPremiumAccess] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'rating'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMeal, setSelectedMeal] = useState<SavedMeal | null>(null);
  // Removed mealStats - keeping it simple

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/signin?redirect=cookbook');
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
        await Promise.all([
          loadSavedMeals(),
          loadMealTags()
        ]);
      }
    } catch (error) {
      console.error('Error checking premium access:', error);
      setHasPremiumAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedMeals = async () => {
    if (!user) return;
    
    try {
      const meals = await savedMealsService.getUserSavedMeals(user.uid);
      setSavedMeals(meals);
    } catch (error) {
      console.error('Error loading saved meals:', error);
    }
  };

  const loadMealTags = async () => {
    if (!user) return;
    
    try {
      const tags = await savedMealsService.getUserMealTags(user.uid);
      setAllTags(tags);
    } catch (error) {
      console.error('Error loading meal tags:', error);
    }
  };

  // Removed loadMealStats - keeping it simple

  const handleDeleteMeal = async (mealId: string) => {
    if (!user || !confirm('Are you sure you want to delete this meal?')) return;
    
    try {
      await savedMealsService.deleteSavedMeal(mealId, user.uid);
      setSavedMeals(prev => prev.filter(meal => meal.id !== mealId));
      setSelectedMeal(null);
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('Failed to delete meal');
    }
  };

  const handleRateMeal = async (mealId: string, rating: number) => {
    if (!user) return;
    
    try {
      await savedMealsService.rateMeal(mealId, user.uid, rating);
      setSavedMeals(prev => prev.map(meal => 
        meal.id === mealId ? { ...meal, rating } : meal
      ));
      if (selectedMeal && selectedMeal.id === mealId) {
        setSelectedMeal({ ...selectedMeal, rating });
      }
    } catch (error) {
      console.error('Error rating meal:', error);
      alert('Failed to rate meal');
    }
  };

  const createShoppingListFromMeal = async (meal: SavedMeal) => {
    if (!user) return;
    
    try {
      const shoppingList = await shoppingListService.createListFromMeal(
        user.uid,
        meal.id,
        meal.title,
        meal.ingredients
      );
      
      alert(`Shopping list created: "${shoppingList.name}"`);
      router.push('/shopping-list');
    } catch (error) {
      console.error('Error creating shopping list:', error);
      alert('Failed to create shopping list');
    }
  };

  // Filter and sort meals
  const filteredMeals = savedMeals
    .filter(meal => {
      const matchesSearch = !searchTerm || 
        meal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTag = !selectedTag || meal.tags.includes(selectedTag);
      const matchesType = !filterType || meal.mealType === filterType;
      
      return matchesSearch && matchesTag && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.savedAt.getTime() - b.savedAt.getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.title.localeCompare(b.title);
        default: // newest
          return b.savedAt.getTime() - a.savedAt.getTime();
      }
    });

  // Removed rating functionality - keeping it simple

  if (authLoading || loading) {
    return <CookbookSkeleton />;
  }

  if (!user) return null;

  // Premium Access Gate
  if (hasPremiumAccess === false) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">My Cookbook</h1>
          <p className="mt-2 text-lg text-gray-600">Save and organize your AI-generated meals</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-8 text-white text-center">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
          <p className="text-purple-100 mb-6">
            Build your personal cookbook with saved meals, ratings, and organization features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📖 Cookbook Features:</h3>
              <ul className="text-sm space-y-1">
                <li>• Save unlimited AI-generated meals</li>
                <li>• Search by ingredients or name</li>
                <li>• Organize with custom tags</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🛒 Plus More:</h3>
              <ul className="text-sm space-y-1">
                <li>• Generate shopping lists</li>
                <li>• Pantry tracking integration</li>
                <li>• Batch cooking instructions</li>
                <li>• Export recipes to share</li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/pricing')}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Upgrade to Premium - $9.99/mo
          </button>
          <p className="text-xs text-purple-200 mt-2">7-day free trial • Cancel anytime</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 My Cookbook</h1>
        <p className="text-gray-600">Your personal collection of saved meals and recipes</p>
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div>
              <h3 className="font-semibold text-orange-900">You're offline</h3>
              <p className="text-sm text-orange-700">
                Your saved meals are displayed from cache. Changes may not sync until you're back online.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Simple Stats */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">{savedMeals.length}</div>
            <div className="text-gray-600">Saved Meals</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-500">
              {savedMeals.filter(m => m.rating).length > 0 
                ? (savedMeals.filter(m => m.rating).reduce((sum, meal) => sum + (meal.rating || 0), 0) / savedMeals.filter(m => m.rating).length).toFixed(1)
                : '—'
              }
            </div>
            <div className="text-gray-600">Avg Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">
              {savedMeals.filter(m => m.rating && m.rating >= 4).length}
            </div>
            <div className="text-gray-600">Favorites (4+ ⭐)</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search meals by name or ingredient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tag Filter */}
          <div>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rated</option>
              <option value="name">A-Z</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {filteredMeals.length} of {savedMeals.length} meals
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {savedMeals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cookbook is Empty</h2>
          <p className="text-gray-600 mb-6">
            Start building your personal recipe collection by saving meals from the AI generator.
          </p>
          <button
            onClick={() => router.push('/meal-generator')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
          >
            Generate Your First Meal
          </button>
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Matching Meals</h2>
          <p className="text-gray-600 mb-6">
            Try adjusting your search terms or filters to find your meals.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTag('');
              setFilterType('');
            }}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Meals Grid/List */
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredMeals.map((meal) => (
            <div key={meal.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{meal.title}</h3>
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating 
                        rating={meal.rating || 0} 
                        onRatingChange={(rating) => handleRateMeal(meal.id, rating)}
                        size="sm"
                      />
                      {meal.rating && (
                        <span className="text-xs text-gray-500">({meal.rating}/5)</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 capitalize">
                      {meal.mealType} • {meal.cookingTime} mins
                    </p>
                  </div>
                  
                  {/* Meal Type Badge */}
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                    {meal.mealType}
                  </span>
                </div>

                {/* Nutrition Summary */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">{meal.nutritionTotals.calories || 0}</div>
                    <div className="text-gray-600">Cal</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">{meal.nutritionTotals.protein || 0}g</div>
                    <div className="text-gray-600">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">{meal.nutritionTotals.fiber || 0}g</div>
                    <div className="text-gray-600">Fiber</div>
                  </div>
                </div>

                {/* Tags */}
                {meal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {meal.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {meal.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{meal.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setSelectedMeal(meal)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View Recipe
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => createShoppingListFromMeal(meal)}
                      className="text-green-600 hover:text-green-800 text-sm"
                      title="Create shopping list from this meal"
                    >
                      🛒 List
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedMeal.title}</h2>
                  <div className="flex items-center gap-3">
                    <StarRating 
                      rating={selectedMeal.rating || 0} 
                      onRatingChange={(rating) => handleRateMeal(selectedMeal.id, rating)}
                      size="md"
                      showText
                    />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMeal(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl ml-4"
                >
                  ×
                </button>
              </div>


              {/* Nutrition Info */}
              <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="font-semibold text-gray-800">{selectedMeal.nutritionTotals.calories || 0}</div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">{selectedMeal.nutritionTotals.protein || 0}g</div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">{selectedMeal.nutritionTotals.fiber || 0}g</div>
                  <div className="text-sm text-gray-600">Fiber</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">{selectedMeal.cookingTime}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {selectedMeal.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {selectedMeal.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-1 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tags */}
              {selectedMeal.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMeal.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedMeal.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedMeal.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Saved {selectedMeal.savedAt.toLocaleDateString()}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => createShoppingListFromMeal(selectedMeal)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    🛒 Create Shopping List
                  </button>
                  <button
                    onClick={() => {/* TODO: Add regenerate similar functionality */}}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled
                  >
                    Generate Similar
                  </button>
                  <button
                    onClick={() => setSelectedMeal(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}