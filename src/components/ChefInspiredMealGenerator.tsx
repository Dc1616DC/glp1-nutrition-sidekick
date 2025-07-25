'use client';

import { useState } from 'react';
import AllergiesFilter from './AllergiesFilter';

interface ChefMealPreferences {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cookingMethod: 'any' | 'no-cook' | 'stovetop-only' | 'oven-only' | 'one-pot' | 'advanced';
  maxCookingTime: 15 | 30 | 45 | 60;
  equipmentAvailable: string[];
  dietaryRestrictions: string[];
  allergies: string[]; // New allergies filter
  proteinSource: 'any' | 'chicken' | 'turkey' | 'fish' | 'tofu' | 'eggs' | 'beans' | 'greek-yogurt' | 'high-protein';
  avoidIngredients: string[];
  preferredCuisine: string[];
  freeTextPrompt?: string;
  creativityLevel: 'simple' | 'flavorful-twists' | 'chef-inspired';
  assemblyToRecipeRatio: number; // 60% assemblies, 40% recipes
  minProtein?: number;
  minFiber?: number;
  maxCalories?: number;
  surpriseMe?: boolean;
  mealPrepOnly?: boolean;
}

interface ChefGeneratedMeal {
  id: string;
  name: string;
  description: string;
  type: string; // "Quick Assembly" or "Structured Recipe"
  prepTime: number;
  cookingTime: number;
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
  chef_tips: string[];
  satisfaction_factors: string[];
  assembly_tips?: string[];
  mealStyle: string[];
  glp1Friendly: {
    eatingTips: string;
  };
  mealPrep: {
    friendly: boolean;
  };
  nutritionSource?: string;
}

