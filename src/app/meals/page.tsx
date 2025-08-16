'use client';

import { useState, useEffect, useMemo } from 'react';
import { getMeals, Meal } from '../../firebase/db';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// For a novice developer: This is the main page for browsing meals.
// It's a "client component" because it's interactive—it fetches data and
// allows the user to filter results in real-time without a page reload.

export default function MealsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // --- State Management ---
  // We use `useState` to hold data that can change over time and cause the page to re-render.

  const [allMeals, setAllMeals] = useState<Meal[]>([]); // Stores the original, unfiltered list of meals from the database.
  const [loading, setLoading] = useState(true); // A boolean to track if we are currently fetching data.
  const [error, setError] = useState<string | null>(null); // A string to hold any error messages.

  // State for our filters
  const [categoryFilter, setCategoryFilter] = useState<'All' | Meal['category']>('All');
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(''); // NEW: text search

  const availableCategories: ('All' | Meal['category'])[] = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const availableDietaryTags = ['Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Quick'];

  // --- Data Fetching ---
  // `useEffect` runs code after the component has rendered.
  // Fetch meals regardless of auth status - this is for free users too
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true); // Start loading
        setError(null); // Clear previous errors
        const mealsFromDb = await getMeals();
        setAllMeals(mealsFromDb);
      } catch (err) {
        console.error("Failed to fetch meals:", err);
        setError("Could not load meals. Please try refreshing the page.");
      } finally {
        setLoading(false); // Stop loading, whether it succeeded or failed
      }
    };

    fetchMeals();
  }, []); // No dependencies - fetch on mount

  // --- Filtering Logic ---
  // `useMemo` is a performance optimization hook. It re-calculates `filteredMeals`
  // only when one of its dependencies (`allMeals`, `categoryFilter`, `dietaryFilters`) changes.
  const filteredMeals = useMemo(() => {
    // Basic, case-insensitive search helper
    const term = searchTerm.trim().toLowerCase();
    return allMeals.filter(meal => {
      // 1. Category Filter Check
      const categoryMatch = categoryFilter === 'All' || meal.category === categoryFilter;

      // 2. Dietary Filter Check
      // `every` checks if ALL selected dietary filters are present in the meal's tags.
      const dietaryMatch = dietaryFilters.every(filter => meal.tags.includes(filter));

      // 3. Name / Ingredient search check
      const textMatch =
        term === '' ||
        meal.name.toLowerCase().includes(term) ||
        meal.ingredients.some(ing => ing.toLowerCase().includes(term));

      return categoryMatch && dietaryMatch && textMatch;
    });
  }, [allMeals, categoryFilter, dietaryFilters, searchTerm]);

  // --- Event Handlers ---
  const handleDietaryFilterChange = (tag: string) => {
    setDietaryFilters(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag) // If tag is already selected, remove it
        : [...prev, tag] // Otherwise, add it
    );
  };

  // --- Render Logic ---
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Explore Meals</h1>
        <p className="mt-2 text-lg text-gray-600">
          Find the perfect high-protein, high-fiber meal for you.
        </p>
      </div>

      {/* AI Suggestion Button */}
      <div className="text-center">
        {user ? (
          <button
            className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#7ED321] to-[#50E3C2] rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
            onClick={() => router.push('/meal-generator')}
          >
            ✨ Get a Custom AI Meal Suggestion
          </button>
        ) : (
          <button
            className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#7ED321] to-[#50E3C2] rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
            onClick={() => router.push('/signin?redirect=meal-generator')}
          >
            ✨ Sign In for AI Meal Suggestions
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="flex justify-center">
        <input
          type="text"
          placeholder="Search meals by name or ingredient…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filters Section */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Category Filters */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    categoryFilter === category
                      ? 'bg-[#4A90E2] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Filters */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Filter by Dietary Needs</h3>
            <div className="flex flex-wrap gap-4">
              {availableDietaryTags.map(tag => (
                <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dietaryFilters.includes(tag)}
                    onChange={() => handleDietaryFilterChange(tag)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Meal Display Section */}
      <div>
        {/* Count indicator */}
        {!loading && !error && (
          <p className="text-sm text-gray-600 mb-4 text-center">
            Showing {filteredMeals.length} of {allMeals.length} meals
          </p>
        )}
        {loading ? (
          <p className="text-center py-10">Loading meals...</p>
        ) : error ? (
          <p className="text-center py-10 text-red-600">{error}</p>
        ) : filteredMeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeals.map(meal => (
              <Link
                key={meal.id}
                href={`/meals/${meal.id}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col hover:ring-2 hover:ring-[#4A90E2] transition"
              >
                <div className="p-6 flex-grow">
                  <p className="text-sm font-semibold text-[#4A90E2]">{meal.category}</p>
                  <h3 className="text-xl font-bold text-gray-800 mt-1">{meal.name}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {meal.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 grid grid-cols-3 text-center">
                  <div>
                    <p className="font-bold text-lg">{meal.proteinGrams}g</p>
                    <p className="text-xs text-gray-500">Protein</p>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{meal.fiberGrams}g</p>
                    <p className="text-xs text-gray-500">Fiber</p>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{meal.prepTimeMinutes}min</p>
                    <p className="text-xs text-gray-500">Prep</p>
                  </div>
                </div>
                {/* View Details button */}
                <div className="bg-white px-6 py-3 border-t text-center">
                  <span className="inline-block px-4 py-2 text-sm font-medium text-white bg-[#4A90E2] rounded-md">
                    View Details
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center py-10 text-gray-500">No meals match your current filters.</p>
        )}
      </div>
    </div>
  );
}
