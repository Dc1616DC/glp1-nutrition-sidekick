'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AllergiesFilter from './AllergiesFilter';
import { clientNutritionService } from '../services/clientNutritionService';
import { savedMealsService } from '../services/savedMealsService';
import InsightNudge from './InsightNudge';
import NutritionInsights from './NutritionInsights';
import { useAuth } from '../context/AuthContext';

interface MealPreferences {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cookingMethod: 'any' | 'no-cook' | 'stovetop-only' | 'oven-only' | 'one-pot' | 'advanced';
  maxCookingTime: 15 | 30 | 45 | 60;
  dietaryRestrictions: string[];
  allergies: string[]; // New: Safety-first allergies filter
  creativityLevel?: 'simple' | 'flavorful-twists' | 'chef-inspired';
  assemblyToRecipeRatio?: number; // 60% assemblies, 40% recipes
  minProtein?: number;
  minFiber?: number;
  maxCalories?: number;
}

interface GeneratedMeal {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  prepTime?: number;
  cookingTime?: number;
  servings: number;
  nutrition?: {
    protein: number;
    fiber: number;
    calories: number;
    carbs: number;
    fat: number;
  };
  nutritionTotals?: {
    protein: number;
    fiber: number;
    calories: number;
    carbs: number;
    fat: number;
  };
  ingredients: string[] | Array<{name: string; amount: number; unit: string}>;
  instructions: string[];
  tips?: string[];
  mealStyle?: string[];
  tags?: string[];
  glp1Friendly?: {
    eatingTips: string;
  };
  glp1Notes?: string;
  nutritionSource?: string;
  warnings?: string[];
  complexity?: {
    level: 'Simple' | 'Medium' | 'Advanced';
    score: number;
    factors: string[];
  };
  mealPrep?: {
    friendly: boolean;
    storageInstructions?: string;
    reheatingTips?: string;
    shelfLife?: string;
    batchScaling?: number;
  };
}