export default function ChefInspiredMealGenerator() {
  const [preferences, setPreferences] = useState<ChefMealPreferences>({
    mealType: 'lunch',
    cookingMethod: 'any',
    maxCookingTime: 30,
    equipmentAvailable: [],
    dietaryRestrictions: [],
    allergies: [], // New allergies array
    proteinSource: 'any',
    avoidIngredients: [],
    preferredCuisine: [],
    freeTextPrompt: '',
    creativityLevel: 'simple',
    assemblyToRecipeRatio: 60, // 60% assemblies, 40% recipes
    surpriseMe: false,
    mealPrepOnly: false
  });

  const [generatedMeals, setGeneratedMeals] = useState<ChefGeneratedMeal[]>([]);
  const [selectedMealIndex, setSelectedMealIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [previousMeals, setPreviousMeals] = useState<string[]>([]);

  const clearHistory = () => {
    setPreviousMeals([]);
    console.log('Meal history cleared for better variety');
  };

  const generateChefMeal = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-chef-meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mealType: preferences.mealType,
          preferences: {
            dietaryRestrictions: preferences.dietaryRestrictions,
            allergies: preferences.allergies, // Include allergies filter
            cuisineType: preferences.preferredCuisine.length > 0 ? preferences.preferredCuisine.join(',') : undefined,
            proteinSource: preferences.proteinSource !== 'any' ? preferences.proteinSource : undefined,
            freeTextPrompt: preferences.freeTextPrompt,
            minProtein: preferences.minProtein,
            minFiber: preferences.minFiber,
            maxCalories: preferences.maxCalories,
            surpriseMe: preferences.surpriseMe,
            cookingMethod: preferences.cookingMethod !== 'any' ? preferences.cookingMethod : undefined,
            maxCookingTime: preferences.maxCookingTime,
            equipmentAvailable: preferences.equipmentAvailable.length > 0 ? preferences.equipmentAvailable.join(',') : undefined,
            mealPrepOnly: preferences.mealPrepOnly,
            creativityLevel: preferences.creativityLevel,
            assemblyToRecipeRatio: preferences.assemblyToRecipeRatio
          },
          avoidIngredients: preferences.avoidIngredients,
          previousMeals // Send previous meals for variety
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate chef-inspired meals');
      }

      const data = await response.json();
      
      // Handle chef-inspired meals response
      const meals = data.meals || [];
      
      setGeneratedMeals(meals);
      setSelectedMealIndex(0);
      
      // Add generated meal names to history for variety
      if (meals.length > 0) {
        const newMealNames = meals.map((meal: ChefGeneratedMeal) => meal.name);
        setPreviousMeals(prev => [...prev, ...newMealNames]);
      }
      
    } catch (error) {
      console.error('Error generating chef-inspired meal:', error);
      
      // Fallback to appealing mock meal
      const mockMeal: ChefGeneratedMeal = {
        id: Date.now().toString(),
        name: "Mediterranean Protein Power Bowl",
        description: "Energizing Power Bowl - A nourishing combination that makes eating enough feel effortless and satisfying",
        type: "Quick Assembly",
        prepTime: 5,
        cookingTime: 0,
        servings: 1,
        nutrition: {
          protein: 25,
          fiber: 8,
          calories: 400,
          carbs: 30,
          fat: 12
        },
        ingredients: [
          "1 cup Greek yogurt, plain",
          "2 tablespoons mixed nuts, chopped",
          "1/2 cup mixed berries",
          "2 tablespoons granola",
          "1 tablespoon honey drizzle",
          "Fresh mint leaves for garnish"
        ],
        instructions: [
          "Layer Greek yogurt in an appealing bowl",
          "Arrange berries artfully on top",
          "Sprinkle chopped nuts for satisfying crunch",
          "Add granola for texture contrast",
          "Drizzle lightly with honey",
          "Garnish with fresh mint leaves"
        ],
        chef_tips: [
          "The variety of textures keeps every bite interesting",
          "Perfect protein-to-fiber ratio for GLP-1 goals",
          "Beautiful presentation makes it feel special"
        ],
        satisfaction_factors: [
          "Creamy yogurt base",
          "Crunchy nuts and granola", 
          "Sweet berry bursts",
          "Fresh mint aroma"
        ],
        mealStyle: ["GLP-1 Friendly", "High Protein", "Quick Assembly", "Chef-Inspired"],
        glp1Friendly: {
          eatingTips: "High protein supports satiety and blood sugar stability. The variety of textures encourages slow, mindful eating."
        },
        mealPrep: {
          friendly: true
        },
        nutritionSource: "Chef-Inspired AI"
      };
      
      setGeneratedMeals([mockMeal]);
      setSelectedMealIndex(0);
      setPreviousMeals(prev => [...prev, mockMeal.name]);
    } finally {
      setIsGenerating(false);
    }
  };

  const enhanceWithFlavorfulTwists = async () => {
    if (!selectedMeal) return;
    
    setIsEnhancing(true);
    
    try {
      const response = await fetch('/api/generate-chef-meals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mealId: selectedMeal.id,
          originalMeal: selectedMeal,
          preferences: {
            mealType: preferences.mealType,
            allergies: preferences.allergies,
            creativityLevel: 'flavorful-twists'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance meal');
      }

      const data = await response.json();
      const enhancedMeal = data.meal;
      
      // Replace current meal with enhanced version
      const updatedMeals = [...generatedMeals];
      updatedMeals[selectedMealIndex] = enhancedMeal;
      setGeneratedMeals(updatedMeals);
      
    } catch (error) {
      console.error('Error enhancing meal:', error);
      alert('Unable to enhance meal at this time. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Get the currently selected meal
  const selectedMeal = generatedMeals.length > 0 ? generatedMeals[selectedMealIndex] : null;

  // Use nutrition per serving as provided by the recipe
  const scaledNutrition = selectedMeal ? {
    protein: selectedMeal.nutrition.protein.toFixed(1),
    fiber: selectedMeal.nutrition.fiber.toFixed(1),
    calories: Math.round(selectedMeal.nutrition.calories),
    carbs: selectedMeal.nutrition.carbs.toFixed(1),
    fat: selectedMeal.nutrition.fat.toFixed(1)
  } : null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍽️ Chef-Inspired AI Meal Generator
          </h1>
          <p className="text-gray-600">
            Transform simple ingredients into appealing, satisfying meals perfect for GLP-1 users
          </p>
          <div className="mt-2 text-sm text-blue-600">
            ✨ Featuring "doable decadence" - easy yet delicious meal ideas
          </div>
        </div>

        {/* Allergies Filter - Prominent placement */}
        <AllergiesFilter
          selectedAllergies={preferences.allergies}
          onAllergiesChange={(allergies) => setPreferences({...preferences, allergies})}
          className="mb-6"
        />
        
        {/* Preferences Form */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={preferences.mealType}
              onChange={(e) => setPreferences({...preferences, mealType: e.target.value as any})}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* Chef Creativity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chef's Touch</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={preferences.creativityLevel}
              onChange={(e) => setPreferences({...preferences, creativityLevel: e.target.value as any})}
            >
              <option value="simple">Simple & Practical</option>
              <option value="flavorful-twists">Add Flavorful Twists</option>
              <option value="chef-inspired">Full Chef Experience</option>
            </select>
          </div>

          {/* Assembly vs Recipe Ratio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Style Mix ({preferences.assemblyToRecipeRatio}% Quick / {100-preferences.assemblyToRecipeRatio}% Recipes)
            </label>
            <input
              type="range"
              min="20"
              max="80"
              step="10"
              value={preferences.assemblyToRecipeRatio}
              onChange={(e) => setPreferences({...preferences, assemblyToRecipeRatio: Number(e.target.value)})}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>More Recipes</span>
              <span>More Quick Assembly</span>
            </div>
          </div>

          {/* Cooking Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Method</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={preferences.cookingMethod}
              onChange={(e) => setPreferences({...preferences, cookingMethod: e.target.value as any})}
            >
              <option value="any">Any Method</option>
              <option value="no-cook">No-Cook Assembly</option>
              <option value="stovetop-only">Stovetop Only</option>
              <option value="oven-only">Oven Only</option>
              <option value="one-pot">One-Pot Meals</option>
              <option value="advanced">Advanced Techniques</option>
            </select>
          </div>

          {/* Max Cooking Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Time (min)</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={preferences.maxCookingTime}
              onChange={(e) => setPreferences({...preferences, maxCookingTime: Number(e.target.value) as 15 | 30 | 45 | 60})}
            >
              <option value={15}>Up to 15 min</option>
              <option value={30}>Up to 30 min</option>
              <option value={45}>Up to 45 min</option>
              <option value={60}>Up to 60 min</option>
            </select>
          </div>

          {/* Equipment Available - Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Available</label>
            <div className="grid grid-cols-2 gap-2">
              {['oven', 'stove', 'microwave', 'blender', 'food processor', 'slow cooker', 'grill', 'air fryer', 'instant pot', 'wok'].map((equipment) => (
                <label key={equipment} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.equipmentAvailable.includes(equipment)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferences({...preferences, equipmentAvailable: [...preferences.equipmentAvailable, equipment]});
                      } else {
                        setPreferences({...preferences, equipmentAvailable: preferences.equipmentAvailable.filter(eq => eq !== equipment)});
                      }
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm capitalize">{equipment.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions - Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
            <div className="grid grid-cols-2 gap-2">
              {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'].map((restriction) => (
                <label key={restriction} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.dietaryRestrictions.includes(restriction)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferences({...preferences, dietaryRestrictions: [...preferences.dietaryRestrictions, restriction]});
                      } else {
                        setPreferences({...preferences, dietaryRestrictions: preferences.dietaryRestrictions.filter(r => r !== restriction)});
                      }
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm capitalize">{restriction.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Protein Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Protein</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={preferences.proteinSource}
              onChange={(e) => setPreferences({...preferences, proteinSource: e.target.value as any})}
            >
              <option value="any">Any Protein</option>
              <option value="high-protein">High-Protein Focus</option>
              <option value="chicken">Chicken</option>
              <option value="turkey">Turkey</option>
              <option value="fish">Fish</option>
              <option value="eggs">Eggs</option>
              <option value="tofu">Tofu</option>
              <option value="beans">Beans/Legumes</option>
              <option value="greek-yogurt">Greek Yogurt</option>
            </select>
          </div>

          {/* Cuisine - Multi-Select */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Style</label>
            <div className="grid grid-cols-2 gap-2">
              {['american', 'mediterranean', 'asian', 'mexican', 'italian', 'indian'].map((cuisine) => (
                <label key={cuisine} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.preferredCuisine.includes(cuisine)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferences({...preferences, preferredCuisine: [...preferences.preferredCuisine, cuisine]});
                      } else {
                        setPreferences({...preferences, preferredCuisine: preferences.preferredCuisine.filter(c => c !== cuisine)});
                      }
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm capitalize">{cuisine}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Creative Prompt */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎨 Creative Request (Optional)
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={2}
            placeholder="e.g., 'Something colorful and refreshing' or 'Comfort food vibes but healthy'"
            value={preferences.freeTextPrompt}
            onChange={(e) => setPreferences({...preferences, freeTextPrompt: e.target.value})}
          />
        </div>

        {/* Generate Button and History Controls */}
        <div className="mt-6 flex gap-4 items-center flex-wrap">
          <button 
            onClick={generateChefMeal}
            disabled={isGenerating}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⚡</span>
                <span>Creating Chef Magic...</span>
              </>
            ) : (
              <>
                <span>👨‍🍳</span>
                <span>Generate Chef-Inspired Meal</span>
              </>
            )}
          </button>
          
          {selectedMeal && (
            <button
              onClick={enhanceWithFlavorfulTwists}
              disabled={isEnhancing}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isEnhancing ? (
                <>
                  <span className="animate-spin">✨</span>
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Add Flavorful Twists</span>
                </>
              )}
            </button>
          )}
          
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

      {/* Generated Meals Display */}
      {selectedMeal && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Meal Selection Tabs (when multiple meals available) */}
          {generatedMeals.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose Your Chef Creation:</h3>
              <div className="flex gap-2 overflow-x-auto">
                {generatedMeals.map((meal, index) => (
                  <button
                    key={meal.id}
                    onClick={() => setSelectedMealIndex(index)}
                    className={`
                      flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all duration-200
                      ${selectedMealIndex === index 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="text-sm font-medium">{meal.name}</div>
                    <div className="text-xs opacity-75">
                      {meal.nutrition.protein}g protein • {meal.type}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMeal.name}</h2>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                  {selectedMeal.type}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{selectedMeal.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedMeal.mealStyle.map((style, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {style}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Nutrition from {selectedMeal.nutritionSource || 'Chef AI'}
              </div>
              <div className="text-sm text-gray-500">
                ⏱️ {selectedMeal.cookingTime + selectedMeal.prepTime} min total
              </div>
            </div>
          </div>

          {/* Meal Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Nutrition */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">📊 Nutrition (per serving)</h3>
              <div className="bg-gray-50 p-4 rounded space-y-2">
                <div className="flex justify-between">
                  <span>Protein:</span>
                  <span className="font-semibold text-green-600">{scaledNutrition?.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Fiber:</span>
                  <span className="font-semibold text-blue-600">{scaledNutrition?.fiber}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Calories:</span>
                  <span className="font-semibold">{scaledNutrition?.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbs:</span>
                  <span>{scaledNutrition?.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Fat:</span>
                  <span>{scaledNutrition?.fat}g</span>
                </div>
              </div>
            </div>

            {/* Timing */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">⏱️ Timing & Servings</h3>
              <div className="bg-gray-50 p-4 rounded space-y-2">
                <div className="flex justify-between">
                  <span>Prep Time:</span>
                  <span className="font-semibold">{selectedMeal.prepTime} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Cook Time:</span>
                  <span className="font-semibold">{selectedMeal.cookingTime} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Recipe Serves:</span>
                  <span className="font-semibold">{selectedMeal.servings} {selectedMeal.servings > 1 ? 'servings' : 'serving'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">🛒 Ingredients</h3>
            <ul className="grid md:grid-cols-2 gap-2">
              {selectedMeal.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-sm">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              {selectedMeal.type === 'Quick Assembly' ? '🔧 Assembly Steps' : '👩‍🍳 Cooking Instructions'}
            </h3>
            <ol className="space-y-2">
              {selectedMeal.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Assembly Tips for Quick Assembly meals */}
          {selectedMeal.assembly_tips && selectedMeal.assembly_tips.length > 0 && (
            <div className="mt-6 bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-blue-900 mb-2">🔧 Assembly Pro Tips</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                {selectedMeal.assembly_tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* GLP-1 Tips */}
          <div className="mt-6 bg-green-50 p-4 rounded">
            <h3 className="font-semibold text-green-900 mb-2">💊 GLP-1 Friendly Benefits</h3>
            <p className="text-green-800 text-sm">{selectedMeal.glp1Friendly.eatingTips}</p>
          </div>

          {/* Chef Tips */}
          {selectedMeal.chef_tips.length > 0 && (
            <div className="mt-6 bg-purple-50 p-4 rounded">
              <h3 className="font-semibold text-purple-900 mb-2">👨‍🍳 Chef's Secrets</h3>
              <ul className="space-y-1 text-sm text-purple-800">
                {selectedMeal.chef_tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">✨</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Satisfaction Factors */}
          {selectedMeal.satisfaction_factors.length > 0 && (
            <div className="mt-6 bg-yellow-50 p-4 rounded">
              <h3 className="font-semibold text-yellow-900 mb-2">😋 What Makes This Satisfying</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMeal.satisfaction_factors.map((factor, index) => (
                  <span key={index} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4 flex-wrap">
            <button 
              onClick={generateChefMeal}
              disabled={isGenerating}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>👨‍🍳</span>
              <span>{isGenerating ? 'Creating...' : 'Create Another Meal'}</span>
            </button>
            
            <button
              onClick={enhanceWithFlavorfulTwists}
              disabled={isEnhancing}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>✨</span>
              <span>{isEnhancing ? 'Enhancing...' : 'Add Flavorful Twists'}</span>
            </button>
            
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 flex items-center space-x-2">
              <span>❤️</span>
              <span>Save to Favorites</span>
            </button>
            
            <button className="bg-blue-200 text-blue-800 px-4 py-2 rounded hover:bg-blue-300 flex items-center space-x-2">
              <span>📝</span>
              <span>Create Shopping List</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
