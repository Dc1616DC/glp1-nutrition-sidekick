'use client';

import { useState } from 'react';

interface MealPreferences {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cookingTime: '5min' | '15min' | '30min' | 'batch' | 'any';
  mealStyle: 'quick' | 'one-pot' | 'sheet-pan' | 'meal-prep' | 'any';
  dietaryRestriction: 'none' | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free';
  proteinSource: 'any' | 'chicken' | 'turkey' | 'fish' | 'tofu' | 'eggs' | 'beans' | 'greek-yogurt';
  avoidIngredients: string[];
  preferredCuisine: 'any' | 'american' | 'mediterranean' | 'asian' | 'mexican' | 'italian';
}

interface GeneratedMeal {
  id: string;
  name: string;
  description: string;
  cookingTime: number;
  prepTime: number;
  servings: number;
  nutrition: {
    protein: number;
    fiber: number;
    calories: number;
    carbs: number;
    fat: number;
  };
  ingredients: string[];
  instructions: string[];
  tips: string[];
  mealStyle: string[];
  glp1Friendly: {
    eatingTips: string;
  };
  nutritionSource?: string; // Add this to show USDA vs AI nutrition
}

export default function AIMealGenerator() {
  const [preferences, setPreferences] = useState<MealPreferences>({
    mealType: 'lunch',
    cookingTime: 'any',
    mealStyle: 'any',
    dietaryRestriction: 'none',
    proteinSource: 'any',
    avoidIngredients: [],
    preferredCuisine: 'any'
  });

  const [generatedMeal, setGeneratedMeal] = useState<GeneratedMeal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previousMeals, setPreviousMeals] = useState<string[]>([]);

  const clearHistory = () => {
    setPreviousMeals([]);
    console.log('Meal history cleared for better variety');
  };

  const generateMeal = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences,
          previousMeals // Send previous meals for variety
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal');
      }

      const meal = await response.json();
      
      setGeneratedMeal(meal);
      setPreviousMeals(prev => [...prev, meal.name]);
      
    } catch (error) {
      console.error('Error generating meal:', error);
      
      // Fallback to simple mock meal if API fails
      const mockMeal: GeneratedMeal = {
        id: Date.now().toString(),
        name: "High-Protein Power Bowl",
        description: "A nutritious bowl packed with protein and fiber",
        cookingTime: 20,
        prepTime: 10,
        servings: 1,
        nutrition: {
          protein: 25,
          fiber: 8,
          calories: 400,
          carbs: 30,
          fat: 12
        },
        ingredients: [
          "200g lean chicken breast",
          "100g quinoa",
          "150g mixed vegetables",
          "1 tbsp olive oil",
          "Salt and pepper to taste"
        ],
        instructions: [
          "Cook quinoa according to package directions",
          "Season and cook chicken breast in a pan with olive oil",
          "Steam or sauté vegetables until tender",
          "Combine all ingredients in a bowl",
          "Season to taste and serve"
        ],
        tips: [
          "This meal can be prepped ahead of time",
          "Substitute any vegetables you prefer",
          "Add herbs or spices for extra flavor"
        ],
        mealStyle: ["High Protein", "High Fiber", "GLP-1 Friendly", "Quick"],
        glp1Friendly: {
          eatingTips: "Chew thoroughly and eat slowly - this helps with satiety and digestion"
        },
        nutritionSource: "AI-estimated"
      };
      
      setGeneratedMeal(mockMeal);
      setPreviousMeals(prev => [...prev, mockMeal.name]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Meal Generator</h1>
        <p className="text-gray-600 mb-6">Generate personalized, high-protein meals perfect for GLP-1 medication users</p>
        
        {/* Preferences Form */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={preferences.mealType}
              onChange={(e) => setPreferences({...preferences, mealType: e.target.value as any})}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* Cooking Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Time</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={preferences.cookingTime}
              onChange={(e) => setPreferences({...preferences, cookingTime: e.target.value as any})}
            >
              <option value="5min">5 minutes (Quick snacks)</option>
              <option value="15min">15 minutes (Light cooking)</option>
              <option value="30min">30 minutes (Full meal)</option>
              <option value="batch">Batch cooking (1 hour)</option>
              <option value="any">Any time</option>
            </select>
          </div>

          {/* Meal Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal Style</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={preferences.mealStyle}
              onChange={(e) => setPreferences({...preferences, mealStyle: e.target.value as any})}
            >
              <option value="quick">Quick & Easy</option>
              <option value="one-pot">One-Pot Meal</option>
              <option value="sheet-pan">Sheet Pan Meal</option>
              <option value="meal-prep">Meal Prep Friendly</option>
              <option value="any">Any Style</option>
            </select>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={preferences.dietaryRestriction}
              onChange={(e) => setPreferences({...preferences, dietaryRestriction: e.target.value as any})}
            >
              <option value="none">No Restrictions</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="dairy-free">Dairy-Free</option>
            </select>
          </div>

          {/* Protein Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Protein</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={preferences.proteinSource}
              onChange={(e) => setPreferences({...preferences, proteinSource: e.target.value as any})}
            >
              <option value="any">Any Protein</option>
              <option value="chicken">Chicken</option>
              <option value="turkey">Turkey</option>
              <option value="fish">Fish</option>
              <option value="tofu">Tofu</option>
              <option value="eggs">Eggs</option>
              <option value="beans">Beans/Legumes</option>
              <option value="greek-yogurt">Greek Yogurt</option>
            </select>
          </div>

          {/* Cuisine */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Style</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={preferences.preferredCuisine}
              onChange={(e) => setPreferences({...preferences, preferredCuisine: e.target.value as any})}
            >
              <option value="any">Any Cuisine</option>
              <option value="american">American</option>
              <option value="mediterranean">Mediterranean</option>
              <option value="asian">Asian</option>
              <option value="mexican">Mexican</option>
              <option value="italian">Italian</option>
            </select>
          </div>
        </div>

        {/* Generate Button and History Controls */}
        <div className="mt-6 flex gap-4 items-center">
          <button 
            onClick={generateMeal}
            disabled={isGenerating}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Meal'}
          </button>
          
          {previousMeals.length > 0 && (
            <button 
              onClick={clearHistory}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
            >
              Clear History ({previousMeals.length} meals)
            </button>
          )}
        </div>
      </div>

      {/* Generated Meal Display */}
      {generatedMeal && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{generatedMeal.name}</h2>
            <p className="text-gray-600 mb-4">{generatedMeal.description}</p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                ⏱️ {generatedMeal.prepTime + generatedMeal.cookingTime} min total
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                🍽️ {generatedMeal.servings} serving{generatedMeal.servings > 1 ? 's' : ''}
              </span>
              {generatedMeal.mealStyle.map((style, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                  {style}
                </span>
              ))}
            </div>
          </div>

          {/* Nutrition */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-900">Nutrition per Serving</h3>
              {generatedMeal.nutritionSource && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {generatedMeal.nutritionSource}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600 text-lg">{generatedMeal.nutrition.protein}g</div>
                <div className="text-gray-600">Protein</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600 text-lg">{generatedMeal.nutrition.fiber}g</div>
                <div className="text-gray-600">Fiber</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-700 text-lg">{generatedMeal.nutrition.calories}</div>
                <div className="text-gray-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-700 text-lg">{generatedMeal.nutrition.carbs}g</div>
                <div className="text-gray-600">Carbs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-700 text-lg">{generatedMeal.nutrition.fat}g</div>
                <div className="text-gray-600">Fat</div>
              </div>
            </div>
          </div>

          {/* GLP-1 Specific Guidance */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 GLP-1 Eating Tips</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div><strong>Eating:</strong> {generatedMeal.glp1Friendly.eatingTips}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Ingredients */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ingredients</h3>
              <ul className="space-y-1 text-sm">
                {generatedMeal.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
              <ol className="space-y-2 text-sm">
                {generatedMeal.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                      {index + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Pro Tips</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {generatedMeal.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-2">💡</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex gap-4">
            <button 
              onClick={generateMeal}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Generate Another Meal
            </button>
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
              Save to Favorites
            </button>
            <button className="bg-blue-200 text-blue-800 px-4 py-2 rounded hover:bg-blue-300">
              Create Shopping List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
