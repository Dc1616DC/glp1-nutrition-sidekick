'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getMealById, Meal } from '../../../firebase/db';

// For a novice developer: This is a dynamic page that shows the details of a single meal.
// The `[id]` in the folder name means that whatever is in the URL at that position
// (e.g., /meals/abc123) will be available as `params.id` in this component.

type Params = Promise<{ id: string }>;

export default function MealDetailPage({ params }: { params: Params }) {
  // Use React.use() to unwrap the Promise (Next.js 15 pattern)
  const { id } = use(params);
  const router = useRouter(); // Hook to programmatically navigate, e.g., back to the previous page

  const [meal, setMeal] = useState<Meal | null>(null); // State to hold the fetched meal data
  const [loading, setLoading] = useState(true); // A flag to show a loading message while we fetch data
  const [error, setError] = useState<string | null>(null); // A string to hold any error messages

  useEffect(() => {
    // This effect runs when the component loads or when the 'id' in the URL changes.
    // Its job is to fetch the specific meal data from the database.
    const fetchMeal = async () => {
      if (!id) {
        setLoading(false);
        setError("No meal ID provided.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // We assume a function `getMealById` exists in our db file to fetch one meal.
        const fetchedMeal = await getMealById(id);
        if (fetchedMeal) {
          setMeal(fetchedMeal);
        } else {
          setError("Meal not found.");
        }
      } catch (err) {
        console.error("Failed to fetch meal:", err);
        setError("Failed to load meal details. Please try again.");
      } finally {
        setLoading(false); // This always runs, ensuring the loading spinner is hidden.
      }
    };

    fetchMeal();
  }, [id]); // The effect re-runs if the `id` from the URL changes.

  // --- Render Logic for different states ---
  if (loading) {
    return <div className="text-center py-10">Loading meal details...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Error: {error}</div>;
  }

  if (!meal) {
    return <div className="text-center py-10 text-gray-500">Meal not found.</div>;
  }

  // --- Main Meal Display ---
  // This part only renders if loading is false, there are no errors, and a meal was found.
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg space-y-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Back to All Meals
      </button>

      {/* Meal Header */}
      <div className="text-center">
        <p className="text-sm font-semibold text-[#4A90E2] uppercase tracking-wide">
          {meal.category}
        </p>
        <h1 className="text-4xl font-extrabold text-gray-800 mt-2">
          {meal.name}
        </h1>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {meal.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Nutritional Information */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center border-t border-b border-gray-200 py-6">
        <div>
          <p className="font-bold text-2xl text-gray-800">
            {meal.proteinGrams}g
          </p>
          <p className="text-sm text-gray-500">Protein</p>
        </div>
        <div>
          <p className="font-bold text-2xl text-gray-800">
            {meal.fiberGrams}g
          </p>
          <p className="text-sm text-gray-500">Fiber</p>
        </div>
        <div>
          <p className="font-bold text-2xl text-gray-800">
            {meal.prepTimeMinutes}min
          </p>
          <p className="text-sm text-gray-500">Prep Time</p>
        </div>
      </div>

      {/* Nutrition Note for low-protein snacks */}
      {meal.nutritionNote && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            {meal.nutritionNote}
          </p>
        </div>
      )}

      {/* Ingredients */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Ingredients
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
          {meal.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Instructions
        </h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-3 pl-2">
          {meal.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}