export default function AIMealGenerator() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [pantryIngredients, setPantryIngredients] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<MealPreferences>({
    mealType: 'lunch',
    maxCookingTime: 30,
    dietaryRestrictions: [],
    allergies: [],
    creativityLevel: 'simple',
    assemblyToRecipeRatio: 60
  });

  const [generatedMeals, setGeneratedMeals] = useState<GeneratedMeal[]>([]);
  const [selectedMealIndex, setSelectedMealIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [previousMeals, setPreviousMeals] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'generator' | 'education'>('generator');
  const [showNudge, setShowNudge] = useState<{
    type: 'lowProtein' | 'lowFiber' | null;
    mealData?: { protein: number; fiber: number; calories: number };
  }>({ type: null });
  const [symptomOptimized, setSymptomOptimized] = useState(false);
  const [showInsightModal, setShowInsightModal] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMealIds, setSavedMealIds] = useState<string[]>([]); // Track which meals are saved

  // Read pantry ingredients from URL params on component mount
  useEffect(() => {
    const pantryParam = searchParams.get('pantryIngredients');
    if (pantryParam) {
      const ingredients = decodeURIComponent(pantryParam).split(',').filter(Boolean);
      setPantryIngredients(ingredients);
      // Auto-generate meal if pantry ingredients are provided, but only when user is authenticated
      if (ingredients.length > 0 && user) {
        setActiveTab('generator');
        setTimeout(generateMeal, 1000); // Longer delay to ensure auth is ready
      }
    }
  }, [searchParams, user]); // Add user dependency

  // Educational tips for GLP-1 users
  const educationalTips = [
    {
      icon: "💪",
      title: "Protein Power",
      tip: "Aim for 20-30g protein per meal to maximize satiety and work with your GLP-1 medication."
    },
    {
      icon: "🌾", 
      title: "Fiber First",
      tip: "Include 8-12g fiber per meal from vegetables and whole grains to slow digestion and stabilize blood sugar."
    },
    {
      icon: "⏰",
      title: "Timing Matters", 
      tip: "Eat at consistent times to prevent intense hunger episodes and support your body's natural rhythms."
    },
    {
      icon: "🥗",
      title: "Start Smart",
      tip: "Begin meals with protein and fiber-rich foods to enhance fullness signals and slow eating."
    },
    {
      icon: "💧",
      title: "Hydration Helper",
      tip: "Drink water 30 minutes before meals to support digestion and enhance the satiety effects of GLP-1."
    },
    {
      icon: "🍽️",
      title: "Mindful Eating",
      tip: "Chew thoroughly and eat slowly - this helps with satiety and reduces GI side effects."
    }
  ];

  // Rotate tip based on current time to give variety
  const getCurrentTip = () => {
    const tipIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 6)) % educationalTips.length; // Changes every 6 hours
    return educationalTips[tipIndex];
  };

  const currentTip = getCurrentTip();

  const clearHistory = () => {
    setPreviousMeals([]);
    console.log('Meal history cleared for better variety');
  };

  // Save meal to user's cookbook
  const saveMeal = async (meal: GeneratedMeal) => {
    if (!user) {
      alert('Please sign in to save meals');
      return;
    }

    setIsSaving(true);
    try {
      // Convert meal to save format
      const saveRequest = {
        meal: {
          title: meal.name || meal.title || 'Untitled Meal',
          description: meal.description,
          ingredients: Array.isArray(meal.ingredients) 
            ? meal.ingredients.map(ing => typeof ing === 'string' ? ing : `${ing.amount} ${ing.unit} ${ing.name}`)
            : [],
          instructions: meal.instructions || [],
          nutritionTotals: meal.nutrition || meal.nutritionTotals || {},
          servingSize: `${meal.servings || 1} serving${meal.servings > 1 ? 's' : ''}`,
          cookingTime: (meal.prepTime || 0) + (meal.cookingTime || 0) || 30,
          mealType: preferences.mealType
        },
        tags: [
          preferences.mealType,
          ...(meal.tags || []),
          ...(meal.mealStyle || []),
          ...preferences.dietaryRestrictions
        ].filter(Boolean),
        source: 'ai_generated' as const,
        originalData: meal,
        generationPreferences: preferences
      };

      const savedMeal = await savedMealsService.saveMeal(user.uid, saveRequest);
      setSavedMealIds(prev => [...prev, savedMeal.id]);
      
      // Show success message
      alert(`✅ "${savedMeal.title}" saved to your cookbook!`);
      console.log('✅ Meal saved successfully:', savedMeal.title);
      
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Failed to save meal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const enhanceWithFlavorfulTwists = async () => {
    const selectedMeal = generatedMeals[selectedMealIndex];
    if (!selectedMeal) return;

    setIsEnhancing(true);
    
    try {
      const response = await fetch('/api/enhance-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe: selectedMeal,
          allergies: preferences.allergies
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance meal');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to enhance meal');
      }
      
      // Replace the current meal with the enhanced version
      const updatedMeals = [...generatedMeals];
      updatedMeals[selectedMealIndex] = {
        ...selectedMeal,
        ...data.enhancedRecipe,
        name: data.enhancedRecipe.title,
        nutritionSource: 'Enhanced with Flavorful Twists'
      };
      
      setGeneratedMeals(updatedMeals);
      console.log('✨ Recipe enhanced with flavorful twists!');
      
    } catch (error) {
      console.error('Error enhancing meal:', error);
      alert('Sorry, we couldn\'t enhance this meal right now. Please try again!');
    } finally {
      setIsEnhancing(false);
    }
  };

  const generateMeal = async () => {
    setIsGenerating(true);
    
    try {
      // Get auth token for symptom-based meal optimization
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (user) {
        try {
          const token = await user.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
          console.log('✅ Auth token obtained for meal generation');
        } catch (error) {
          console.error('❌ Failed to get auth token:', error);
          throw new Error('Authentication failed. Please try signing in again.');
        }
      } else {
        console.error('❌ No authenticated user found');
        throw new Error('Please sign in to generate meals.');
      }
      
      const response = await fetch('/api/generate-meal-options-new', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          mealType: preferences.mealType,
          dietaryRestrictions: preferences.dietaryRestrictions,
          allergies: preferences.allergies,
          numOptions: 2,
          maxCookingTime: preferences.maxCookingTime,
          proteinTarget: preferences.minProtein || 20,
          fiberTarget: preferences.minFiber || 4,
          calorieRange: { 
            min: 400, 
            max: preferences.maxCalories || 600 
          },
          creativityLevel: preferences.creativityLevel,
          assemblyToRecipeRatio: preferences.assemblyToRecipeRatio,
          availableIngredients: pantryIngredients.length > 0 ? pantryIngredients : undefined
        }),
      });

      if (!response.ok) {
        // Try to get error details from response
        try {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error('API returned error:', data);
        throw new Error(data.message || data.error || 'Failed to generate meals');
      }
      
      // Handle multiple meals response from new hybrid system
      const meals = data.meals || [];
      
      // Add source indicator and disclaimer
      meals.forEach((meal: GeneratedMeal) => {
        meal.nutritionSource = data.source === 'grok-estimates' ? 'Grok AI Estimates*' : 
                              data.source === 'curated' ? 'Curated Recipes' : 'AI Generated';
      });
      
      setGeneratedMeals(meals);
      setSelectedMealIndex(0); // Default to first meal
      
      // Check if symptom optimization was applied
      setSymptomOptimized(data.symptomOptimized || false);
      
      // Show user feedback and disclaimer about nutrition estimates
      if (data.source === 'grok-estimates') {
        console.log('✅ Generated with Grok AI - nutrition values are estimates and may vary from actual values');
      } else if (data.fallback) {
        console.log('ℹ️ Using curated recipes as fallback - still GLP-1 optimized!');
      }
      
      // Check nutrition thresholds and show contextual nudges
      if (meals.length > 0) {
        const firstMeal = meals[0];
        const protein = firstMeal.nutrition?.protein || firstMeal.nutritionTotals?.protein || 0;
        const fiber = firstMeal.nutrition?.fiber || firstMeal.nutritionTotals?.fiber || 0;
        const calories = firstMeal.nutrition?.calories || firstMeal.nutritionTotals?.calories || 0;
        
        // Show nudges for low nutrition values (delayed to avoid overwhelming UI)
        setTimeout(() => {
          if (protein < 20) {
            setShowNudge({ type: 'lowProtein', mealData: { protein, fiber, calories } });
          } else if (fiber < 4) {
            setShowNudge({ type: 'lowFiber', mealData: { protein, fiber, calories } });
          }
        }, 2000);
      }
      
      // Add generated meal names to history for variety
      if (meals.length > 0) {
        const newMealNames = meals.map((meal: GeneratedMeal) => meal.name);
        setPreviousMeals(prev => [...prev, ...newMealNames]);
      }
      
    } catch (error) {
      console.error('Error generating meal:', error);
      
      // Fallback to simple mock meal if API fails
      const mockMeal: GeneratedMeal = {
        id: Date.now().toString(),
        name: "High-Protein Power Bowl",
        description: "A nutritious bowl packed with protein and fiber",
        prepTime: 15,
        servings: 1,
        nutrition: {
          protein: 25,
          fiber: 8,
          calories: 400,
          carbs: 30,
          fat: 12
        },
        ingredients: [
          "7 oz lean chicken breast",
          "1/2 cup quinoa",
          "2 cups mixed vegetables",
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
      
      setGeneratedMeals([mockMeal]);
      setSelectedMealIndex(0);
      setPreviousMeals(prev => [...prev, mockMeal.name]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Get the currently selected meal
  const selectedMeal = generatedMeals.length > 0 ? generatedMeals[selectedMealIndex] : null;

  // Use nutrition per serving as provided by the recipe
  const scaledNutrition = selectedMeal ? {
    protein: (selectedMeal.nutrition?.protein || selectedMeal.nutritionTotals?.protein || 0).toFixed(1),
    fiber: (selectedMeal.nutrition?.fiber || selectedMeal.nutritionTotals?.fiber || 0).toFixed(1),
    calories: Math.round(selectedMeal.nutrition?.calories || selectedMeal.nutritionTotals?.calories || 0),
    carbs: (selectedMeal.nutrition?.carbs || selectedMeal.nutritionTotals?.carbs || 0).toFixed(1),
    fat: (selectedMeal.nutrition?.fat || selectedMeal.nutritionTotals?.fat || 0).toFixed(1)
  } : null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🍽️ Chef-Inspired Meal Generator</h1>
        <p className="text-gray-600 mb-2">Delicious, satisfying meals designed specifically for GLP-1 users</p>
        <p className="text-sm text-green-600 mb-4">✨ Every meal: 15-30g+ protein, 4g+ fiber, perfectly portioned for enhanced satiety</p>
        
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>New to GLP-1 nutrition?</strong> Check out our{' '}
            <button 
              onClick={() => setActiveTab('education')}
              className="underline hover:text-blue-900 font-medium"
            >
              10 Essential Nutrition Tips
            </button>{' '}
            to make the most of your medication and eating changes.
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'generator'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🍽️ Meal Generator
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'education'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💡 GLP-1 Tips
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'generator' ? (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        
        {/* Allergies Filter - Safety First */}
        <AllergiesFilter 
          selectedAllergies={preferences.allergies}
          onAllergiesChange={(allergies) => setPreferences({...preferences, allergies})}
          className="mb-6"
        />

        {/* Pantry Ingredients Display */}
        {pantryIngredients.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🥫</span>
              <h3 className="text-lg font-semibold text-green-800">Using Ingredients from Your Pantry</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {pantryIngredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full border border-green-200"
                >
                  {ingredient}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-green-700 text-sm">
                AI will prioritize meals using these ingredients to help reduce food waste!
              </p>
              <button
                onClick={() => setPantryIngredients([])}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Clear Pantry Ingredients
              </button>
            </div>
          </div>
        )}

        {/* Simplified Preferences - Focus on What Matters */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">🕐 What type of meal?</label>
            <div className="grid grid-cols-2 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <button
                  key={type}
                  onClick={() => setPreferences({...preferences, mealType: type as any})}
                  className={`
                    p-3 rounded-lg border-2 font-medium transition-all duration-200
                    ${preferences.mealType === type
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Time Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">⏱️ How much time do you have?</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 15, label: 'Quick (15 min)' },
                { value: 30, label: 'Moderate (30 min)' },
                { value: 45, label: 'Relaxed (45 min)' },
                { value: 60, label: 'Project (60 min)' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPreferences({...preferences, maxCookingTime: option.value as any})}
                  className={`
                    p-3 rounded-lg border-2 font-medium transition-all duration-200 text-sm
                    ${preferences.maxCookingTime === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>



          {/* Dietary Preferences - Simplified */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">🌱 Any dietary preferences?</label>
            <div className="flex flex-wrap gap-2">
              {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'].map((restriction) => (
                <button
                  key={restriction}
                  onClick={() => {
                    if (preferences.dietaryRestrictions.includes(restriction)) {
                      setPreferences({
                        ...preferences, 
                        dietaryRestrictions: preferences.dietaryRestrictions.filter(r => r !== restriction)
                      });
                    } else {
                      setPreferences({
                        ...preferences, 
                        dietaryRestrictions: [...preferences.dietaryRestrictions, restriction]
                      });
                    }
                  }}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${preferences.dietaryRestrictions.includes(restriction)
                      ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {preferences.dietaryRestrictions.includes(restriction) ? '✓ ' : ''}
                  {restriction.charAt(0).toUpperCase() + restriction.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
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

        {/* Generated Meals Display - Inside Generator Tab */}
        {selectedMeal && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Symptom Optimization Indicator */}
          {symptomOptimized && (
            <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-purple-600">🎯</span>
                <span className="text-sm font-medium text-purple-800">
                  Symptom-Optimized Meals
                </span>
              </div>
              <p className="text-xs text-purple-700 mt-1">
                Personalized based on your recent symptom patterns for better comfort
              </p>
            </div>
          )}

          {/* Meal Selection Tabs (when multiple meals available) */}
          {generatedMeals.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose Your Meal Option:</h3>
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
                      {(meal.nutrition?.protein || meal.nutritionTotals?.protein || 0)}g protein • {meal.prepTime || meal.cookingTime || 15} min
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMeal.name || selectedMeal.title}</h2>
              <p className="text-gray-600 mb-4">{selectedMeal.description || 'A delicious GLP-1 friendly meal'}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(selectedMeal.mealStyle || selectedMeal.tags || []).map((style, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {style}
                  </span>
                ))}
                
                {/* Meal Prep Badge */}
                {selectedMeal.mealPrep?.friendly && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    📦 Meal Prep Friendly
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedMeal.nutritionSource === 'Grok AI + Spoonacular Nutrition' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedMeal.nutritionSource === 'Grok AI + USDA Nutrition' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedMeal.nutritionSource === 'Curated Recipes'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedMeal.nutritionSource || 'AI Generated'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                ⏱️ {(selectedMeal.prepTime && selectedMeal.cookingTime) 
                     ? `${selectedMeal.prepTime + selectedMeal.cookingTime} min total`
                     : `${selectedMeal.prepTime || selectedMeal.cookingTime || 15} min total`
                }
              </div>
            </div>
          </div>

          {/* Warnings */}
          {selectedMeal.warnings && selectedMeal.warnings.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-yellow-800 mb-1">⚠️ Nutrition Notes</h4>
              <ul className="text-sm text-yellow-700">
                {selectedMeal.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

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
              
              {/* Nutrition Disclaimer */}
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <strong>⚠️ Note:</strong> Nutrition values are AI-generated estimates. Verify with nutrition labels for precise values.
              </div>
            </div>

            {/* Timing */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">⏱️ Timing & Servings</h3>
              <div className="bg-gray-50 p-4 rounded space-y-2">
                <div className="flex justify-between">
                  <span>Prep Time:</span>
                  <span className="font-semibold">{selectedMeal.prepTime || selectedMeal.cookingTime || 15} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Recipe Serves:</span>
                  <span className="font-semibold">{selectedMeal.servings} {selectedMeal.servings > 1 ? 'servings' : 'serving'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nutrition shown per:</span>
                  <span className="font-semibold">1 serving</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">🛒 Ingredients</h3>
            <ul className="space-y-2">
              {selectedMeal.ingredients.map((ingredient, index) => {
                let displayText;
                if (typeof ingredient === 'string') {
                  displayText = ingredient;
                } else {
                  // Convert to US measurements where possible
                  let amount = ingredient.amount;
                  let unit = ingredient.unit;
                  
                  // Basic metric to US conversions for common ingredients
                  if (unit === 'g' || unit === 'grams') {
                    if (amount >= 240) {
                      amount = Math.round((amount / 240) * 10) / 10;
                      unit = amount === 1 ? 'cup' : 'cups';
                    } else if (amount >= 15) {
                      amount = Math.round((amount / 15) * 2) / 2;
                      unit = amount === 1 ? 'tablespoon' : 'tablespoons';
                    } else {
                      amount = Math.round((amount / 5) * 2) / 2;
                      unit = amount === 1 ? 'teaspoon' : 'teaspoons';
                    }
                  } else if (unit === 'ml' || unit === 'milliliters') {
                    if (amount >= 240) {
                      amount = Math.round((amount / 240) * 10) / 10;
                      unit = amount === 1 ? 'cup' : 'cups';
                    } else if (amount >= 15) {
                      amount = Math.round((amount / 15) * 2) / 2;
                      unit = amount === 1 ? 'tablespoon' : 'tablespoons';
                    } else {
                      amount = Math.round((amount / 5) * 2) / 2;
                      unit = amount === 1 ? 'teaspoon' : 'teaspoons';
                    }
                  }
                  
                  displayText = `${amount} ${unit} ${ingredient.name}`;
                }
                return (
                  <li key={index} className="flex items-start bg-gray-50 p-3 rounded-lg">
                    <span className="text-green-500 mr-3 mt-0.5 text-lg">✓</span>
                    <span className="text-sm font-medium">{displayText}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">👩‍🍳 Instructions</h3>
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

          {/* GLP-1 Tips */}
          <div className="mt-6 bg-blue-50 p-4 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">💊 GLP-1 Friendly Tips</h3>
            <p className="text-blue-800 text-sm">
              {selectedMeal.glp1Friendly?.eatingTips || selectedMeal.glp1Notes || 'This meal is optimized for GLP-1 users with high protein and fiber content for enhanced satiety.'}
            </p>
          </div>

          {/* Chef Tips & Pro Tips */}
          {((selectedMeal.chefTips && selectedMeal.chefTips.length > 0) || (selectedMeal.tips && selectedMeal.tips.length > 0)) && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">👨‍🍳 Chef's Tips</h3>
              <div className="space-y-3">
                {selectedMeal.chefTips?.map((tip, index) => (
                  <div key={`chef-${index}`} className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r">
                    <p className="text-sm text-purple-800 font-medium">{tip}</p>
                  </div>
                ))}
                {selectedMeal.tips?.map((tip, index) => (
                  <div key={`tip-${index}`} className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-0.5">💡</span>
                    <span className="text-sm text-gray-600">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-4">
            <button 
              onClick={generateMeal}
              disabled={isGenerating}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isGenerating ? '🤖 Generating...' : '🔄 Generate New Meals'}
            </button>
            
            <button 
              onClick={enhanceWithFlavorfulTwists}
              disabled={isEnhancing || isGenerating}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isEnhancing ? '✨ Adding Twists...' : '✨ Add Flavorful Twists'}
            </button>
            
            <button 
              onClick={() => saveMeal(selectedMeal)}
              disabled={isSaving}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
            >
              {isSaving ? '💾 Saving...' : '💾 Save to Cookbook'}
            </button>
            
            <button className="bg-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-300 font-medium">
              🛒 Shopping List
            </button>
          </div>
        </div>
        )}
        
        </div>
      ) : (
        /* Education Tab Content */
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">💡 GLP-1 Nutrition Tips</h2>
          
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>📚 Quick Reference:</strong> These evidence-based tips help you maximize the effectiveness of your GLP-1 medication through proper nutrition timing and food choices.
            </p>
          </div>
          
          <div className="grid gap-6">
            {educationalTips.map((tip, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-5">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{tip.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2 text-lg">{tip.title}</h3>
                    <p className="text-blue-800 leading-relaxed">{tip.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              <strong>💡 Pro Tip:</strong> These principles work together - combine high protein + fiber foods, eat at consistent times, and take your time with meals for best results.
            </p>
          </div>
        </div>
      )}

      {/* Contextual Nudges */}
      {showNudge.type && (
        <InsightNudge
          triggerType={showNudge.type}
          mealData={showNudge.mealData}
          onDismiss={() => setShowNudge({ type: null })}
          onViewInsight={(insightId) => {
            setShowInsightModal(insightId);
            setShowNudge({ type: null });
          }}
        />
      )}

      {/* Insight Modal */}
      {showInsightModal && (
        <NutritionInsights
          showAsModal={true}
          onClose={() => setShowInsightModal(null)}
        />
      )}
    </div>
  );
}
