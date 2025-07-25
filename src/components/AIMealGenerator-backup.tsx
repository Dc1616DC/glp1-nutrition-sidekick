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
  nutritionSource?: string; // Show Spoonacular vs AI fallback nutrition
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
      
      // Fallback to mock meal if API fails
      const mockMeal: GeneratedMeal = {
        id: Date.now().toString(),
        name: generateUniqueMealName(),
        description: "A delicious, high-protein meal perfect for GLP-1 users",
        cookingTime: preferences.cookingTime === '5min' ? 5 : 
                     preferences.cookingTime === '15min' ? 15 : 
                     preferences.cookingTime === '30min' ? 30 : 25,
        prepTime: 10,
        servings: preferences.mealStyle === 'meal-prep' ? 4 : 1,
        nutrition: {
          protein: Math.floor(Math.random() * 15) + 20, // 20-35g protein
          fiber: Math.floor(Math.random() * 8) + 4,     // 4-12g fiber
          calories: Math.floor(Math.random() * 200) + 300, // 300-500 calories
          carbs: Math.floor(Math.random() * 20) + 15,   // 15-35g carbs
          fat: Math.floor(Math.random() * 10) + 8       // 8-18g fat
        },
        ingredients: generateIngredients(),
        instructions: generateInstructions(),
        tips: [
          "Eat slowly and mindfully to help with satiety",
          "This meal is designed to keep you full longer",
          "Can be stored in the fridge for up to 3 days"
        ],
        mealStyle: getMealStyleTags(),
        glp1Friendly: {
          eatingTips: "Chew thoroughly and put your fork down between bites - this helps with satiety"
        }
      };
      
      setGeneratedMeal(mockMeal);
      setPreviousMeals(prev => [...prev, mockMeal.name]);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearHistory = () => {
    setPreviousMeals([]);
    console.log('Meal history cleared for better variety');
  };
    const proteinNames: Record<string, string[]> = {
      'chicken': ['Herb-Crusted Chicken', 'Garlic Chicken', 'Mediterranean Chicken', 'Spicy Chicken'],
      'turkey': ['Turkey Power Bowl', 'Herb Turkey', 'Turkey Meatballs', 'Ground Turkey Skillet'],
      'fish': ['Salmon Filet', 'Cod with Herbs', 'Tuna Steaks', 'White Fish Bake'],
      'tofu': ['Crispy Tofu', 'Marinated Tofu', 'Tofu Scramble', 'Baked Tofu'],
      'eggs': ['Veggie Omelet', 'Egg Bowl', 'Frittata', 'Scrambled Eggs'],
      'beans': ['Bean Power Bowl', 'Lentil Curry', 'Chickpea Salad', 'Black Bean Bowl'],
      'greek-yogurt': ['Greek Yogurt Parfait', 'Protein Smoothie Bowl', 'Yogurt Bowl', 'Protein Parfait'],
      'any': ['Protein Power Bowl', 'High-Fiber Meal', 'Balanced Plate', 'Nutritious Bowl']
    };

    const mealStyles: Record<string, string> = {
      'one-pot': 'One-Pot',
      'sheet-pan': 'Sheet Pan',
      'meal-prep': 'Meal Prep',
      'quick': 'Quick',
      'any': ''
    };

    const vegetables = ['with Roasted Vegetables', 'and Garden Veggies', 'with Rainbow Vegetables', 'and Fresh Greens'];
    
    const protein = preferences.proteinSource || 'any';
    const style = mealStyles[preferences.mealStyle] || '';
    const veggie = vegetables[Math.floor(Math.random() * vegetables.length)];
    
    const baseNames = proteinNames[protein] || proteinNames['any'];
    const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
    
    let fullName = `${style} ${baseName} ${veggie}`.trim();
    
    // Ensure uniqueness
    let counter = 1;
    while (previousMeals.includes(fullName)) {
      fullName = `${style} ${baseName} ${veggie} (Variation ${counter})`.trim();
      counter++;
    }
    
    return fullName;
  };

  const generateIngredients = (): string[] => {
    const baseIngredients = [
      '6 oz lean protein source',
      '2 cups mixed vegetables',
      '1 tbsp olive oil',
      'Salt and pepper to taste',
      '1 clove garlic, minced',
      '1/2 cup whole grains or legumes'
    ];

    if (preferences.proteinSource === 'chicken') {
      baseIngredients[0] = '6 oz boneless, skinless chicken breast';
    } else if (preferences.proteinSource === 'tofu') {
      baseIngredients[0] = '6 oz extra-firm tofu, cubed';
    }

    return baseIngredients;
  };

  const generateInstructions = (): string[] => {
    return [
      'Preheat oven to 400°F if using oven method',
      'Prepare protein by seasoning with salt, pepper, and herbs',
      'Cut vegetables into uniform pieces for even cooking',
      'Heat olive oil in pan or arrange on sheet pan',
      'Cook protein until internal temperature reaches safe levels',
      'Add vegetables and cook until tender-crisp',
      'Season to taste and serve immediately'
    ];
  };

  const getMealStyleTags = (): string[] => {
    const tags = ['High Protein', 'High Fiber', 'GLP-1 Friendly'];
    
    if (preferences.cookingTime === '5min') tags.push('5-Minute');
    if (preferences.cookingTime === '15min') tags.push('15-Minute');
    if (preferences.cookingTime === '30min') tags.push('30-Minute');
    if (preferences.mealStyle === 'one-pot') tags.push('One-Pot');
    if (preferences.mealStyle === 'sheet-pan') tags.push('Sheet Pan');
    if (preferences.mealStyle === 'meal-prep') tags.push('Meal Prep');
    if (preferences.dietaryRestriction === 'vegetarian') tags.push('Vegetarian');
    
    return tags;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Meal Generator</h1>
      <p className="text-gray-600 mb-8">
        Generate high-protein (20g+), high-fiber (4g+) meals tailored for GLP-1 users
      </p>

      {/* Preferences Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Meal Preferences</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Type
            </label>
            <select 
              value={preferences.mealType}
              onChange={(e) => setPreferences(prev => ({ ...prev, mealType: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* Cooking Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cooking Time
            </label>
            <select 
              value={preferences.cookingTime}
              onChange={(e) => setPreferences(prev => ({ ...prev, cookingTime: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="any">Any Time</option>
              <option value="5min">5 Minutes or Less</option>
              <option value="15min">15 Minutes or Less</option>
              <option value="30min">30 Minutes or Less</option>
              <option value="batch">Batch Cooking</option>
            </select>
          </div>

          {/* Meal Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Style
            </label>
            <select 
              value={preferences.mealStyle}
              onChange={(e) => setPreferences(prev => ({ ...prev, mealStyle: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="any">Any Style</option>
              <option value="quick">Quick & Easy</option>
              <option value="one-pot">One-Pot Meal</option>
              <option value="sheet-pan">Sheet Pan</option>
              <option value="meal-prep">Meal Prep</option>
            </select>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Preferences
            </label>
            <select 
              value={preferences.dietaryRestriction}
              onChange={(e) => setPreferences(prev => ({ ...prev, dietaryRestriction: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Protein
            </label>
            <select 
              value={preferences.proteinSource}
              onChange={(e) => setPreferences(prev => ({ ...prev, proteinSource: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
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

          {/* Cuisine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine Style
            </label>
            <select 
              value={preferences.preferredCuisine}
              onChange={(e) => setPreferences(prev => ({ ...prev, preferredCuisine: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
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

        <button
          onClick={generateMeal}
          disabled={isGenerating}
          className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mr-4"
        >
          {isGenerating ? 'Generating with AI...' : 'Generate Meal'}
        </button>
        
        {previousMeals.length > 0 && (
          <button
            onClick={() => setPreviousMeals([])}
            className="mt-6 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600"
            title={`Clear history of ${previousMeals.length} previous meals`}
          >
            Clear History ({previousMeals.length})
          </button>
        )}
      </div>

      {/* Generated Meal */}
      {generatedMeal && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{generatedMeal.name}</h2>
              <p className="text-gray-600 mt-1">{generatedMeal.description}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>Prep: {generatedMeal.prepTime}min</div>
              <div>Cook: {generatedMeal.cookingTime}min</div>
              <div>Serves: {generatedMeal.servings}</div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {generatedMeal.mealStyle.map((tag, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                {tag}
              </span>
            ))}
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
